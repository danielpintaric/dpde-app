import type { Project, ProjectVisibility } from "@/types/project";

function visibilityWord(v: ProjectVisibility): string {
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

function formatYear(project: Project): string | null {
  const y = project.year?.trim();
  if (y) {
    return y;
  }
  const d = new Date(project.createdAt);
  const n = d.getFullYear();
  return Number.isNaN(n) ? null : String(n);
}

/** Slug · Visibility · Jahr — z. B. über der Projekt-ID in der Editor-Seitenleiste. */
export function ProjectEditorMetaLine({ project }: { project: Project }) {
  const year = formatYear(project);

  return (
    <p className="mb-2 text-[12px] leading-snug text-zinc-500">
      <span className="font-mono" title="URL slug">
        {project.slug}
      </span>
      <span className="mx-2 text-zinc-700" aria-hidden>
        ·
      </span>
      <span>{visibilityWord(project.visibility)}</span>
      {year ? (
        <>
          <span className="mx-2 text-zinc-700" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{year}</span>
        </>
      ) : null}
    </p>
  );
}
