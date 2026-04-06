/** Shared hero slideshow interval (seconds). Safe for client + server. */

export const LANDING_HERO_DEFAULT_INTERVAL_SECONDS = 8;
export const LANDING_HERO_INTERVAL_MIN_SECONDS = 4;
export const LANDING_HERO_INTERVAL_MAX_SECONDS = 20;

export function clampHeroIntervalSeconds(n: number): number {
  if (!Number.isFinite(n)) {
    return LANDING_HERO_DEFAULT_INTERVAL_SECONDS;
  }
  return Math.min(
    LANDING_HERO_INTERVAL_MAX_SECONDS,
    Math.max(LANDING_HERO_INTERVAL_MIN_SECONDS, Math.round(n)),
  );
}
