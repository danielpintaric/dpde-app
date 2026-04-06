-- Hero slideshow: seconds between crossfades (Site Admin; clamped 4–20 in app, default 8).

alter table public.site_landing_settings
  add column if not exists hero_interval_seconds integer not null default 8;

comment on column public.site_landing_settings.hero_interval_seconds is
  'Seconds between hero image transitions when multiple URLs are set (public page).';
