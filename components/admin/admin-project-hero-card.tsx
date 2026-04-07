import Image from "next/image";
import Link from "next/link";
import {
  categoryHint,
  imageCountLabel,
  yearHint,
} from "@/components/admin/admin-project-list-shared";
import { ProjectVisibilityControl } from "@/components/admin/project-visibility-control";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import type { AdminProjectListEntry } from "@/types/admin";

type Props = {
  entry: AdminProjectListEntry;
  /** First featured card only — LCP-friendly fetch without eager-loading every tile. */
  priority?: boolean;
};

export function AdminProjectHeroCard({ entry, priority = false }: Props) {
  const { project, imageCount, coverImage } = entry;
  const href = `/admin/projects/${project.id}/edit`;
  const year = yearHint(project);
  const category = categoryHint(project);
  const preview = coverImage ? getAdminImagePreviewUrl(coverImage) : null;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/50 shadow-md shadow-black/20 transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-zinc-600/55 hover:shadow-lg hover:shadow-black/25">
      <Link
        href={href}
        className="group/hero relative block min-h-0 shrink overflow-hidden rounded-t-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <div className="relative aspect-[3/2] w-full min-h-[180px] bg-zinc-900 sm:min-h-[200px] md:aspect-[5/3] md:min-h-[220px]">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              unoptimized
              priority={priority}
              className="object-cover object-center transition-transform duration-300 ease-out group-hover/hero:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-sm font-medium text-zinc-600"
              aria-hidden
            >
              No cover
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/10"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 sm:p-5 md:p-6">
            <div className="min-w-0">
              <h2 className="text-balance font-serif text-xl font-semibold tracking-tight text-zinc-50 drop-shadow-sm transition-colors duration-200 group-hover/hero:text-white sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {project.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400 sm:text-xs">
                {year ? <span className="tabular-nums text-zinc-300">{year}</span> : null}
                {year && category ? (
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                ) : null}
                {category ? <span className="text-zinc-400">{category}</span> : null}
                {(year || category) && project.slug ? (
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                ) : null}
                {project.slug ? (
                  <span className="font-mono text-[10px] text-zinc-500" title="URL slug">
                    {project.slug}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-0.5">
              <span className="rounded-lg border border-zinc-600/45 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur-sm transition-colors duration-200 group-hover/hero:border-zinc-500/50 group-hover/hero:bg-zinc-900/65 group-hover/hero:text-zinc-200">
                Edit
              </span>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-600/40 bg-zinc-950/50 text-zinc-500 backdrop-blur-sm transition-colors duration-200 group-hover/hero:border-zinc-500/50 group-hover/hero:text-zinc-300"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <span className="sr-only">Edit project {project.title}</span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-b-2xl border-t border-zinc-800/65 bg-zinc-950/85 px-4 py-2.5 sm:px-5">
        <ProjectVisibilityControl projectId={project.id} initialVisibility={project.visibility} />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pt-0.5">
          <span className="rounded-md border border-zinc-700/45 bg-zinc-950/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500">
            {imageCountLabel(imageCount)}
          </span>
        </div>
      </div>
    </div>
  );
}
