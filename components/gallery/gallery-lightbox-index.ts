import type { ProjectImage } from "@/lib/portfolio-data";

export function resolveLightboxIndexForGridImage(
  gridImages: ProjectImage[],
  gridIndex: number,
  lightboxImages: ProjectImage[],
): number {
  const body = gridImages[gridIndex];
  if (!body) return 0;
  const idx = lightboxImages.findIndex((im) =>
    im.imageId && body.imageId ? im.imageId === body.imageId : im.src === body.src,
  );
  return idx >= 0 ? idx : 0;
}
