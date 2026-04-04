import Image from "next/image";
import type { ProjectImage } from "@/lib/portfolio-data";
import { editorialImage, editorialImageOverlay, typeCaption } from "@/lib/editorial";

export type GalleryFrameProps = {
  image: ProjectImage;
  className?: string;
  /** When the editorial layout needs a different geometry than the asset default */
  aspectClass?: string;
  /** Passed to next/image sizes for LCP-friendly hints */
  sizes?: string;
};

export function GalleryFrame({ image, className = "", aspectClass, sizes }: GalleryFrameProps) {
  const ratio = aspectClass ?? image.aspectClass;
  const objectPosition = image.objectPosition ?? "center";

  return (
    <figure className={`group ${className}`}>
      <div
        className={`relative w-full origin-center overflow-hidden bg-zinc-900 ${ratio}`}
      >
        <Image
          src={image.src}
          alt=""
          fill
          sizes={sizes ?? "(min-width: 1280px) min(72rem, 88vw), 100vw"}
          className={editorialImage}
          style={{ objectPosition }}
        />
        <div className={editorialImageOverlay} aria-hidden />
      </div>
      {image.caption ? <figcaption className={typeCaption}>{image.caption}</figcaption> : null}
    </figure>
  );
}
