-- STEP 8.8.7a — Canonical idempotent sync: public.site_landing_settings ↔ upsertSiteLandingSettings
-- (lib/db/site-landing-admin.ts). Safe to re-run: only ADD COLUMN IF NOT EXISTS.
--
-- Upsert payload columns (plus PK id): matches SiteLandingUpsertPayload + id + updated_at.
-- NOT used by the app (no separate upsert keys): featured_lead_project_id, featured_support_project_1_id,
-- featured_support_project_2_id — featured slots are stored in featured_project_ids (jsonb array).
--
-- If a column already exists from an earlier migration, IF NOT EXISTS skips it.

create table if not exists public.site_landing_settings (
  id text primary key default 'default'
);

insert into public.site_landing_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.site_landing_settings
  add column if not exists hero_title text not null default '',
  add column if not exists hero_subtitle text not null default '',
  add column if not exists hero_image_urls jsonb not null default '[]'::jsonb,
  add column if not exists hero_link_1_label text,
  add column if not exists hero_link_1_href text,
  add column if not exists hero_link_2_label text,
  add column if not exists hero_link_2_href text,
  add column if not exists featured_project_ids jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists hero_interval_seconds integer not null default 8,
  add column if not exists home_selected_work_label text,
  add column if not exists home_more_work_label text,
  add column if not exists home_show_selected_work boolean not null default true,
  add column if not exists home_show_more_work boolean not null default true,
  add column if not exists home_show_approach boolean not null default true,
  add column if not exists home_approach_kicker text,
  add column if not exists home_approach_title text,
  add column if not exists home_approach_body text,
  add column if not exists home_approach_image_url text,
  add column if not exists home_approach_cta_label text,
  add column if not exists home_approach_cta_href text,
  add column if not exists home_more_work_mode text not null default 'auto',
  add column if not exists home_more_work_count integer not null default 6,
  add column if not exists home_more_work_manual_project_ids jsonb not null default '[]'::jsonb;
