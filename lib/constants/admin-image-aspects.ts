/**
 * Preset Tailwind aspect utilities for gallery frames (aligned with editorial portfolio usage).
 */
export const ADMIN_IMAGE_ASPECT_PRESETS: readonly { value: string; label: string }[] = [
  { value: "aspect-[4/5] sm:aspect-[16/10]", label: "Mixed hero (4:5 → 16:10)" },
  { value: "aspect-[4/5] sm:aspect-[21/9]", label: "Cinematic hero" },
  { value: "aspect-[9/16] sm:aspect-[3/4]", label: "Cinematic tall" },
  { value: "aspect-[16/10] sm:aspect-[2/1]", label: "Cinematic wide" },
  { value: "aspect-[3/4]", label: "Portrait 3:4" },
  { value: "aspect-[4/3]", label: "Wide 4:3" },
  { value: "aspect-[3/4] sm:aspect-[2/3]", label: "Mixed tall" },
  { value: "aspect-square", label: "Square" },
];
