import type { Project, ProjectVisibility } from "@/types/project";

export function visibilityLabel(v: ProjectVisibility): string {
  switch (v) {
    case "public":
      return "Public";
    case "unlisted":
      return "Unlisted";
    case "private":
      return "Private";
    default:
      return v;
  }
}

export function yearHint(project: Project): string | null {
  const y = project.year?.trim();
  if (y) {
    return y;
  }
  const d = new Date(project.createdAt);
  const n = d.getFullYear();
  return Number.isNaN(n) ? null : String(n);
}

/** Category label for list cards (trimmed or null). */
export function categoryHint(project: Project): string | null {
  const c = project.category?.trim();
  return c || null;
}

/** Ruhige, neutrale Chips für Übersichtsseiten (ohne Farbakzente). */
export function visibilityBadgeClassNeutral(): string {
  return "border-zinc-700/50 bg-zinc-950/55 text-zinc-500";
}

export function imageCountLabel(n: number): string {
  if (n === 0) {
    return "No images";
  }
  if (n === 1) {
    return "1 image";
  }
  return `${n} images`;
}
