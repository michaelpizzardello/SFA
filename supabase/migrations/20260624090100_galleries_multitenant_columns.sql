-- Phase 1.2 — Additive ownership / branding / moderation columns on galleries.
-- All additive with safe defaults: existing rows and the legacy admin keep working unchanged.

alter table public.galleries
  add column if not exists owner_id        uuid references auth.users(id) on delete set null, -- display-only primary owner
  add column if not exists logo_url        text not null default '',
  add column if not exists cover_url       text not null default '',
  add column if not exists is_claimed      boolean not null default false,  -- true once an invited owner sets a password
  add column if not exists hidden_by_admin boolean not null default false,  -- super-admin moderation lever
  add column if not exists created_by      uuid,
  add column if not exists updated_by      uuid;

create index if not exists galleries_owner_idx on public.galleries (owner_id);
create index if not exists galleries_hidden_idx on public.galleries (hidden_by_admin);
