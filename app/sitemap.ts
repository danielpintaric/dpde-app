import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/public-config";
import { loadWorkPortfolioProjects } from "@/lib/services/portfolio-view-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const lastModified = new Date();

  const staticPaths = ["", "/about", "/contact", "/portfolio"] as const;

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const portfolioProjects = await loadWorkPortfolioProjects();

  for (const p of portfolioProjects) {
    entries.push({
      url: `${base}/portfolio/${p.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
