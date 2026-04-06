-- Header navigation, logo target, optional header CTA, contact phone (single global settings row).

alter table public.site_global_settings
  add column if not exists logo_home_href text null,
  add column if not exists header_brand_label text null,
  add column if not exists navigation_items jsonb not null default '[]'::jsonb,
  add column if not exists header_cta_label text null,
  add column if not exists header_cta_href text null,
  add column if not exists contact_phone text null;

comment on column public.site_global_settings.logo_home_href is
  'Logo / wordmark link target; default /.';

comment on column public.site_global_settings.navigation_items is
  'Ordered nav: [{ "label", "href", "visible": true }]. Empty array → code defaults.';

comment on column public.site_global_settings.contact_phone is
  'Optional tel: link (footer + future use); same row as primary email.';
