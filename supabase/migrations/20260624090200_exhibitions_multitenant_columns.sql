-- Phase 1.3 — Additive ownership / visibility columns on admin_exhibitions.
--
-- gallery_id is the authorization key (FK -> galleries). gallery_slug / gallery_name stay NOT NULL
-- and become system-derived (see guard trigger) so public slug-based joins keep working unchanged.
-- published (owner-controlled) + hidden_by_admin (super-admin-only) form the visibility predicate.

alter table public.admin_exhibitions
  add column if not exists gallery_id      uuid references public.galleries(id) on delete cascade,
  add column if not exists owner_id        uuid references auth.users(id) on delete set null,
  add column if not exists published       boolean not null default true,
  add column if not exists hidden_by_admin boolean not null default false,
  add column if not exists created_by      uuid,
  add column if not exists updated_by      uuid;

-- Owner-created exhibitions do not use the super-admin weekly model, so these become optional.
alter table public.admin_exhibitions
  alter column week_start  drop not null,
  alter column week_end    drop not null,
  alter column gallery_mode set default 'index';

create index if not exists admin_exhibitions_gallery_id_idx on public.admin_exhibitions (gallery_id);
create index if not exists admin_exhibitions_published_idx on public.admin_exhibitions (published, hidden_by_admin);
