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

const THUMB_W = 96;
const THUMB_H = 72;

type Props = {
  entry: AdminProjectListEntry;
};

export function AdminProjectListItem({ entry }: Props) {
  const { project, imageCount, coverImage } = entry;
  const href = `/admin/projects/${project.id}/edit`;
  const year = yearHint(project);
  const preview = coverImage ? getAdminImagePreviewUrl(coverImage) : null;

  return (
    <Link
      href={href}
      className="group/link block rounded-xl border border-zinc-800/85 bg-zinc-950/45 shadow-sm shadow-black/20 outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-out hover:border-zinc-600/65 hover:bg-white/5 hover:shadow-sm hover:shadow-black/35 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <div className="flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
        <div
          className="relative shrink-0 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900 transition-[border-color] duration-200 ease-out group-hover/link:border-zinc-600/55"
          style={{ width: THUMB_W, height: THUMB_H }}
        >
          {preview ? (
            <Image
              src={preview}
              alt=""
              width={THUMB_W}
              height={THUMB_H}
              unoptimized
              className="h-full w-full object-cover object-center transition-transform duration-200 ease-out group-hover/link:scale-[1.02]"
              sizes={`${THUMB_W}px`}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[10px] font-medium tracking-wide text-zinc-600"
              aria-hidden
            >
              No cover
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-medium tracking-tight text-zinc-100 transition-colors duration-200 group-hover/link:text-white sm:text-lg">
            {project.title}
          </h2>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
            <span className="font-mono text-zinc-500" title="URL slug">
              {project.slug}
            </span>
            {year ? (
              <>
                <span className="text-zinc-700" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-zinc-500">{year}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${visibilityBadgeClass(project.visibility)}`}
            >
              {visibilityLabel(project.visibility)}
            </span>
          </div>
          <span className="text-[11px] tabular-nums text-zinc-500">{imageCountLabel(imageCount)}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg border border-zinc-700/55 bg-zinc-900/40 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors duration-200 group-hover/link:border-zinc-600/70 group-hover/link:bg-zinc-800/50 group-hover/link:text-zinc-200 sm:inline-block">
            Edit
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-zinc-500 transition-colors duration-200 group-hover/link:border-zinc-600/60 group-hover/link:text-zinc-300"
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

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/50 px-4 pb-4 sm:hidden">
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${visibilityBadgeClass(project.visibility)}`}
        >
          {visibilityLabel(project.visibility)}
        </span>
        <span className="text-[11px] tabular-nums text-zinc-500">{imageCountLabel(imageCount)}</span>
      </div>

      <span className="sr-only">Edit project {project.title}</span>
    </Link>
  );
}
