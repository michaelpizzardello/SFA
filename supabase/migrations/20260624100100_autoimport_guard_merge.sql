-- Phase 5.2 — Extend the exhibition guard to record owner edits (field locks + auto->auto_edited),
-- and add the single, non-destructive merge that is the only path from candidates to live rows.

create or replace function public.guard_exhibition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  g record;
  changed text[];
begin
  if auth.uid() is not null and not public.is_super_admin() then
    if TG_OP = 'INSERT' then
      new.owner_id := auth.uid();
      new.created_by := auth.uid();
      new.updated_by := auth.uid();
      new.featured := false;
      new.hidden_by_admin := false;
      new.week_start := null;
      new.week_end := null;
    elsif TG_OP = 'UPDATE' then
      new.gallery_id := old.gallery_id;
      new.slug := old.slug;
      new.owner_id := old.owner_id;
      new.created_by := old.created_by;
      new.created_at := old.created_at;
      new.featured := old.featured;
      new.hidden_by_admin := old.hidden_by_admin;
      new.week_start := old.week_start;
      new.week_end := old.week_end;
      new.updated_by := auth.uid();

      -- Record which lockable fields the owner changed so auto-import never overwrites them.
      changed := old.owner_edited_fields;
      if new.exhibition_name is distinct from old.exhibition_name then changed := array_append(changed, 'exhibition_name'); end if;
      if new.artist is distinct from old.artist then changed := array_append(changed, 'artist'); end if;
      if new.summary is distinct from old.summary then changed := array_append(changed, 'summary'); end if;
      if new.start_date is distinct from old.start_date then changed := array_append(changed, 'start_date'); end if;
      if new.end_date is distinct from old.end_date then changed := array_append(changed, 'end_date'); end if;
      if new.opening_information is distinct from old.opening_information then changed := array_append(changed, 'opening_information'); end if;
      if new.image_url is distinct from old.image_url then changed := array_append(changed, 'image_url'); end if;
      if new.cost is distinct from old.cost then changed := array_append(changed, 'cost'); end if;
      if new.location is distinct from old.location then changed := array_append(changed, 'location'); end if;
      new.owner_edited_fields := (select array(select distinct unnest(changed)));

      -- Crawler-owned provenance is pinned for owner writes; an owner touch promotes auto -> auto_edited.
      new.source_refs := old.source_refs;
      new.source_url := old.source_url;
      new.source_platform := old.source_platform;
      new.last_synced_at := old.last_synced_at;
      new.synced_payload_hash := old.synced_payload_hash;
      new.source := case when old.source = 'auto' then 'auto_edited' else old.source end;
    end if;

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

-- The only path from staging -> live. Additive + non-destructive:
--   * skips galleries with the source toggled off (freeze, never delete)
--   * dedups by provenance ref overlap
--   * inserts new auto rows (website+verified publish live; else stay draft)
--   * refreshes ONLY un-edited fields of existing 'auto' rows (null-safe)
--   * never touches 'manual'/'auto_edited' rows or owner-edited fields
create or replace function public.merge_exhibition_candidates(p_batch_id text default null)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  c record;
  g record;
  existing record;
  v_ref text;
  v_publish boolean;
  v_slug text;
  n_merged int := 0;
  n_inserted int := 0;
  n_skipped int := 0;
  n_unmatched int := 0;
begin
  perform pg_advisory_xact_lock(hashtext('merge_exhibition_candidates'));

  for c in
    select * from public.exhibition_candidates
    where status = 'pending' and (p_batch_id is null or crawl_batch_id = p_batch_id)
    order by created_at asc
  loop
    -- Resolve gallery: explicit id, else a VERIFIED source mapping (anti-spoof).
    if c.gallery_id is not null then
      select * into g from public.galleries where id = c.gallery_id;
    else
      select gy.* into g
      from public.galleries gy
      join public.gallery_sources gs on gs.gallery_id = gy.id and gs.verified = true
      where (c.match_website is not null and gs.source_host = c.match_website)
         or (c.match_instagram is not null and gs.instagram_handle = c.match_instagram)
      limit 1;
    end if;

    if g.id is null then
      update public.exhibition_candidates set status = 'unmatched', processed_at = now() where id = c.id;
      n_unmatched := n_unmatched + 1;
      continue;
    end if;

    if not coalesce(g.auto_import_enabled, false)
       or not coalesce((g.auto_import_sources ->> c.source_platform)::boolean, false) then
      update public.exhibition_candidates
        set status = 'skipped', status_detail = 'auto-import disabled', processed_at = now()
        where id = c.id;
      n_skipped := n_skipped + 1;
      continue;
    end if;

    v_ref := c.source_platform || ':' || c.external_ref;
    v_publish := (not coalesce(g.review_before_publish, false)) and c.source_platform = 'website';

    select * into existing
    from public.admin_exhibitions
    where gallery_id = g.id and source_refs ? v_ref
    limit 1
    for update;

    if existing.id is null then
      v_slug := coalesce(nullif(public.slugify(g.slug || '-' || coalesce(c.exhibition_name, '')), ''), 'exhibition')
                || '-' || substr(md5(v_ref), 1, 4);
      begin
        insert into public.admin_exhibitions
          (slug, gallery_mode, gallery_id, gallery_slug, gallery_name, exhibition_name, artist, summary,
           start_date, end_date, opening_information, image_url, cost, location,
           published, source, source_refs, source_url, source_platform, last_synced_at)
        values
          (v_slug, 'index', g.id, g.slug, g.name, c.exhibition_name, coalesce(c.artist, ''),
           coalesce(c.summary, ''), c.start_date, c.end_date, coalesce(c.opening_information, ''),
           coalesce(c.image_url, ''), coalesce(nullif(c.cost, ''), 'Free'), coalesce(c.location, ''),
           v_publish, 'auto', jsonb_build_array(v_ref), c.source_url, c.source_platform, now());
        update public.exhibition_candidates set status = 'merged', processed_at = now() where id = c.id;
        n_inserted := n_inserted + 1;
      exception when others then
        update public.exhibition_candidates
          set status = 'error', status_detail = SQLERRM, processed_at = now()
          where id = c.id;
      end;
      continue;
    end if;

    if existing.source in ('manual', 'auto_edited') then
      update public.exhibition_candidates
        set status = 'skipped', status_detail = 'owner-managed', processed_at = now()
        where id = c.id;
      n_skipped := n_skipped + 1;
      continue;
    end if;

    -- existing.source = 'auto' -> refresh only fields the owner hasn't locked; null never erases.
    update public.admin_exhibitions set
      exhibition_name = case when 'exhibition_name' = any(owner_edited_fields) then exhibition_name else coalesce(nullif(c.exhibition_name, ''), exhibition_name) end,
      artist = case when 'artist' = any(owner_edited_fields) then artist else coalesce(nullif(c.artist, ''), artist) end,
      summary = case when 'summary' = any(owner_edited_fields) then summary else coalesce(nullif(c.summary, ''), summary) end,
      start_date = case when 'start_date' = any(owner_edited_fields) then start_date else coalesce(c.start_date, start_date) end,
      end_date = case when 'end_date' = any(owner_edited_fields) then end_date else coalesce(c.end_date, end_date) end,
      opening_information = case when 'opening_information' = any(owner_edited_fields) then opening_information else coalesce(nullif(c.opening_information, ''), opening_information) end,
      image_url = case when 'image_url' = any(owner_edited_fields) then image_url else coalesce(nullif(c.image_url, ''), image_url) end,
      cost = case when 'cost' = any(owner_edited_fields) then cost else coalesce(nullif(c.cost, ''), cost) end,
      location = case when 'location' = any(owner_edited_fields) then location else coalesce(nullif(c.location, ''), location) end,
      source_url = coalesce(c.source_url, source_url),
      last_synced_at = now()
    where id = existing.id and source = 'auto';
    update public.exhibition_candidates
      set status = 'merged', merged_exhibition_id = existing.id, processed_at = now()
      where id = c.id;
    n_merged := n_merged + 1;
  end loop;

  return jsonb_build_object('inserted', n_inserted, 'merged', n_merged, 'skipped', n_skipped, 'unmatched', n_unmatched);
end;
$$;

revoke all on function public.merge_exhibition_candidates(text) from public, anon, authenticated, importer;
