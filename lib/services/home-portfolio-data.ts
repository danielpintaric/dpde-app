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
import { getPublishedProjectByIdPublic, listPublishedProjectsPublic } from "@/lib/db/projects-public";
import { fetchSiteLandingSettingsPublic } from "@/lib/db/site-landing-public";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";
import { clampHomeMoreWorkCount } from "@/lib/home-more-work-settings";
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

/** Homepage „More work“: editorial tiles with title & category. */
export type HomeMoreWorkTile = {
  src: string;
  slug: string;
  imgClassName?: string;
  title: string;
  category: string;
};

function portfolioDataIsStaticHome(): boolean {
  return process.env.PORTFOLIO_DATA?.trim().toLowerCase() === "static";
}

function parseOrderedProjectIds(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") {
      continue;
    }
    const s = x.trim();
    if (s.length === 0) {
      continue;
    }
    out.push(s);
    if (out.length >= max) {
      break;
    }
  }
  return out;
}

async function buildMoreWorkTileFromSlug(slug: string): Promise<HomeMoreWorkTile | null> {
  const p = await loadPortfolioProjectBySlug(slug);
  if (!p) {
    return null;
  }
  return {
    src: p.coverImage,
    slug: p.slug,
    title: p.title,
    category: p.category,
  };
}

/**
 * Fills with newest public projects, excluding `excludeSlugs` and any slug already in `seed`.
 */
async function fillMoreWorkFromNewest(
  excludeSlugs: ReadonlySet<string>,
  count: number,
  seed: HomeMoreWorkTile[],
): Promise<HomeMoreWorkTile[]> {
  const tiles = [...seed];
  const seen = new Set(tiles.map((t) => t.slug));
  for (const s of excludeSlugs) {
    seen.add(s);
  }

  let list: Awaited<ReturnType<typeof listPublishedProjectsPublic>>;
  try {
    list = await listPublishedProjectsPublic();
  } catch {
    return tiles;
  }

  const sorted = [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const proj of sorted) {
    if (tiles.length >= count) {
      break;
    }
    if (seen.has(proj.slug)) {
      continue;
    }
    seen.add(proj.slug);
    const tile = await buildMoreWorkTileFromSlug(proj.slug);
    if (tile) {
      tiles.push(tile);
    }
  }
  return tiles;
}

/** Legacy static mosaic when `PORTFOLIO_DATA=static` or as last-resort fallback. */
async function getLegacyStaticMoreWorkTiles(): Promise<HomeMoreWorkTile[]> {
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

/**
 * Second layer unter „Selected work“: DB-driven (auto/manual + count) wenn Portfolio nicht static;
 * sonst gleiche Slots wie {@link HOME_MOSAIC_SLOTS}.
 */
export async function getHomeMoreWorkTiles(
  siteId: string = DEFAULT_SITE_ID,
): Promise<HomeMoreWorkTile[]> {
  if (portfolioDataIsStaticHome()) {
    return getLegacyStaticMoreWorkTiles();
  }

  const row = await fetchSiteLandingSettingsPublic(siteId);
  const count = clampHomeMoreWorkCount(row?.home_more_work_count);
  const mode = row?.home_more_work_mode === "manual" ? "manual" : "auto";

  let featuredSlugs: string[] = [];
  try {
    featuredSlugs = await resolveHomeFeaturedProjectSlugs(siteId);
  } catch {
    featuredSlugs = [];
  }
  const excludeSlugs = new Set(featuredSlugs);

  let seed: HomeMoreWorkTile[] = [];
  if (mode === "manual") {
    const rawIds = parseOrderedProjectIds(row?.home_more_work_manual_project_ids, 24);
    const seenSlug = new Set<string>();
    for (const id of rawIds) {
      if (seed.length >= count) {
        break;
      }
      try {
        const proj = await getPublishedProjectByIdPublic(id);
        if (!proj) {
          continue;
        }
        if (excludeSlugs.has(proj.slug)) {
          continue;
        }
        if (seenSlug.has(proj.slug)) {
          continue;
        }
        seenSlug.add(proj.slug);
        const tile = await buildMoreWorkTileFromSlug(proj.slug);
        if (tile) {
          seed.push(tile);
        }
      } catch {
        /* skip */
      }
    }
  }

  let tiles =
    mode === "auto"
      ? await fillMoreWorkFromNewest(excludeSlugs, count, [])
      : await fillMoreWorkFromNewest(excludeSlugs, count, seed);

  if (tiles.length === 0) {
    tiles = await getLegacyStaticMoreWorkTiles();
  }

  return tiles.slice(0, count);
}
