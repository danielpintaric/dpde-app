-- Public portfolio metadata + transitional external image URLs (until bucket assets exist).

alter table public.projects
  add column if not exists category text,
  add column if not exists year text,
  add column if not exists location text;

alter table public.projects
  add column if not exists layout_type text;

update public.projects
set layout_type = 'mixed'
where layout_type is null;

alter table public.projects
  alter column layout_type set default 'mixed';

alter table public.projects
  alter column layout_type set not null;

alter table public.projects drop constraint if exists projects_layout_type_check;

alter table public.projects
  add constraint projects_layout_type_check
  check (layout_type in ('cinematic', 'grid', 'mixed'));

alter table public.images
  add column if not exists aspect_class text,
  add column if not exists object_position text,
  add column if not exists external_url text;

comment on column public.images.external_url is
  'If set, public pages use this URL as the image src (Unsplash /public, etc.). storage_path stays a non-null placeholder until bucket migration.';
