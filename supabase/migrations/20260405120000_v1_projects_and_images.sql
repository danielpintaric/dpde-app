-- V1: portfolio projects and image metadata (Supabase PostgreSQL)
-- Apply via Supabase SQL editor or `supabase db push` / migration workflow.

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text null,
  description text null,
  visibility text not null default 'public'
    constraint projects_visibility_check
      check (visibility in ('public', 'private', 'unlisted')),
  sort_order integer not null default 0,
  cover_image_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- images (belongs to a project; storage binary lives in bucket project-images)
-- ---------------------------------------------------------------------------
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.projects (id) on delete cascade,
  storage_path text not null,
  filename text not null,
  alt_text text null,
  caption text null,
  width integer null,
  height integer null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists images_project_id_sort_idx
  on public.images (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- Cover image: FK added after `images` exists (clear single mechanism)
-- ---------------------------------------------------------------------------
alter table public.projects
  add constraint projects_cover_image_id_fkey
  foreign key (cover_image_id)
  references public.images (id)
  on delete set null;

-- Storage (manual next step in Dashboard or CLI): bucket name `project-images`.
-- Object keys: projects/<project_id>/original/<filename>  (see `lib/storage/project-image-paths.ts`).
