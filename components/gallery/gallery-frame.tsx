import Image from "next/image";
import type { ProjectImage } from "@/lib/portfolio-data";
import { ClientImageActions } from "@/components/gallery/client-image-actions";
import { GalleryHoverLoupe } from "@/components/gallery/gallery-hover-loupe";
import {
  editorialImage,
  editorialImageOverlay,
  galleryGridImage,
  linkFocusVisible,
  tapSoft,
  transitionImageHover,
  typeCaption,
} from "@/lib/editorial";

const gridCardShell =
  "rounded-xl border bg-zinc-900 transition-all duration-200 hover:border-zinc-700 hover:scale-[1.01]";
const gridCardBorderDefault = "border-zinc-800/60";
const gridCardBorderSelected = "border-zinc-600";

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
  const objectPosition = image.objectPosition ?? "center";
  const isGrid = variant === "grid";

  const borderClass = isGrid
    ? `${gridCardShell} ${selected ? gridCardBorderSelected : gridCardBorderDefault}`
    : "";

  const mediaClasses = isGrid ? galleryGridImage : editorialImage;
  const overlayClasses = isGrid
    ? "pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10"
    : editorialImageOverlay;

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

  const interactiveTransition = isGrid ? "transition-all duration-200" : transitionImageHover;

  return (
    <figure className={`group ${className}`}>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open image larger"
          className={`relative w-full origin-center overflow-hidden text-left ${ratio} cursor-zoom-in ${interactiveTransition} ${linkFocusVisible} ${tapSoft} ${borderClass} ${!isGrid ? "bg-zinc-900" : ""}`}
        >
          {media}
          {selected && isGrid ? (
            <span
              className="pointer-events-none absolute right-2 top-2 z-[3] flex h-5 w-5 items-center justify-center rounded-full border border-zinc-500/70 bg-zinc-950/80 text-[10px] text-zinc-200"
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
