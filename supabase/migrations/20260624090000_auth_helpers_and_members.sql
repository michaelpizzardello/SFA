-- Phase 1.1 — Auth helper functions + gallery_members (access source of truth)
--
-- Role model:
--   * super-admin  = auth.users.app_metadata.role = 'super_admin' (set via Admin API, never client-writable)
--   * gallery user = a row in public.gallery_members linking auth.users -> galleries
--   * service-role = legacy admin during transition; has no auth.uid(), bypasses RLS entirely
--
-- All helper functions are SECURITY DEFINER + STABLE with a pinned search_path so they can be
-- referenced safely from RLS policies and triggers without recursive-policy or search_path attacks.

create extension if not exists pgcrypto;

-- True when the current request carries the super_admin role claim.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin', false);
$$;

-- Tolerant uuid cast: returns null instead of raising on malformed text.
-- Used by storage policies so legacy date-prefixed object paths deny cleanly instead of erroring.
create or replace function public.safe_uuid(value text)
returns uuid
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
begin
  return value::uuid;
exception when others then
  return null;
end;
$$;

-- Membership join table: the single source of truth for which user may edit which gallery.
create table if not exists public.gallery_members (
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (gallery_id, user_id)
);

create index if not exists gallery_members_user_idx on public.gallery_members (user_id);

-- True when the current user is a member of the given gallery.
-- DEFINER so it can read gallery_members regardless of that table's own RLS.
create or replace function public.is_gallery_member(target_gallery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.gallery_members m
    where m.gallery_id = target_gallery_id
      and m.user_id = auth.uid()
  );
$$;

-- gallery_members is itself protected: a user sees only their own memberships; super-admin sees all.
alter table public.gallery_members enable row level security;

drop policy if exists gallery_members_self_read on public.gallery_members;
create policy gallery_members_self_read on public.gallery_members
  for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists gallery_members_admin_all on public.gallery_members;
create policy gallery_members_admin_all on public.gallery_members
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());
