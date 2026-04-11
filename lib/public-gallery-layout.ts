/**
 * Public portfolio gallery layout (STEP 26A).
 *
 * - **Index 0**: opener / lead — landscape frame, larger `sizes` hint, softer presentation.
 * - **Series** (index ≥ 1): uniform portrait tiles — same aspect, no alternating wide slots,
 *   no per-chunk pattern cycle. {@link PUBLIC_PORTFOLIO_SERIES_ROW_SIZE} images per `<ul>` (one
 *   horizontal pair) for a steady portfolio rhythm (STEP 26C). Ungerade Rest: ein voller
 *   Landscape-Slot wie der Lead (kein schmales Zentrier-Orphan).
 */

/** One row of the public series = one pair of images (STEP 26C — avoids 2×2 + orphan “L”). */
export const PUBLIC_PORTFOLIO_SERIES_ROW_SIZE = 2 as const;

/** Uniform 2-column grid for each series row (one pair per `<ul>`; mobile + desktop). */
export const PUBLIC_PORTFOLIO_SERIES_GRID_CLASS =
  "grid w-full grid-cols-2 gap-x-5 gap-y-0 sm:gap-x-6 md:gap-x-8 lg:gap-x-10";

export type PublicGalleryTileVariant = "standard" | "wide";

export type PublicGalleryLayout = {
  variant: PublicGalleryTileVariant;
  /** Classes for the grid `<li>` (includes responsive column span). */
  itemClassName: string;
  /** Series tiles use portrait `aspect-[4/5]`; lead (index 0) uses landscape. */
  aspectClassName: string;
  /** `sizes` hint for next/image — wider tiles request a bit more width. */
  sizes: string;
  /** Softer overlay + loupe on feature tiles (public editorial only). */
  publicGridPresentation: "default" | "featureSoft";
};

const SIZES_STANDARD =
  "(min-width: 1024px) 22vw, (min-width: 768px) 28vw, (min-width: 640px) 45vw, 50vw";

/** Lead opener + sole full-width series row — match project hero `sizes` */
export const PUBLIC_GALLERY_LEAD_SIZES =
  "(max-width: 1280px) calc(100vw - 3rem), 1152px" as const;

/** Landscape rail shared by lead (index 0) and optional sole orphan row */
export const PUBLIC_GALLERY_LEAD_ASPECT_CLASS = "aspect-[16/10]" as const;

function layoutForRole(role: PublicGalleryTileVariant): PublicGalleryLayout {
  switch (role) {
    case "wide":
      return {
        variant: "wide",
        itemClassName: "min-w-0",
        aspectClassName: PUBLIC_GALLERY_LEAD_ASPECT_CLASS,
        sizes: PUBLIC_GALLERY_LEAD_SIZES,
        publicGridPresentation: "featureSoft",
      };
    default:
      return {
        variant: "standard",
        itemClassName: "min-w-0",
        aspectClassName: "aspect-[4/5]",
        sizes: SIZES_STANDARD,
        publicGridPresentation: "default",
      };
  }
}

/**
 * Resolve layout for global `index` given `total` images.
 *
 * - **Index 0**: lead / opener (when `total > 0`).
 * - **All other indices**: uniform series tile (same rhythm for every chunk).
 */
export function getPublicGalleryLayout(index: number, total: number): PublicGalleryLayout {
  if (total > 0 && index === 0) {
    return layoutForRole("wide");
  }
  return layoutForRole("standard");
}
