import type {
  GalleryLayoutType,
  Image,
  Project,
  ProjectVisibility,
} from "@/types/project";

/** Shape returned by PostgREST for `projects` (snake_case). */
export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  visibility: string;
  sort_order: number;
  cover_image_id: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  layout_type: string;
  created_at: string;
  updated_at: string;
};

/** Shape returned by PostgREST for `images` (snake_case). */
export type ImageRow = {
  id: string;
  project_id: string;
  storage_path: string;
  filename: string;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
  external_url: string | null;
  aspect_class: string | null;
  object_position: string | null;
};

function toVisibility(value: string): ProjectVisibility {
  if (value === "public" || value === "private" || value === "unlisted") {
    return value;
  }
  throw new Error(
    `Invalid projects.visibility from database: ${JSON.stringify(value)}`,
  );
}

function toLayoutType(value: string): GalleryLayoutType {
  if (value === "cinematic" || value === "grid" || value === "mixed") {
    return value;
  }
  throw new Error(
    `Invalid projects.layout_type from database: ${JSON.stringify(value)}`,
  );
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    visibility: toVisibility(row.visibility),
    sortOrder: row.sort_order,
    coverImageId: row.cover_image_id,
    category: row.category,
    year: row.year,
    location: row.location,
    layoutType: toLayoutType(row.layout_type),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapImageRow(row: ImageRow): Image {
  return {
    id: row.id,
    projectId: row.project_id,
    storagePath: row.storage_path,
    filename: row.filename,
    altText: row.alt_text,
    caption: row.caption,
    width: row.width,
    height: row.height,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    externalUrl: row.external_url,
    aspectClass: row.aspect_class,
    objectPosition: row.object_position,
  };
}
