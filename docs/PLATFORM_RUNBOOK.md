# SAF Platform — Apply & Verify Runbook

Operational steps that need network access to the Supabase project
(`hkuanjcxbebrzdwayltb`, "sydneyartfinder") and therefore **cannot be run from the build
sandbox**. Run these from a machine with access to the project.

## 0. One-time Supabase config (dashboard)

- **Auth → Providers → Email**: enable email; decide confirm-email on/off.
- **Auth → SMTP**: configure a custom SMTP provider (Resend / Postmark / SES). The built-in
  SMTP is rate-limited and not for production invite/reset mail.
- **Auth → URL Configuration → Redirect URLs**: add
  `http://localhost:3000/auth/callback`, `https://<prod-domain>/auth/callback`,
  and the dashboard origins (`/dashboard/*`, set-password).
- **Auth → Email Templates**: brand the **Invite user** and **Reset password** templates.
- **Seed the super-admin** (service-role / SQL):
  ```sql
  -- after the user exists (sign up once with your email), grant the role:
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"super_admin"}'::jsonb
   where email = 'you@example.com';
  ```
  (`app_metadata.role` is read by `public.is_super_admin()`; it is never client-writable.)

## 1. Apply migrations

Migrations live in `supabase/migrations/` and are ordered by filename. Apply in order. All are
additive / idempotent-friendly; the legacy service-role admin keeps working throughout because
service-role bypasses RLS.

Option A — Supabase CLI (recommended):
```bash
brew install supabase/tap/supabase      # if not installed
supabase link --project-ref hkuanjcxbebrzdwayltb
supabase db push                        # applies pending migrations in supabase/migrations
```

Option B — psql against the pooler/direct connection string:
```bash
for f in supabase/migrations/20260624*.sql; do echo ">> $f"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done
```

> The `20260624090300_backfill_gallery_ids.sql` step **raises and aborts** if any exhibition
> can't be resolved to a gallery (blank `gallery_slug`). That's intentional — inspect and fix
> the data, then re-run; do not weaken the assertion.

## 2. Verify Phase 1 (RLS isolation) — run as the listed role

```sql
-- helpers resolve
select public.is_super_admin();                 -- false unless your JWT has the claim
-- visibility views never leak hidden content
select count(*) from public.public_exhibitions
 where gallery_id in (select id from public.galleries where hidden_by_admin);  -- expect 0

-- as an ordinary gallery user (authenticated JWT, member of gallery A):
--   * can select/update own rows; cannot see/modify gallery B's rows
--   * update attempts on featured/hidden_by_admin/gallery_id silently no-op (guard pins to OLD)
--   * insert with gallery_id of B is rejected by RLS with-check
-- as service-role: everything still readable/writable (legacy admin unaffected)
```

Local syntax validation already run in CI/dev via `pgsql-parser` (real Postgres grammar):
```bash
node --input-type=module -e 'import {parse} from "pgsql-parser"; import {readFileSync,readdirSync} from "node:fs"; for (const f of readdirSync("supabase/migrations").filter(x=>x.endsWith(".sql")).sort()) await parse(readFileSync("supabase/migrations/"+f,"utf8"));'
```

## 3. Cutover (Phase 4) & crawler interlock (Phase 5)

- Rotate `SUPABASE_SERVICE_ROLE_KEY` and remove `SAF_ADMIN_PASSWORD` / `SAF_ADMIN_SESSION_SECRET`
  only **after** the new super-admin auth path is verified.
- Crawler: ship `exhibition_candidates` + `importer` key → migrate the Codex repo to it
  (`CRAWLER_CONTRACT.md`) → **then** revoke the crawler's service-role write to `admin_exhibitions`
  → **then** enable the merge job. Run provenance backfill last.
