import type { Project, ProjectVisibility } from "@/types/project";

export function visibilityBadgeClass(v: ProjectVisibility): string {
  switch (v) {
    case "public":
      return "border-emerald-900/50 bg-emerald-950/35 text-emerald-200/90";
    case "unlisted":
      return "border-amber-900/45 bg-amber-950/30 text-amber-200/85";
    case "private":
    default:
      return "border-zinc-700/60 bg-zinc-900/50 text-zinc-400";
  }
}

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

export function imageCountLabel(n: number): string {
  if (n === 0) {
    return "No images";
  }
  if (n === 1) {
    return "1 image";
  }
  return `${n} images`;
}
