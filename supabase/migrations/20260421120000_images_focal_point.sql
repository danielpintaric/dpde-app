-- Focal point for editorial cropping (0–100 each axis; null = use legacy object_position or center).
alter table public.images
  add column if not exists focal_x smallint null,
  add column if not exists focal_y smallint null;

comment on column public.images.focal_x is 'Horizontal focal point 0–100; null with focal_y = use object_position / default center.';
comment on column public.images.focal_y is 'Vertical focal point 0–100; null with focal_x = use object_position / default center.';

alter table public.images
  drop constraint if exists images_focal_pair;

alter table public.images
  add constraint images_focal_pair check (
    (focal_x is null and focal_y is null)
    or (focal_x is not null and focal_y is not null)
  );

alter table public.images
  drop constraint if exists images_focal_x_range;

alter table public.images
  drop constraint if exists images_focal_y_range;

alter table public.images
  add constraint images_focal_x_range check (focal_x is null or (focal_x >= 0 and focal_x <= 100));

alter table public.images
  add constraint images_focal_y_range check (focal_y is null or (focal_y >= 0 and focal_y <= 100));
