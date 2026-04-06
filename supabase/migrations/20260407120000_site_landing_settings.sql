-- Phase 1: curated landing page content (hero + featured project slots)
-- Single-row table; public read for homepage, admin writes via app session.

create table if not exists public.site_landing_settings (
  id text primary key default 'default',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_image_urls jsonb not null default '[]'::jsonb,
  hero_link_1_label text null,
  hero_link_1_href text null,
  hero_link_2_label text null,
  hero_link_2_href text null,
  featured_project_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_landing_settings is
  'Homepage hero copy, hero image URLs (ordered), and up to three featured project UUIDs.';

insert into public.site_landing_settings (id)
values ('default')
on conflict (id) do nothing;
