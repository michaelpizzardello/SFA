-- Phase 1.6 — Visibility views: the single place the public visibility predicate is expressed.
-- All public reads (service-role SSR today, anon backstop later) go through these, so a published
-- exhibition belonging to an admin-hidden gallery can never leak.
--
-- security_invoker = true => when queried by anon/authenticated the underlying RLS still applies
-- (defense in depth); service-role continues to bypass RLS as before.

create or replace view public.public_galleries
  with (security_invoker = true)
as
  select *
  from public.galleries
  where hidden_by_admin = false;

create or replace view public.public_exhibitions
  with (security_invoker = true)
as
  select e.*
  from public.admin_exhibitions e
  join public.galleries g on g.id = e.gallery_id
  where e.published = true
    and e.hidden_by_admin = false
    and g.hidden_by_admin = false;

grant select on public.public_galleries to anon, authenticated, service_role;
grant select on public.public_exhibitions to anon, authenticated, service_role;
