import type { GalleryLayoutType, ProjectVisibility } from "@/types/project";

/** Payload for creating or updating a project (admin). */
export type AdminProjectUpsert = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  visibility: ProjectVisibility;
  sortOrder: number;
  category: string | null;
  year: string | null;
  location: string | null;
  layoutType: GalleryLayoutType;
};
