/**
 * Domain types for Supabase-backed portfolio data (V1).
 * Maps to `public.projects` and `public.images` (camelCase in app code).
 * UI-facing `PortfolioReel` / `ProjectImage` shapes live in `lib/portfolio-data.ts`.
 */

export type ProjectVisibility = "public" | "unlisted" | "private";

export type GalleryLayoutType = "cinematic" | "grid" | "mixed";

export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  visibility: ProjectVisibility;
  sortOrder: number;
  coverImageId: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  layoutType: GalleryLayoutType;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
};

/** Row in `images`. */
export type Image = {
  id: string;
  projectId: string;
  storagePath: string;
  filename: string;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  /** ISO 8601 */
  createdAt: string;
  /** Transitional: full URL or site path; overrides constructed storage URL when set. */
  externalUrl: string | null;
  aspectClass: string | null;
  objectPosition: string | null;
};
