import Image from "next/image";
import Link from "next/link";
import { categoryHint, imageCountLabel, yearHint } from "@/components/admin/admin-project-list-shared";
import { ProjectVisibilityControl } from "@/components/admin/project-visibility-control";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import type { AdminProjectListEntry } from "@/types/admin";

type Props = {
  entry: AdminProjectListEntry;
};

export function AdminProjectCompactCard({ entry }: Props) {
  const { project, imageCount, coverImage } = entry;
  const href = `/admin/projects/${project.id}/edit`;
  const year = yearHint(project);
  const category = categoryHint(project);
  const preview = coverImage ? getAdminImagePreviewUrl(coverImage) : null;

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/45 shadow-sm shadow-black/15 transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-zinc-600/55 hover:shadow-md hover:shadow-black/20">
      <Link
        href={href}
        className="group/card flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <div className="relative aspect-[5/4] w-full shrink-0 bg-zinc-900">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-300 ease-out group-hover/card:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-[11px] font-medium text-zinc-600"
              aria-hidden
            >
              No cover
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug tracking-tight text-zinc-100 transition-colors duration-200 group-hover/card:text-white sm:text-[0.95rem]">
              {project.title}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-zinc-500">
              {year ? <span className="tabular-nums text-zinc-400">{year}</span> : null}
              {year && category ? <span aria-hidden>·</span> : null}
              {category ? <span>{category}</span> : null}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] text-zinc-600" title={project.slug}>
              {project.slug}
            </p>
          </div>
        </div>

        <span className="sr-only">Edit project {project.title}</span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-b-xl border-t border-zinc-800/50 px-3.5 py-2.5 sm:px-4">
        <ProjectVisibilityControl
          dense
          projectId={project.id}
          initialVisibility={project.visibility}
        />
        <span className="shrink-0 pt-0.5 text-[10px] tabular-nums text-zinc-600 sm:pt-1">
          {imageCountLabel(imageCount)}
        </span>
      </div>
    </div>
  );
}
