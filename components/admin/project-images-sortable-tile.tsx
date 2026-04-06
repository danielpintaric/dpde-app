"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NextImage from "next/image";
import { deleteProjectImageAction, setProjectCoverImageAction } from "@/lib/actions/admin-image-actions";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import type { Image, Project } from "@/types/project";

type Props = {
  id: string;
  image: Image;
  project: Project;
  positionLabel: string;
  isSelected: boolean;
  isBulkSelected?: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  onSelectableKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onBulkToggle?: (id: string) => void;
};

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectImagesSortableTile({
  id,
  image: img,
  project,
  positionLabel,
  isSelected,
  isBulkSelected = false,
  disabled,
  onSelect,
  onSelectableKeyDown,
  onBulkToggle,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, disabled });

  const preview = getAdminImagePreviewUrl(img);
  const isCover = project.coverImageId === img.id;
  const identity = img.filename || img.storagePath || img.id.slice(0, 8);

  const transformStr = transform ? CSS.Transform.toString(transform) : null;
  const style: React.CSSProperties = {
    transform: isDragging
      ? transformStr
        ? `${transformStr} scale(1.035)`
        : "scale(1.035)"
      : transformStr ?? undefined,
    transition: transition ?? undefined,
    zIndex: isDragging ? 40 : undefined,
  };

  const dropTarget = isOver && !isDragging;

  return (
    <li ref={setNodeRef} style={style} className="min-w-0 list-none">
      <div
        className={[
          "group/tile relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-zinc-950/55 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out",
          isDragging
            ? "z-10 border-zinc-500/50 bg-zinc-900/70 shadow-xl shadow-black/50 ring-1 ring-white/10"
            : "",
          !isDragging && isSelected
            ? "border-zinc-400/45 bg-zinc-900/62 shadow-md shadow-black/30 ring-1 ring-zinc-100/12"
            : "",
          !isDragging && !isSelected
            ? `border-zinc-800/85 shadow-black/20 hover:border-zinc-600/70 hover:bg-zinc-900/45 hover:shadow-md hover:shadow-black/25${
                isBulkSelected ? " shadow-[inset_3px_0_0_0_rgba(56,189,248,0.22)]" : ""
              }`
            : "",
          dropTarget ? "border-zinc-600/50 ring-1 ring-inset ring-emerald-400/20" : "",
        ].join(" ")}
      >
        <div className="flex items-center gap-1.5 border-b border-zinc-800/55 bg-zinc-900/25 px-2 py-1.5 transition-colors duration-200 group-hover/tile:bg-zinc-900/40">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label={`Reorder: ${identity}`}
            title="Drag to reorder"
            className="flex h-7 w-7 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md text-zinc-500 outline-none transition-colors duration-200 hover:bg-zinc-800/80 hover:text-zinc-300 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex flex-col gap-0.5 opacity-80" aria-hidden>
              <span className="mx-auto block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="mx-auto block h-0.5 w-3.5 rounded-full bg-current" />
              <span className="mx-auto block h-0.5 w-3.5 rounded-full bg-current" />
            </span>
          </button>
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium tracking-wide text-zinc-500 transition-colors duration-200 group-hover/tile:text-zinc-400">
            Order
          </span>
          {onBulkToggle ? (
            <label className="flex shrink-0 cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={isBulkSelected}
                disabled={disabled}
                aria-label={`Multi-select: ${identity}`}
                onChange={() => onBulkToggle(img.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900 text-zinc-200 focus:ring-1 focus:ring-zinc-500/50"
              />
            </label>
          ) : null}
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          aria-label={`Select image: ${identity}`}
          onClick={() => onSelect(img.id)}
          onKeyDown={(e) => onSelectableKeyDown(e, img.id)}
          className="cursor-pointer outline-none transition-[opacity] duration-200 focus-visible:ring-2 focus-visible:ring-zinc-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            <NextImage
              src={preview}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 34vw, 32vw"
              unoptimized
              className="object-cover object-center transition-[filter,transform] duration-200 ease-out group-hover/tile:brightness-[1.03] group-hover/tile:saturate-[1.02]"
            />
            <span
              className="pointer-events-none absolute right-2 top-2 rounded border border-zinc-700/45 bg-zinc-950/92 px-1.5 py-px font-mono text-[9px] tabular-nums text-zinc-400"
              title="Gallery position"
            >
              {positionLabel}
            </span>
            {img.externalUrl?.trim() ? (
              <span className="pointer-events-none absolute left-2 top-2 rounded border border-zinc-700/45 bg-zinc-950/92 px-1.5 py-px text-[8px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                Legacy
              </span>
            ) : null}
            {isCover ? (
              <span className="pointer-events-none absolute bottom-2 left-2 rounded border border-zinc-600/40 bg-zinc-900/88 px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-300/90">
                Cover
              </span>
            ) : null}
          </div>

          <p
            className="truncate border-t border-zinc-800/45 bg-zinc-950/20 px-2.5 py-1.5 font-mono text-[10px] text-zinc-500 transition-colors duration-200 group-hover/tile:text-zinc-400"
            title={identity}
          >
            {identity}
          </p>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-zinc-800/55 bg-zinc-950/30 px-2 py-1.5 transition-colors duration-200 group-hover/tile:bg-zinc-900/35">
          {!isCover ? (
            <form action={setProjectCoverImageAction} className="shrink-0">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="imageId" value={img.id} />
              <input type="hidden" name="projectSlug" value={project.slug} />
              <button
                type="submit"
                title="Set as cover"
                aria-label="Set as cover"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-700/45 bg-zinc-900/30 text-zinc-500 transition-[border-color,background-color,color] duration-200 ease-out hover:border-zinc-500/60 hover:bg-zinc-800/45 hover:text-zinc-200"
              >
                <IconStar className="opacity-90" />
              </button>
            </form>
          ) : (
            <span
              className="mr-auto py-1 pl-0.5 text-[10px] font-medium tracking-wide text-zinc-600"
              title="This image is the cover"
            >
              Current cover
            </span>
          )}

          <form
            action={deleteProjectImageAction}
            className="shrink-0"
            onSubmit={(e) => {
              if (
                !window.confirm(
                  "Permanently delete this image? This cannot be undone.",
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="imageId" value={img.id} />
            <input type="hidden" name="projectSlug" value={project.slug} />
            <button
              type="submit"
              title="Permanently delete image (cannot be undone)"
              aria-label="Permanently delete image"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-950/40 bg-red-950/15 text-red-400/80 transition-[border-color,background-color,color] duration-200 ease-out hover:border-red-900/55 hover:bg-red-950/28 hover:text-red-300"
            >
              <IconTrash className="opacity-90" />
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
