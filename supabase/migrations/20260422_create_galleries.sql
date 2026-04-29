create extension if not exists pgcrypto;

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists galleries_set_updated_at on public.galleries;

create trigger galleries_set_updated_at
before update on public.galleries
for each row
execute function public.set_updated_at();
