import Image from "next/image";
import type { ProjectImage } from "@/lib/portfolio-data";
import {
  editorialImage,
  editorialImageOverlay,
  linkFocusVisible,
  tapSoft,
  transitionImageHover,
  typeCaption,
} from "@/lib/editorial";

export type GalleryFrameProps = {
  image: ProjectImage;
  className?: string;
  /** When the editorial layout needs a different geometry than the asset default */
  aspectClass?: string;
  /** Passed to next/image sizes for LCP-friendly hints */
  sizes?: string;
  /** Opens lightbox when the image area is activated (click / keyboard) */
  onOpen?: () => void;
};

export function GalleryFrame({ image, className = "", aspectClass, sizes, onOpen }: GalleryFrameProps) {
  const ratio = aspectClass ?? image.aspectClass;
  const objectPosition = image.objectPosition ?? "center";

  const media = (
    <>
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes ?? "(min-width: 1280px) min(72rem, 88vw), 100vw"}
        className={editorialImage}
        style={{ objectPosition }}
      />
      <div className={editorialImageOverlay} aria-hidden />
    </>
  );

  return (
    <figure className={`group ${className}`}>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open image larger"
          className={`relative w-full origin-center overflow-hidden bg-zinc-900 text-left ${ratio} cursor-zoom-in ${transitionImageHover} ${linkFocusVisible} ${tapSoft}`}
        >
          {media}
        </button>
      ) : (
        <div className={`relative w-full origin-center overflow-hidden bg-zinc-900 ${ratio}`}>{media}</div>
      )}
      {image.caption ? <figcaption className={typeCaption}>{image.caption}</figcaption> : null}
    </figure>
  );
}
