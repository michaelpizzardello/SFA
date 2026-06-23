-- Phase 1.4 — Backfill: reconcile every exhibition to a real galleries row, then lock gallery_id NOT NULL.
--
-- Ordering is deliberate and fails loudly rather than silently breaking the public join:
--   1. Promote any gallery_slug referenced by an exhibition but missing from galleries
--      (covers gallery_mode='manual' rows AND any drifted 'index' rows) into real galleries rows,
--      hidden_by_admin = true so these auto-generated shells never pollute the public index until claimed.
--   2. Resolve gallery_id by slug for every exhibition.
--   3. Assert zero NULL gallery_id (hard failure -> inspect data) before adding the NOT NULL constraint.

-- 1. Promote missing galleries (one row per distinct slug; earliest exhibition wins for name/location).
insert into public.galleries (slug, name, location, precinct, suburb, hidden_by_admin)
select s.gallery_slug,
       s.gallery_name,
       s.location,
       coalesce(nullif(s.location, ''), 'Unspecified'),
       s.location,
       true
from (
  select distinct on (gallery_slug)
         gallery_slug, gallery_name, location
  from public.admin_exhibitions
  where gallery_slug is not null and gallery_slug <> ''
  order by gallery_slug, created_at asc
) s
where not exists (select 1 from public.galleries g where g.slug = s.gallery_slug)
on conflict (slug) do nothing;

-- 2. Resolve gallery_id by slug.
update public.admin_exhibitions e
set gallery_id = g.id
from public.galleries g
where e.gallery_id is null
  and g.slug = e.gallery_slug;

-- 3. Assert complete, then enforce.
do $$
declare
  orphan_count int;
begin
  select count(*) into orphan_count
  from public.admin_exhibitions
  where gallery_id is null;

  if orphan_count > 0 then
    raise exception
      'Backfill incomplete: % admin_exhibitions rows still have NULL gallery_id (likely empty/blank gallery_slug). Inspect before re-running.',
      orphan_count;
  end if;
end $$;

alter table public.admin_exhibitions
  alter column gallery_id set not null;
