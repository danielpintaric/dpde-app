-- STEP 8.9.1 — Multi-site foundation: registry + site_id on global/landing settings (default unchanged).

create table if not exists public.sites (
  id text primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.sites (id, slug, name)
values ('default', 'default', 'Default site')
on conflict (id) do nothing;

alter table public.site_global_settings
  add column if not exists site_id text not null default 'default';

alter table public.site_landing_settings
  add column if not exists site_id text not null default 'default';

update public.site_global_settings
set site_id = 'default'
where site_id is null;

update public.site_landing_settings
set site_id = 'default'
where site_id is null;

create unique index if not exists site_global_settings_site_id_key
  on public.site_global_settings (site_id);

create unique index if not exists site_landing_settings_site_id_key
  on public.site_landing_settings (site_id);

do $$
begin
  alter table public.site_global_settings
    add constraint site_global_settings_site_id_fkey
    foreign key (site_id) references public.sites (id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.site_landing_settings
    add constraint site_landing_settings_site_id_fkey
    foreign key (site_id) references public.sites (id);
exception
  when duplicate_object then null;
end $$;

comment on table public.sites is 'Tenant registry; default row id/slug = default until domain routing.';
comment on column public.site_global_settings.site_id is 'Tenant; FK to sites.id. One settings row per site.';
comment on column public.site_landing_settings.site_id is 'Tenant; FK to sites.id. One landing row per site.';
