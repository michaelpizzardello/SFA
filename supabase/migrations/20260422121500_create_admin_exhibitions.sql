create table if not exists public.admin_exhibitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  week_start date not null,
  week_end date not null,
  gallery_mode text not null check (gallery_mode in ('index', 'manual')),
  gallery_slug text not null,
  gallery_name text not null,
  location text not null default '',
  exhibition_name text not null,
  start_date date not null,
  end_date date,
  opening_information text not null default '',
  image_url text not null default '',
  rating numeric,
  featured boolean not null default false,
  ongoing boolean not null default false,
  artist text not null default '',
  summary text not null default '',
  cost text not null default 'Free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_exhibitions_week_start_idx on public.admin_exhibitions (week_start desc);
create index if not exists admin_exhibitions_gallery_slug_idx on public.admin_exhibitions (gallery_slug);
create index if not exists admin_exhibitions_start_date_idx on public.admin_exhibitions (start_date desc);

drop trigger if exists admin_exhibitions_set_updated_at on public.admin_exhibitions;

create trigger admin_exhibitions_set_updated_at
before update on public.admin_exhibitions
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('exhibition-images', 'exhibition-images', true)
on conflict (id) do update
set public = excluded.public;
