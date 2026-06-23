-- Phase 1.7 — Enable RLS + policies on galleries and admin_exhibitions.
--
-- service-role (legacy admin, SSR reads, sync script) bypasses RLS, so the current site keeps working
-- through the whole transition. These policies govern the new authenticated (gallery-user) paths and
-- the anon backstop.

-- ---------- galleries ----------
alter table public.galleries enable row level security;

drop policy if exists galleries_public_read on public.galleries;
create policy galleries_public_read on public.galleries
  for select
  using (hidden_by_admin = false);

drop policy if exists galleries_member_read on public.galleries;
create policy galleries_member_read on public.galleries
  for select
  using (public.is_gallery_member(id) or public.is_super_admin());

drop policy if exists galleries_member_update on public.galleries;
create policy galleries_member_update on public.galleries
  for update
  using (public.is_gallery_member(id))
  with check (public.is_gallery_member(id));

drop policy if exists galleries_admin_all on public.galleries;
create policy galleries_admin_all on public.galleries
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------- admin_exhibitions ----------
alter table public.admin_exhibitions enable row level security;

drop policy if exists exhibitions_public_read on public.admin_exhibitions;
create policy exhibitions_public_read on public.admin_exhibitions
  for select
  using (
    published = true
    and hidden_by_admin = false
    and exists (
      select 1 from public.galleries g
      where g.id = admin_exhibitions.gallery_id
        and g.hidden_by_admin = false
    )
  );

drop policy if exists exhibitions_member_read on public.admin_exhibitions;
create policy exhibitions_member_read on public.admin_exhibitions
  for select
  using (public.is_gallery_member(gallery_id) or public.is_super_admin());

drop policy if exists exhibitions_member_insert on public.admin_exhibitions;
create policy exhibitions_member_insert on public.admin_exhibitions
  for insert
  with check (public.is_gallery_member(gallery_id));

drop policy if exists exhibitions_member_update on public.admin_exhibitions;
create policy exhibitions_member_update on public.admin_exhibitions
  for update
  using (public.is_gallery_member(gallery_id))
  with check (public.is_gallery_member(gallery_id));  -- both clauses => cannot re-point to another gallery

drop policy if exists exhibitions_member_delete on public.admin_exhibitions;
create policy exhibitions_member_delete on public.admin_exhibitions
  for delete
  using (public.is_gallery_member(gallery_id));

drop policy if exists exhibitions_admin_all on public.admin_exhibitions;
create policy exhibitions_admin_all on public.admin_exhibitions
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());
