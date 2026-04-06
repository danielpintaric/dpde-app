import Link from "next/link";
import type { Project } from "@/types/project";

type Props = {
  project: Project;
  prevId: string | null;
  nextId: string | null;
  position: number;
  total: number;
  positionUnknown?: boolean;
};

const toolLink =
  "rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 outline-none transition-colors duration-200 hover:bg-white/[0.04] hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:text-[12px]";

const navLinkActive = `${toolLink} text-zinc-400 hover:text-zinc-100`;

const navDisabled =
  "cursor-default rounded-md px-2 py-1 text-[11px] font-medium text-zinc-600 sm:text-[12px]";

export function ProjectEditorWorkflowNav({
  project,
  prevId,
  nextId,
  position,
  total,
  positionUnknown = false,
}: Props) {
  const toolbar = (
    <>
      <Link
        href="/admin/projects"
        className={`${toolLink} inline-flex shrink-0 items-center gap-1 text-zinc-400`}
      >
        <span aria-hidden className="text-zinc-600">
          ←
        </span>
        Projects
      </Link>

      <span className="hidden h-3 w-px shrink-0 bg-zinc-700/80 sm:block" aria-hidden />

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 sm:gap-x-2">
        {prevId ? (
          <Link href={`/admin/projects/${prevId}/edit`} className={navLinkActive}>
            Previous
          </Link>
        ) : (
          <span className={navDisabled} aria-disabled="true">
            Previous
          </span>
        )}
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-600 sm:text-[11px]">
          {positionUnknown ? "—" : position} / {total}
        </span>
        {nextId ? (
          <Link href={`/admin/projects/${nextId}/edit`} className={navLinkActive}>
            Next
          </Link>
        ) : (
          <span className={navDisabled} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </>
  );

  return (
    <header className="mb-3 border-b border-zinc-800/80 pb-2 sm:mb-3 sm:pb-2.5">
      <p className="mb-0 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-zinc-600/85">
        Edit project
      </p>
      <div className="mt-1.5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
        <h1 className="order-2 min-w-0 flex-1 truncate font-serif text-2xl font-semibold tracking-tight text-zinc-50 sm:order-1 sm:pr-4 sm:text-[1.7rem] sm:leading-tight">
          {project.title}
        </h1>
        <div className="order-1 flex min-w-0 justify-end sm:order-2 sm:shrink-0">
          <nav
            aria-label="Project navigation"
            className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1"
          >
            {toolbar}
          </nav>
        </div>
      </div>
    </header>
  );
}
