-- Postgres slugify, kept in parity with lib/utils/slug.js (lowercase, non-alphanumeric -> '-', trim).
-- Used by merge_exhibition_candidates() to mint exhibition slugs for auto-imported rows.
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = pg_catalog, public
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;
