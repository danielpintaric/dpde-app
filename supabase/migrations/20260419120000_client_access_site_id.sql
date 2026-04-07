-- Multi-site: scope client_access rows per site (default tenant until host routing).

alter table public.client_access
  add column if not exists site_id text not null default 'default';

update public.client_access
set site_id = 'default'
where site_id is null;

do $$
begin
  alter table public.client_access
    add constraint client_access_site_id_fkey
    foreign key (site_id) references public.sites (id);
exception
  when duplicate_object then null;
end $$;

create index if not exists client_access_site_id_idx on public.client_access (site_id);

comment on column public.client_access.site_id is 'Tenant; FK to sites.id. Admin lists filter by site.';
