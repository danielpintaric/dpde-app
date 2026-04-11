import Image from "next/image";
import type { ProjectImage } from "@/lib/portfolio-data";
import { resolveProjectImageObjectPosition } from "@/lib/image-object-position";
import type { GalleryLoupeTone } from "@/components/gallery/gallery-hover-loupe";
import { defaultImageToneClasses, editorialImageMotion } from "@/lib/editorial";

export type GalleryTileVariant = "editorial" | "grid";

export type GalleryTileOverlayMode =
  | "editorial"
  | "publicGrid"
  | "publicGridSoft"
  | "publicGridSupport"
  | "clientGrid";

export type GalleryTileMediaProps = {
  image: ProjectImage;
  sizes?: string;
  variant: GalleryTileVariant;
  /** Kept for API compatibility; overlays are not rendered (GPU stability). */
  overlayMode: GalleryTileOverlayMode;
  /** Kept for API compatibility; loupe is not rendered. */
  showLoupe?: boolean;
  /** Kept for API compatibility. */
  loupeTone?: GalleryLoupeTone;
};

/**
 * Shared image stack: Next/Image only — parent must be `relative` with a defined box (e.g. aspect-ratio).
 * No overlay washes, no loupe, no extra compositor layers.
 */
export function GalleryTileMedia({
  image,
  sizes,
  variant,
  overlayMode: _overlayMode,
  showLoupe: _showLoupe,
  loupeTone: _loupeTone,
}: GalleryTileMediaProps) {
  void _overlayMode;
  void _showLoupe;
  void _loupeTone;
  const objectPosition = resolveProjectImageObjectPosition(image);
  const tone = image.imageFilterClass?.trim() || defaultImageToneClasses;
  const isGrid = variant === "grid";
  const mediaClasses = isGrid
    ? `h-full w-full object-cover ${tone}`.trim()
    : `h-full w-full object-cover ${tone} ${editorialImageMotion}`.trim();

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden">
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes ?? "(min-width: 1280px) min(72rem, 88vw), 100vw"}
        className={mediaClasses}
        style={{ objectPosition }}
      />
    </div>
  );
}

export const galleryGridCardBorderPublic = "border-zinc-800/60";

/** Editorial support column — softer edge than hero / default grid public tile */
export const galleryGridCardBorderPublicSupport = "border-zinc-800/44";
export const galleryGridCardBorderClientDefault = "border-zinc-800/60";
export const galleryGridCardBorderClientSelected =
  "border-zinc-600/90 ring-1 ring-zinc-600/22 shadow-[0_0_20px_-4px_rgba(255,255,255,0.06)]";
