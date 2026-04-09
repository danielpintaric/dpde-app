-- Optional Tailwind filter classes per image (brightness/contrast etc.) for editorial parity.
alter table public.images
  add column if not exists image_filter_class text null;

comment on column public.images.image_filter_class is
  'Optional Tailwind utility classes for image tone; null uses site default (brightness/contrast).';
