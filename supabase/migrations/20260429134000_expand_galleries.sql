alter table public.galleries
  add column if not exists precinct text not null default '',
  add column if not exists suburb text not null default '',
  add column if not exists postcode text not null default '',
  add column if not exists address text not null default '',
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists website text not null default '',
  add column if not exists instagram text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists email text not null default '',
  add column if not exists opening_hours text[] not null default '{}',
  add column if not exists about text not null default '';

update public.galleries
set
  precinct = coalesce(nullif(precinct, ''), location),
  suburb = coalesce(nullif(suburb, ''), location)
where location <> '';
