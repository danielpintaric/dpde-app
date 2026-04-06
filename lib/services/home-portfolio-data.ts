import "server-only";

import {
  HOME_FEATURED_SLUGS,
  HOME_MOSAIC_SLOTS,
  HOME_WORK_PREVIEW,
  type HomeMosaicSlot,
  type PortfolioProject,
  getProjectBySlug as getStaticProjectBySlug,
  homepageImages,
} from "@/lib/portfolio-data";
import { loadPortfolioProjectBySlug } from "@/lib/services/portfolio-view-data";
import { resolveHomeFeaturedProjectSlugs } from "@/lib/services/site-landing";

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

function featuredFromStaticForSlugs(slugs: readonly string[]): HomeFeaturedEditorialItem[] {
  const out: HomeFeaturedEditorialItem[] = [];
  for (const slug of slugs) {
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
 * Featured strip: slug order from site landing config (or static fallbacks), resolved via
 * `loadPortfolioProjectBySlug`.
 */
export async function getHomeFeaturedEditorialData(): Promise<
  HomeFeaturedEditorialItem[]
> {
  const slugOrder = await resolveHomeFeaturedProjectSlugs();
  const out: HomeFeaturedEditorialItem[] = [];
  for (const slug of slugOrder) {
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
  return featuredFromStaticForSlugs(HOME_FEATURED_SLUGS);
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

function metaForHomeMoreWorkSlug(
  slug: string,
  project: PortfolioProject | null,
): { title: string; category: string } {
  if (project) {
    return { title: project.title, category: project.category };
  }
  const s = getStaticProjectBySlug(slug);
  if (s) {
    return { title: s.title, category: s.category };
  }
  const title = slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { title, category: "" };
}

/** Homepage „More work“: gleiche Kuratierung wie zuvor Mosaic, mit Titel & Kategorie für editorial Zeilen. */
export type HomeMoreWorkTile = {
  src: string;
  slug: string;
  imgClassName?: string;
  title: string;
  category: string;
};

/**
 * Second layer unter „Selected work“: gleiche Slots wie früher {@link HOME_MOSAIC_SLOTS}, ohne Layout-Logik.
 */
export async function getHomeMoreWorkTiles(): Promise<HomeMoreWorkTile[]> {
  const out: HomeMoreWorkTile[] = [];
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
    const { title, category } = metaForHomeMoreWorkSlug(slot.slug, p);
    out.push({
      src,
      slug: slot.slug,
      imgClassName: slot.imgClassName ?? staticFallback?.imgClassName,
      title,
      category,
    });
  }
  return out;
}
