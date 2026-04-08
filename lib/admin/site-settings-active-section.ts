import { SITE_SECTION_IDS } from "@/lib/admin/site-sections";

/** Pixels: delay switching to the next section until its heading is clearly past the scan line. */
const HYST_SCROLL_DOWN_PX = 22;
/** Pixels: delay switching to the previous section until the current section’s title has cleared the band. */
const HYST_SCROLL_UP_PX = 20;
const BOTTOM_SNAP_PX = 12;

/**
 * Stable scroll-spy: pick the active section from viewport geometry relative to a horizontal scan line
 * (below sticky header + section nav). Uses small hysteresis between adjacent sections to reduce flicker.
 * Non-adjacent jumps (e.g. anchor) apply no hysteresis.
 */
export function computeActiveSiteSectionId(
  targetLineFromViewportTop: number,
  previousId: string | null,
): string {
  if (typeof window === "undefined") {
    return SITE_SECTION_IDS[0]!;
  }

  const { scrollY, innerHeight } = window;
  const scrollHeight = document.documentElement.scrollHeight;
  const lastId = SITE_SECTION_IDS[SITE_SECTION_IDS.length - 1]!;

  if (scrollY + innerHeight >= scrollHeight - BOTTOM_SNAP_PX) {
    return lastId;
  }

  const metrics = SITE_SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return { id, top: el?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY };
  });

  let rawIdx = -1;
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].top <= targetLineFromViewportTop) {
      rawIdx = i;
    }
  }
  if (rawIdx < 0) {
    return SITE_SECTION_IDS[0]!;
  }

  let candidate = metrics[rawIdx].id;

  if (!previousId) {
    return candidate;
  }

  const pi = SITE_SECTION_IDS.indexOf(previousId);
  if (pi < 0) {
    return candidate;
  }

  if (rawIdx === pi) {
    return previousId;
  }

  if (Math.abs(rawIdx - pi) > 1) {
    return candidate;
  }

  if (rawIdx === pi + 1) {
    const nextTop = metrics[rawIdx].top;
    if (nextTop > targetLineFromViewportTop - HYST_SCROLL_DOWN_PX) {
      return previousId;
    }
  } else if (rawIdx === pi - 1) {
    const prevSectionTop = metrics[pi].top;
    if (prevSectionTop <= targetLineFromViewportTop + HYST_SCROLL_UP_PX) {
      return previousId;
    }
  }

  return candidate;
}
