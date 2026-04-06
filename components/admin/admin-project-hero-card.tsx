import Image from "next/image";
import Link from "next/link";
import {
  imageCountLabel,
  visibilityBadgeClass,
  visibilityLabel,
  yearHint,
} from "@/components/admin/admin-project-list-shared";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import type { AdminProjectListEntry } from "@/types/admin";

type Props = {
  entry: AdminProjectListEntry;
};

export function AdminProjectHeroCard({ entry }: Props) {
  const { project, imageCount, coverImage } = entry;
  const href = `/admin/projects/${project.id}/edit`;
  const year = yearHint(project);
  const preview = coverImage ? getAdminImagePreviewUrl(coverImage) : null;

  return (
    <Link
      href={href}
      className="group/hero relative block overflow-hidden rounded-2xl border border-zinc-800/85 bg-zinc-950/45 shadow-md shadow-black/25 outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-out hover:border-zinc-600/65 hover:bg-white/5 hover:shadow-lg hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <div className="relative aspect-[16/10] w-full bg-zinc-900 sm:aspect-[16/9]">
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            unoptimized
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-balance text-lg font-semibold tracking-tight text-zinc-50 drop-shadow-sm transition-colors duration-200 group-hover/hero:text-white sm:text-xl md:text-2xl">
                {project.title}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                <span className="font-mono text-zinc-400" title="URL slug">
                  {project.slug}
                </span>
                {year ? (
                  <>
                    <span className="text-zinc-600" aria-hidden>
                      ·
                    </span>
                    <span className="tabular-nums text-zinc-400">{year}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm ${visibilityBadgeClass(project.visibility)}`}
              >
                {visibilityLabel(project.visibility)}
              </span>
              <span className="rounded-md border border-zinc-700/50 bg-zinc-950/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-400 backdrop-blur-sm">
                {imageCountLabel(imageCount)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="rounded-lg border border-zinc-600/50 bg-zinc-950/55 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-colors duration-200 group-hover/hero:border-zinc-500/60 group-hover/hero:bg-zinc-900/70 group-hover/hero:text-zinc-100">
              Edit
            </span>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-600/45 bg-zinc-950/45 text-zinc-400 backdrop-blur-sm transition-colors duration-200 group-hover/hero:border-zinc-500/55 group-hover/hero:text-zinc-200"
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
  );
}
