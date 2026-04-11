"use client";

import type { ProjectImage } from "@/lib/portfolio-data";
import { ClientImageActions } from "@/components/gallery/client-image-actions";
import {
  GalleryTileMedia,
  galleryGridCardBorderPublic,
  type GalleryTileOverlayMode,
} from "@/components/gallery/gallery-tile-primitive";
import type { GalleryLoupeTone } from "@/components/gallery/gallery-hover-loupe";
import {
  galleryTileShellPublic,
  linkFocusVisible,
  tapSoft,
  transitionImageHover,
  typeCaption,
} from "@/lib/editorial";

export type PublicGridPresentation = "default" | "featureSoft";

export type GalleryFramePublicProps = {
  image: ProjectImage;
  className?: string;
  aspectClass?: string;
  sizes?: string;
  clientDownload?: { token: string; projectSlug: string };
  onOpen?: () => void;
  variant?: "editorial" | "grid";
  /** Public grid only — calmer overlay + loupe on editorial feature tiles. */
  publicGridPresentation?: PublicGridPresentation;
  /** When true, caption is not rendered under the frame (e.g. shown as gallery intro above the grid). */
  suppressCaption?: boolean;
  /** When caption is lifted to intro, links zoom affordance to that element for screen readers. */
  ariaDescribedBy?: string;
  /**
   * Grid variant only: extra classes on the aspect-ratio media shell (e.g. subtle hover scale).
   */
  gridMediaShellClassName?: string;
};

/**
 * Portfolio / showcase tile — no selection UI, no client-selection imports.
 */
export function GalleryFramePublic({
  image,
  className = "",
  aspectClass,
  sizes,
  clientDownload,
  onOpen,
  variant = "editorial",
  publicGridPresentation = "default",
  suppressCaption = false,
  ariaDescribedBy,
  gridMediaShellClassName = "",
}: GalleryFramePublicProps) {
  const ratio = aspectClass ?? image.aspectClass;
  const isGrid = variant === "grid";
  const overlayMode: GalleryTileOverlayMode = isGrid
    ? publicGridPresentation === "featureSoft"
      ? "publicGridSoft"
      : "publicGrid"
    : "editorial";
  const loupeTone: GalleryLoupeTone =
    isGrid && publicGridPresentation === "featureSoft" ? "soft" : "default";
  const shellClass = isGrid ? `${galleryTileShellPublic} ${galleryGridCardBorderPublic}` : "";
  const buttonMotion = isGrid ? "" : transitionImageHover;

  const showActionsRow = Boolean(clientDownload && image.imageId && image.storageBacked);
  const zoomAriaDescribedBy =
    suppressCaption && ariaDescribedBy?.trim() ? ariaDescribedBy.trim() : undefined;

  return (
    <figure className={`group ${className}`}>
      {onOpen ? (
        isGrid ? (
          <div
            className={`relative w-full origin-center overflow-hidden text-left ${ratio} ${shellClass} bg-zinc-900 ${gridMediaShellClassName}`.trim()}
          >
            <GalleryTileMedia
              image={image}
              sizes={sizes}
              variant="grid"
              overlayMode={overlayMode}
              showLoupe
              loupeTone={loupeTone}
            />
            <button
              type="button"
              onClick={onOpen}
              aria-label="Open image larger"
              aria-describedby={zoomAriaDescribedBy}
              className={`absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0 text-left ${linkFocusVisible} ${tapSoft}`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            aria-label="Open image larger"
            aria-describedby={zoomAriaDescribedBy}
            className={`relative w-full origin-center overflow-hidden text-left ${ratio} cursor-zoom-in ${buttonMotion} ${linkFocusVisible} ${tapSoft} bg-zinc-900`}
          >
            <GalleryTileMedia
              image={image}
              sizes={sizes}
              variant="editorial"
              overlayMode="editorial"
            />
          </button>
        )
      ) : (
        <div
          className={`relative w-full origin-center overflow-hidden bg-zinc-900 ${ratio} ${shellClass} ${gridMediaShellClassName}`.trim()}
        >
          <GalleryTileMedia
            image={image}
            sizes={sizes}
            variant={isGrid ? "grid" : "editorial"}
            overlayMode={overlayMode}
            showLoupe={isGrid}
            loupeTone={isGrid ? loupeTone : "default"}
          />
        </div>
      )}
      {image.caption && !suppressCaption ? (
        <figcaption className={typeCaption}>{image.caption}</figcaption>
      ) : null}
      {showActionsRow ? (
        <ClientImageActions image={image} clientDownload={clientDownload} useClientSelection={false} />
      ) : null}
    </figure>
  );
}
