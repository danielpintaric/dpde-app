import Image from "next/image";
import type { ProjectImage } from "@/lib/portfolio-data";
import { resolveProjectImageObjectPosition } from "@/lib/image-object-position";
import { ClientImageActions } from "@/components/gallery/client-image-actions";
import { GalleryHoverLoupe } from "@/components/gallery/gallery-hover-loupe";
import {
  defaultImageToneClasses,
  editorialImageMotion,
  editorialImageOverlay,
  galleryGridImageBase,
  galleryTileMediaOverlay,
  galleryTileShell,
  linkFocusVisible,
  tapSoft,
  transitionImageHover,
  typeCaption,
} from "@/lib/editorial";

const gridCardBorderDefault = "border-zinc-800/60";
const gridCardBorderSelected = "border-zinc-600/95";

export type GalleryFrameProps = {
  image: ProjectImage;
  className?: string;
  /** When the editorial layout needs a different geometry than the asset default */
  aspectClass?: string;
  /** Passed to next/image sizes for LCP-friendly hints */
  sizes?: string;
  /** Token-based client area: per-image download link */
  clientDownload?: { token: string; projectSlug: string };
  /** Requires ClientSelectionProvider ancestor (client token project view). */
  useClientSelection?: boolean;
  /** Opens lightbox when the image area is activated (click / keyboard) */
  onOpen?: () => void;
  /**
   * `editorial`: legacy per-image aspect + image zoom hover.
   * `grid`: uniform gallery card — border, subtle card scale, no image zoom.
   */
  variant?: "editorial" | "grid";
  /** Selection highlight (grid + client selection) */
  selected?: boolean;
};

export function GalleryFrame({
  image,
  className = "",
  aspectClass,
  sizes,
  clientDownload,
  useClientSelection = false,
  onOpen,
  variant = "editorial",
  selected = false,
}: GalleryFrameProps) {
  const ratio = aspectClass ?? image.aspectClass;
  const objectPosition = resolveProjectImageObjectPosition(image);
  const isGrid = variant === "grid";

  const borderClass = isGrid
    ? `${galleryTileShell} ${selected ? gridCardBorderSelected : gridCardBorderDefault}`
    : "";

  const tone = image.imageFilterClass?.trim() || defaultImageToneClasses;
  const mediaClasses = isGrid
    ? `${galleryGridImageBase} ${tone}`
    : `object-cover ${tone} ${editorialImageMotion}`;
  const overlayClasses = isGrid ? galleryTileMediaOverlay : editorialImageOverlay;

  const media = (
    <>
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes ?? "(min-width: 1280px) min(72rem, 88vw), 100vw"}
        className={mediaClasses}
        style={{ objectPosition }}
      />
      <div className={overlayClasses} aria-hidden />
      {isGrid && onOpen ? <GalleryHoverLoupe /> : null}
    </>
  );

  const buttonMotion = isGrid ? "" : transitionImageHover;

  return (
    <figure className={`group ${className}`}>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open image larger"
          className={`relative w-full origin-center overflow-hidden text-left ${ratio} cursor-zoom-in ${buttonMotion} ${linkFocusVisible} ${tapSoft} ${borderClass} ${!isGrid ? "bg-zinc-900" : ""}`}
        >
          {media}
          {selected && isGrid ? (
            <span
              className="pointer-events-none absolute right-2 top-2 z-[3] flex h-5 w-5 items-center justify-center rounded-full border border-zinc-500/55 bg-zinc-950/75 text-[10px] text-zinc-200/95 shadow-sm transition-[opacity,border-color] duration-200 ease-out"
              aria-hidden
            >
              ✓
            </span>
          ) : null}
        </button>
      ) : (
        <div className={`relative w-full origin-center overflow-hidden bg-zinc-900 ${ratio} ${borderClass}`}>
          {media}
        </div>
      )}
      {image.caption ? <figcaption className={typeCaption}>{image.caption}</figcaption> : null}
      {(clientDownload && image.imageId && image.storageBacked) ||
      (useClientSelection && image.imageId) ? (
        <ClientImageActions
          image={image}
          clientDownload={clientDownload}
          useClientSelection={useClientSelection}
        />
      ) : null}
    </figure>
  );
}
