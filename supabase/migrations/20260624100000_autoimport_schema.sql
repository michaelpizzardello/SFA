-- Phase 5.1 — Auto-import schema: provenance + per-field locks, per-gallery toggles, the staging
-- table the crawler writes to, the verified source map, and the INSERT-only importer role.

-- Provenance + locking on the live exhibitions table.
alter table public.admin_exhibitions
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'auto', 'auto_edited')),
  add column if not exists source_refs jsonb not null default '[]'::jsonb,  -- array of provenance tags
  add column if not exists source_url text,
  add column if not exists source_platform text check (source_platform in ('website', 'instagram', 'other')),
  add column if not exists last_synced_at timestamptz,
  add column if not exists synced_payload_hash text,
  add column if not exists owner_edited_fields text[] not null default '{}',
  add column if not exists needs_review boolean not null default false,
  add column if not exists needs_review_reason text;

create index if not exists admin_exhibitions_source_refs_gin
  on public.admin_exhibitions using gin (source_refs jsonb_path_ops);

-- Single source of truth for which fields an owner edit locks against auto-refresh.
create or replace function public.lockable_fields()
returns text[]
language sql
immutable
set search_path = pg_catalog, public
as $$
  select array['exhibition_name','artist','summary','start_date','end_date',
               'opening_information','image_url','cost','location'];
$$;

-- Per-gallery auto-import controls.
alter table public.galleries
  add column if not exists auto_import_enabled boolean not null default true,
  add column if not exists auto_import_sources jsonb not null default '{"website":true,"instagram":true}'::jsonb,
  add column if not exists review_before_publish boolean not null default false;

-- Verified mapping from crawl sources to galleries (anti-spoof: only verified rows resolve).
create table if not exists public.gallery_sources (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  source_host text,            -- full normalized host incl. subdomain
  instagram_handle text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists gallery_sources_gallery_idx on public.gallery_sources (gallery_id);
create index if not exists gallery_sources_host_idx on public.gallery_sources (source_host);
create index if not exists gallery_sources_ig_idx on public.gallery_sources (instagram_handle);

create or replace view public.crawl_targets
  with (security_invoker = true)
as
  select gs.gallery_id, gs.source_host, gs.instagram_handle,
         coalesce((g.auto_import_sources ->> 'website')::boolean, false) as crawl_website,
         coalesce((g.auto_import_sources ->> 'instagram')::boolean, false) as crawl_instagram
  from public.gallery_sources gs
  join public.galleries g on g.id = gs.gallery_id
  where gs.verified = true
    and g.auto_import_enabled = true
    and g.hidden_by_admin = false;

-- Staging table — the ONLY thing the crawler writes. Merge is the only path to live tables.
create table if not exists public.exhibition_candidates (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references public.galleries(id) on delete cascade,
  match_website text,
  match_instagram text,
  external_ref text not null,
  detail_url text,
  source_url text not null,
  source_platform text not null check (source_platform in ('website', 'instagram', 'other')),
  raw jsonb not null default '{}'::jsonb,
  exhibition_name text,
  artist text,
  summary text,
  start_date date,
  end_date date,
  opening_information text,
  image_url text,
  cost text,
  location text,
  low_confidence_fields text[] not null default '{}',
  crawl_batch_id text,
  crawl_source_ok boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'merged', 'skipped', 'unmatched', 'suggested', 'rejected', 'error')),
  status_detail text,
  merged_exhibition_id uuid references public.admin_exhibitions(id) on delete set null,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint raw_size_chk check (pg_column_size(raw) < 65536)
);
create index if not exists exhibition_candidates_status_idx on public.exhibition_candidates (status, created_at);

-- Owner-facing suggested updates for locked fields.
create table if not exists public.exhibition_suggestions (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  exhibition_id uuid not null references public.admin_exhibitions(id) on delete cascade,
  field text not null,
  current_value text,
  suggested_value text,
  source_url text,
  status text not null default 'open' check (status in ('open', 'accepted', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Lock down candidate/suggestion tables: never public; owners see only their own.
alter table public.exhibition_candidates enable row level security;
alter table public.exhibition_suggestions enable row level security;
revoke all on public.exhibition_candidates from anon, authenticated;
revoke all on public.exhibition_suggestions from anon, authenticated;

drop policy if exists cand_owner_read on public.exhibition_candidates;
create policy cand_owner_read on public.exhibition_candidates for select to authenticated
  using (
    public.is_super_admin()
    or gallery_id in (select gallery_id from public.gallery_members where user_id = auth.uid())
  );

drop policy if exists sug_owner_read on public.exhibition_suggestions;
create policy sug_owner_read on public.exhibition_suggestions for select to authenticated
  using (
    public.is_super_admin()
    or gallery_id in (select gallery_id from public.gallery_members where user_id = auth.uid())
  );

-- INSERT-only importer role for the crawler (off service-role).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'importer') then
    create role importer nologin;
  end if;
end $$;

grant usage on schema public to importer;
grant insert on public.exhibition_candidates to importer;
grant select on public.crawl_targets to importer;

drop policy if exists importer_insert_only on public.exhibition_candidates;
create policy importer_insert_only on public.exhibition_candidates for insert to importer
  with check (
    status = 'pending'
    and external_ref is not null
    and source_url is not null
    and exhibition_name is not null
    and start_date is not null
    and gallery_id is null
    and pg_column_size(raw) < 65536
  );
