-- Phase 1.5 — Guard triggers: enforce that ordinary gallery users can only touch their own,
-- non-privileged fields, and that slug/name stay system-derived. These run for EVERY writer but
-- only constrain ordinary authenticated users:
--   * auth.uid() IS NULL      -> service-role / legacy admin (god; bypasses RLS too) -> unconstrained
--   * is_super_admin()        -> super-admin                                         -> unconstrained
--   * otherwise               -> a gallery member                                    -> constrained

create or replace function public.guard_exhibition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  g record;
begin
  if auth.uid() is not null and not public.is_super_admin() then
    if TG_OP = 'INSERT' then
      new.owner_id        := auth.uid();
      new.created_by      := auth.uid();
      new.updated_by      := auth.uid();
      new.featured        := false;
      new.hidden_by_admin := false;
      new.week_start      := null;   -- weekly model is a super-admin concept
      new.week_end        := null;
    elsif TG_OP = 'UPDATE' then
      -- Pin everything an owner must never change to its previous value.
      new.gallery_id      := old.gallery_id;
      new.slug            := old.slug;          -- URL stability
      new.owner_id        := old.owner_id;
      new.created_by      := old.created_by;
      new.created_at      := old.created_at;
      new.featured        := old.featured;
      new.hidden_by_admin := old.hidden_by_admin;
      new.week_start      := old.week_start;
      new.week_end        := old.week_end;
      new.updated_by      := auth.uid();
    end if;

    -- gallery_slug / gallery_name / gallery_mode are always derived from the (pinned) gallery_id,
    -- never trusted from the client -> prevents slug spoofing / cross-gallery impersonation.
    select slug, name into g from public.galleries where id = new.gallery_id;
    if g.slug is null then
      raise exception 'guard_exhibition: gallery_id % does not exist', new.gallery_id;
    end if;
    new.gallery_slug := g.slug;
    new.gallery_name := g.name;
    new.gallery_mode := 'index';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_exhibition_biu on public.admin_exhibitions;
create trigger guard_exhibition_biu
  before insert or update on public.admin_exhibitions
  for each row execute function public.guard_exhibition();


create or replace function public.guard_gallery()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is not null and not public.is_super_admin() then
    if TG_OP = 'INSERT' then
      -- Galleries are created by super-admin during invite; ordinary users cannot create them.
      raise exception 'guard_gallery: gallery users cannot create galleries';
    elsif TG_OP = 'UPDATE' then
      new.slug            := old.slug;           -- URL stability
      new.owner_id        := old.owner_id;
      new.is_claimed      := old.is_claimed;
      new.hidden_by_admin := old.hidden_by_admin;
      new.created_by      := old.created_by;
      new.created_at      := old.created_at;
      new.updated_by      := auth.uid();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_gallery_biu on public.galleries;
create trigger guard_gallery_biu
  before insert or update on public.galleries
  for each row execute function public.guard_gallery();
