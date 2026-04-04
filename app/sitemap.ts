import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/public-config";
import { getPortfolioProjects } from "@/lib/portfolio-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const lastModified = new Date();

  const staticPaths = ["", "/about", "/contact", "/portfolio"] as const;

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  for (const p of getPortfolioProjects()) {
    entries.push({
      url: `${base}/portfolio/${p.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
