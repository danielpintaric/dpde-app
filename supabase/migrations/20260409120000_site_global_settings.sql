-- Global brand + footer copy (single row). Public read for site chrome; admin writes via app session.

create table if not exists public.site_global_settings (
  id text primary key default 'default',
  brand_name text not null default '',
  wordmark_text text null,
  logo_image_url text null,
  copyright_holder text null,
  footer_tagline text null,
  footer_email text null,
  footer_instagram_url text null,
  footer_instagram_label text null,
  footer_cta_href text null,
  footer_cta_label text null,
  footer_extra_url text null,
  footer_extra_label text null,
  location_city text null,
  bio_line text null,
  primary_contact_label text null,
  updated_at timestamptz not null default now()
);

comment on table public.site_global_settings is
  'Site-wide brand name, optional wordmark/logo URL, and footer links/copy.';

-- No seed row: public site uses env/code defaults until the first admin save creates `id = default`.
