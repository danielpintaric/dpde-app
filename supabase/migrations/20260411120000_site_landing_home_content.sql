-- Homepage section labels, approach block, and section visibility (same row as hero / featured).

alter table public.site_landing_settings
  add column if not exists home_selected_work_label text null,
  add column if not exists home_more_work_label text null,
  add column if not exists home_show_selected_work boolean not null default true,
  add column if not exists home_show_more_work boolean not null default true,
  add column if not exists home_show_approach boolean not null default true,
  add column if not exists home_approach_kicker text null,
  add column if not exists home_approach_title text null,
  add column if not exists home_approach_body text null,
  add column if not exists home_approach_image_url text null,
  add column if not exists home_approach_cta_label text null,
  add column if not exists home_approach_cta_href text null;

comment on column public.site_landing_settings.home_selected_work_label is
  'Kicker heading for the Selected work block on `/`.';

comment on column public.site_landing_settings.home_approach_body is
  'Plain text / line breaks preserved in the Approach section.';
