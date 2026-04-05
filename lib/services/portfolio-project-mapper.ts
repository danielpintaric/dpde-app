import "server-only";

import type { PortfolioProject, ProjectImage } from "@/lib/portfolio-data";
import { getCatalogImagePublicUrl } from "@/lib/services/project-catalog";
import type { Image, Project } from "@/types/project";

function resolveImageSrc(image: Image): string {
  const external = image.externalUrl?.trim();
  if (external) {
    return external;
  }
  return getCatalogImagePublicUrl(image);
}

function catalogImageToProjectImage(img: Image): ProjectImage {
  const aspectClass = img.aspectClass?.trim();
  if (!aspectClass) {
    throw new Error(
      `Image ${img.id} is missing aspect_class (needed for gallery layout).`,
    );
  }
  const row: ProjectImage = {
    src: resolveImageSrc(img),
    aspectClass,
  };
  if (img.caption) {
    row.caption = img.caption;
  }
  if (img.objectPosition?.trim()) {
    row.objectPosition = img.objectPosition.trim();
  }
  return row;
}

/** Maps DB `Project` + `images` rows to the UI `PortfolioProject` shape (public + client). */
export function mapDbProjectToPortfolioProject(
  project: Project,
  images: Image[],
): PortfolioProject {
  const sortedImages = [...images].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  let coverImage: string;
  if (project.coverImageId) {
    const cover = sortedImages.find((i) => i.id === project.coverImageId);
    if (!cover) {
      throw new Error(
        `Project "${project.slug}": cover_image_id not found in loaded images.`,
      );
    }
    coverImage = resolveImageSrc(cover);
  } else if (sortedImages.length > 0) {
    coverImage = resolveImageSrc(sortedImages[0]!);
  } else {
    throw new Error(`Project "${project.slug}" has no images.`);
  }

  const category = project.category?.trim();
  const year = project.year?.trim();
  const location = project.location?.trim();
  const intro = project.description?.trim() ?? "";

  if (!category || !year || !location) {
    throw new Error(
      `Project "${project.slug}" needs category, year, and location in the database.`,
    );
  }

  return {
    title: project.title,
    slug: project.slug,
    category,
    year,
    location,
    intro,
    layoutType: project.layoutType,
    coverImage,
    images: sortedImages.map(catalogImageToProjectImage),
  };
}
