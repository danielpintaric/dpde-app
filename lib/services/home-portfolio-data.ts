import "server-only";

import {
  HOME_FEATURED_SLUGS,
  HOME_HERO_IMAGE,
  HOME_MOSAIC_SLOTS,
  HOME_WORK_PREVIEW,
  type HomeMosaicSlot,
  type HomeWorkPreviewFrame,
  type PortfolioProject,
  getProjectBySlug as getStaticProjectBySlug,
  homepageImages,
} from "@/lib/portfolio-data";
import { loadPortfolioProjectBySlug } from "@/lib/services/portfolio-view-data";

export type HomeFeaturedEditorialItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  secondarySrc?: string;
};

function resolveMosaicFrameSrc(
  project: PortfolioProject,
  frame: HomeMosaicSlot["frame"],
): string {
  if (frame === "cover") {
    return project.coverImage;
  }
  const row = project.images[frame];
  if (row?.src) {
    return row.src;
  }
  return project.coverImage;
}

function featuredFromStatic(): HomeFeaturedEditorialItem[] {
  const out: HomeFeaturedEditorialItem[] = [];
  for (const slug of HOME_FEATURED_SLUGS) {
    const p = getStaticProjectBySlug(slug);
    if (!p) {
      continue;
    }
    out.push({
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: p.coverImage,
      secondarySrc: p.images[1]?.src,
    });
  }
  return out;
}

/**
 * Featured strip + hero: same curated slugs as static `HOME_FEATURED_SLUGS`, resolved via
 * `loadPortfolioProjectBySlug` (Supabase when enabled, else static fallback per slug).
 */
export async function getHomeFeaturedEditorialData(): Promise<
  HomeFeaturedEditorialItem[]
> {
  const out: HomeFeaturedEditorialItem[] = [];
  for (const slug of HOME_FEATURED_SLUGS) {
    const p = await loadPortfolioProjectBySlug(slug);
    if (!p) {
      continue;
    }
    out.push({
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: p.coverImage,
      secondarySrc: p.images[1]?.src,
    });
  }
  if (out.length > 0) {
    return out;
  }
  return featuredFromStatic();
}

export function getHomeHeroFallbackImageSrc(): string {
  return HOME_HERO_IMAGE;
}

/**
 * Projects linked from homepage editorial plates (wide / quiet / duo). Image files stay
 * from `homepageImages`; this only gates sections and href targets on real catalog data.
 */
export async function getHomepageLinkedProjects(): Promise<{
  widePlateProject: PortfolioProject | null;
  wideBelowProject: PortfolioProject | null;
  duoProject: PortfolioProject | null;
}> {
  const [widePlateProject, wideBelowProject, duoProject] = await Promise.all([
    loadPortfolioProjectBySlug(homepageImages.widePlateSlug),
    loadPortfolioProjectBySlug(homepageImages.widePlateBelowSlug),
    loadPortfolioProjectBySlug(homepageImages.duoSlug),
  ]);
  return { widePlateProject, wideBelowProject, duoProject };
}

/**
 * Recent pieces mosaic: curated slots + Supabase-backed `PortfolioProject` frames; falls back per cell to
 * legacy `HOME_WORK_PREVIEW` src when the project is missing.
 */
export async function getHomeWorkMosaicFrames(): Promise<HomeWorkPreviewFrame[]> {
  const out: HomeWorkPreviewFrame[] = [];
  for (let i = 0; i < HOME_MOSAIC_SLOTS.length; i++) {
    const slot = HOME_MOSAIC_SLOTS[i]!;
    const staticFallback = HOME_WORK_PREVIEW[i];
    const p = await loadPortfolioProjectBySlug(slot.slug);
    let src: string;
    if (p) {
      src = resolveMosaicFrameSrc(p, slot.frame);
    } else if (staticFallback) {
      src = staticFallback.src;
    } else {
      continue;
    }
    out.push({
      src,
      slug: slot.slug,
      imgClassName: slot.imgClassName ?? staticFallback?.imgClassName,
    });
  }
  return out;
}
