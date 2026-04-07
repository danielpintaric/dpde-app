-- Client area: token-based image selections (favorites / proofing MVP). No auth.

create table if not exists public.client_image_selections (
  id uuid primary key default gen_random_uuid(),
  site_id text not null default 'default',
  client_access_id uuid not null,
  project_id uuid not null,
  image_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_image_selections_access_image_key unique (client_access_id, image_id)
);

do $$
begin
  alter table public.client_image_selections
    add constraint client_image_selections_site_id_fkey
    foreign key (site_id) references public.sites (id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.client_image_selections
    add constraint client_image_selections_client_access_id_fkey
    foreign key (client_access_id) references public.client_access (id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.client_image_selections
    add constraint client_image_selections_project_id_fkey
    foreign key (project_id) references public.projects (id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.client_image_selections
    add constraint client_image_selections_image_id_fkey
    foreign key (image_id) references public.images (id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

create index if not exists client_image_selections_client_access_id_idx
  on public.client_image_selections (client_access_id);

create index if not exists client_image_selections_project_id_idx
  on public.client_image_selections (project_id);

alter table public.client_image_selections enable row level security;

comment on table public.client_image_selections is
  'Per share link: which images the client marked; resolved server-side via token.';

-- RPC: expose access id + site id for server-side selection queries (token stays opaque to clients).
create or replace function public.fetch_client_access_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.client_access%rowtype;
begin
  if p_token is null or length(trim(p_token)) < 1 then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into r from public.client_access where token = trim(p_token) limit 1;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if not r.is_active then
    return jsonb_build_object('status', 'inactive');
  end if;

  if r.expires_at is not null and r.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'access_id', r.id,
    'site_id', r.site_id,
    'client_name', r.client_name,
    'project_ids', coalesce(r.project_ids, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.fetch_client_access_by_token(text) from public;
grant execute on function public.fetch_client_access_by_token(text) to anon, authenticated;
