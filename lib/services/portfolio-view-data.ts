import "server-only";

import { SupabaseConfigError, getSupabasePublicConfig } from "@/lib/db/supabase-env";
import type { PortfolioProject } from "@/lib/portfolio-data";
import {
  getPortfolioProjects as getStaticPortfolioProjects,
  getProjectBySlug as getStaticProjectBySlug,
} from "@/lib/portfolio-data";
import {
  getCatalogProjectBySlug,
  getCatalogProjectImages,
  getCatalogProjects,
} from "@/lib/services/project-catalog";
import { mapDbProjectToPortfolioProject } from "@/lib/services/portfolio-project-mapper";

async function loadFromSupabase(): Promise<PortfolioProject[]> {
  const projects = await getCatalogProjects();
  const out: PortfolioProject[] = [];
  for (const p of projects) {
    const images = await getCatalogProjectImages(p.id);
    out.push(mapDbProjectToPortfolioProject(p, images));
  }
  return out;
}

function portfolioDataMode(): "auto" | "supabase" | "static" {
  const m = process.env.PORTFOLIO_DATA?.trim().toLowerCase();
  if (m === "static" || m === "supabase" || m === "auto") {
    return m;
  }
  return "auto";
}

function isSupabaseEnvPresent(): boolean {
  try {
    getSupabasePublicConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Work overview + detail pages: ordered list of public portfolio projects.
 * - `PORTFOLIO_DATA=static` — always static `lib/portfolio-data.ts`
 * - `PORTFOLIO_DATA=supabase` — database only (throws if misconfigured / empty)
 * - `PORTFOLIO_DATA=auto` or unset — Supabase when available and non-empty, else static
 */
export async function loadWorkPortfolioProjects(): Promise<PortfolioProject[]> {
  const mode = portfolioDataMode();
  if (mode === "static") {
    return getStaticPortfolioProjects();
  }

  if (mode === "auto" && !isSupabaseEnvPresent()) {
    return getStaticPortfolioProjects();
  }

  try {
    const fromDb = await loadFromSupabase();
    if (fromDb.length > 0) {
      return fromDb;
    }
    if (mode === "supabase") {
      throw new Error(
        "PORTFOLIO_DATA=supabase but the database returned no public projects.",
      );
    }
  } catch (e) {
    if (mode === "supabase") {
      throw e;
    }
    if (e instanceof SupabaseConfigError) {
      console.warn(
        "[portfolio] Supabase env missing — using static portfolio data.",
      );
      return getStaticPortfolioProjects();
    }
    console.warn(
      "[portfolio] Supabase read failed — using static portfolio data.",
      e,
    );
    return getStaticPortfolioProjects();
  }

  return getStaticPortfolioProjects();
}

export async function loadPortfolioProjectBySlug(
  slug: string,
): Promise<PortfolioProject | null> {
  const mode = portfolioDataMode();
  if (mode === "static") {
    return getStaticProjectBySlug(slug) ?? null;
  }

  if (mode === "auto" && !isSupabaseEnvPresent()) {
    return getStaticProjectBySlug(slug) ?? null;
  }

  try {
    const project = await getCatalogProjectBySlug(slug);
    if (!project) {
      if (mode === "supabase") {
        return null;
      }
      return getStaticProjectBySlug(slug) ?? null;
    }
    const images = await getCatalogProjectImages(project.id);
    if (images.length === 0) {
      if (mode === "supabase") {
        return null;
      }
      const fallback = getStaticProjectBySlug(slug);
      if (fallback) {
        console.warn(
          `[portfolio] "${slug}" has no images in DB — using static fallback.`,
        );
      }
      return fallback ?? null;
    }
    return mapDbProjectToPortfolioProject(project, images);
  } catch (e) {
    if (mode === "supabase") {
      throw e;
    }
    if (e instanceof SupabaseConfigError) {
      return getStaticProjectBySlug(slug) ?? null;
    }
    console.warn(
      `[portfolio] Supabase read failed for "${slug}" — static fallback.`,
      e,
    );
    return getStaticProjectBySlug(slug) ?? null;
  }
}

export async function loadPortfolioAdjacentProjects(slug: string): Promise<{
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
}> {
  const list = await loadWorkPortfolioProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: i > 0 ? list[i - 1]! : null,
    next: i < list.length - 1 ? list[i + 1]! : null,
  };
}
