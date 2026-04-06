-- More work: auto (newest, excluding selected work) vs manual ordered list; item count (6/9/12).

alter table public.site_landing_settings
  add column if not exists home_more_work_mode text not null default 'auto',
  add column if not exists home_more_work_count integer not null default 6,
  add column if not exists home_more_work_manual_project_ids jsonb not null default '[]'::jsonb;

comment on column public.site_landing_settings.home_more_work_mode is
  'More work section: auto = newest projects excluding selected work; manual = home_more_work_manual_project_ids order.';

comment on column public.site_landing_settings.home_more_work_count is
  'Number of tiles in More work (6, 9, or 12).';

comment on column public.site_landing_settings.home_more_work_manual_project_ids is
  'Ordered project UUIDs for manual More work mode.';
