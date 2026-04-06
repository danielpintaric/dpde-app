/**
 * Landing-page hero uploads live under `project-images` but are isolated from `projects/<id>/…`.
 *
 * Prefix: `site/hero/slot-{1|2|3|4}/…`
 */

export const SITE_HERO_STORAGE_PREFIX = "site/hero" as const;

export type SiteHeroSlot = 1 | 2 | 3 | 4;

export function siteHeroObjectPath(slot: SiteHeroSlot, storedFilename: string): string {
  return `${SITE_HERO_STORAGE_PREFIX}/slot-${slot}/${storedFilename.replace(/^\//, "")}`;
}

const SLOT_PATH_RE = /^site\/hero\/slot-[1234]\//;

export function isSiteHeroStoragePath(path: string): boolean {
  const p = path.trim().replace(/^\//, "");
  return SLOT_PATH_RE.test(p);
}
