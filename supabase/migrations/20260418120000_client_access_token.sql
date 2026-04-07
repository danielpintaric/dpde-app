-- Client area: token-based access rows (no auth). Validated via RPC only.

create table if not exists public.client_access (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  client_name text null,
  project_ids jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_access_token_length check (char_length(token) >= 16)
);

create unique index if not exists client_access_token_key on public.client_access (token);

comment on table public.client_access is
  'Share links: token maps to optional client_name and ordered project UUIDs (jsonb array).';

-- Anonymous clients never SELECT this table; validation only via SECURITY DEFINER RPC.
alter table public.client_access enable row level security;

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
    'client_name', r.client_name,
    'project_ids', coalesce(r.project_ids, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.fetch_client_access_by_token(text) from public;
grant execute on function public.fetch_client_access_by_token(text) to anon, authenticated;
