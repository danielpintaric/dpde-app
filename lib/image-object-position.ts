import type { PortfolioProject, ProjectImage } from "@/lib/portfolio-data";
import type { Image } from "@/types/project";

const DEFAULT_POS = "50% 50%";

export function clampFocal(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hasFocalPair(
  img: Pick<ProjectImage, "focalX" | "focalY"> | Pick<Image, "focalX" | "focalY">,
): img is { focalX: number; focalY: number } {
  return (
    typeof img.focalX === "number" &&
    typeof img.focalY === "number" &&
    !Number.isNaN(img.focalX) &&
    !Number.isNaN(img.focalY)
  );
}

/** DB `Image` → CSS `object-position` (focal wins over legacy string). */
export function resolveImageObjectPosition(
  img: Pick<Image, "focalX" | "focalY" | "objectPosition">,
): string {
  if (hasFocalPair(img)) {
    return `${clampFocal(img.focalX)}% ${clampFocal(img.focalY)}%`;
  }
  const o = img.objectPosition?.trim();
  if (o) return o;
  return DEFAULT_POS;
}

/** Public `ProjectImage` → CSS `object-position`. */
export function resolveProjectImageObjectPosition(
  img: Pick<ProjectImage, "focalX" | "focalY" | "objectPosition">,
): string {
  if (hasFocalPair(img)) {
    return `${clampFocal(img.focalX)}% ${clampFocal(img.focalY)}%`;
  }
  const o = img.objectPosition?.trim();
  if (o) return o;
  return DEFAULT_POS;
}

/** Cover row for hero / index thumb `object-position`. */
export function coverProjectImage(project: PortfolioProject): ProjectImage | null {
  if (project.coverImageId) {
    const im = project.images.find((i) => i.imageId === project.coverImageId);
    if (im) return im;
  }
  return project.images[0] ?? null;
}
