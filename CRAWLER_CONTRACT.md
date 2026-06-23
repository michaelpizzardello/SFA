# Crawler Contract — Codex auto-import integration

The Codex automation that crawls gallery websites + Instagram must follow this contract. It is the
**only** interface it needs. It never writes live exhibitions directly; it appends **candidates**, and
a database function (`merge_exhibition_candidates`) is the sole, non-destructive path into live rows.

## Why this shape
Galleries edit their own listings in the SAF dashboard. The merge enforces, in the database, that
auto-import **adds new shows and refreshes only un-touched auto rows** — it never overwrites a field a
gallery has edited, never touches manual rows, never deletes, and respects each gallery's on/off toggle.
So the crawler can run freely without ever clobbering human edits.

## 1. Auth
Use a scoped key for the Postgres `importer` role (INSERT-only on `exhibition_candidates`, SELECT on
`crawl_targets`). Until that key is provisioned you may insert candidates with the service-role key, but
**only** into `exhibition_candidates` — never into `admin_exhibitions` or `galleries`.

## 2. Discover what to crawl
`GET /rest/v1/crawl_targets` → rows of:
```
{ gallery_id, source_host, instagram_handle, crawl_website, crawl_instagram }
```
Only crawl a source where its flag is true. Rows appear only for galleries that are verified-mapped,
auto-import-enabled, and not admin-hidden. Host normalization (both sides): lowercase, strip scheme and
trailing slash, **keep the subdomain** (`gallery.redbaseart.com` ≠ `redbaseart.com`).

## 3. Insert candidates
`POST /rest/v1/exhibition_candidates`, **one row per distinct exhibition** (split multi-show pages using
their per-show detail URLs). Required: `external_ref`, `source_url`, `source_platform`,
`exhibition_name`, `start_date`. Send `gallery_id = null` (the merge resolves it from the verified
`gallery_sources` map; sending an id is rejected by RLS for the importer role).

```json
{
  "match_website": "gallery.redbaseart.com",
  "match_instagram": "redbaseau",
  "external_ref": "web:<sha1(detail_url)>   // or ig:<shortcode>",
  "detail_url": "https://gallery.redbaseart.com/event/121/the-disappeared-and-the-lost",
  "source_url": "https://gallery.redbaseart.com/event/121/the-disappeared-and-the-lost",
  "source_platform": "website",
  "exhibition_name": "Stephan Kaluza: The Disappeared and the Lost",
  "artist": "Stephan Kaluza",
  "start_date": "2026-06-27",
  "end_date": null,
  "opening_information": "Opening Sat 27 June 5–7 PM",
  "low_confidence_fields": ["end_date"],
  "crawl_batch_id": "2026-06-24",
  "crawl_source_ok": true,
  "raw": {}
}
```

Rules:
- `external_ref` is a stable provenance tag. Website: `web:` + sha1 of the normalized **detail URL**
  (never hash the title — corrected titles must not fork into a new row). Instagram: `ig:<shortcode>`.
- **Classify out non-exhibitions** (closures, calls for entry, wrong-gallery posts). Don't send them.
- Flag uncertain/conflicting fields in `low_confidence_fields`.
- On a failed/blocked fetch, set `crawl_source_ok=false` (so future "vanished" handling doesn't misfire).
- Keep `raw` under 64 KB.

## 4. Merge
The merge runs on a schedule (or you may POST an enqueue RPC if provisioned). You have **no** merge
responsibility. What the merge does with your candidate:
- resolves the gallery via the verified source map (unmatched → parked for super-admin triage);
- skips if the gallery toggled that source off;
- de-dupes by `source_platform:external_ref` overlap with existing `source_refs`;
- inserts a new `auto` row (website from a verified source publishes live; Instagram/low-confidence
  stays draft for owner review), or refreshes only the **un-edited** fields of an existing `auto` row;
- never modifies `manual` / `auto_edited` rows or any owner-edited field, and never deletes.

## 5. Super-admin onboarding (one-time per gallery)
For a gallery's sources to auto-resolve, a super-admin must add **verified** rows to `gallery_sources`
(`gallery_id`, `source_host` and/or `instagram_handle`, `verified=true`). Unverified/unmapped sources
park candidates as `unmatched` rather than guessing — this is the anti-spoofing boundary.
