"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NextImage from "next/image";
import { useCallback } from "react";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import {
  galleryGridImage,
  galleryTileMediaOverlay,
  linkFocusVisible,
  portfolioIndexThumbAspect,
} from "@/lib/editorial";
import { resolveImageObjectPosition } from "@/lib/image-object-position";
import type { Image, Project } from "@/types/project";

type Props = {
  id: string;
  image: Image;
  project: Project;
  positionLabel: string;
  isSelected: boolean;
  effectiveCoverId: string | null;
  disabled: boolean;
  busyCover: boolean;
  busyDelete: boolean;
  onSelect: (id: string) => void;
  onSelectableKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onSetCover: (imageId: string) => void | Promise<void>;
  onDelete: (imageId: string) => void | Promise<void>;
  onOpenFocus: (imageId: string) => void;
  onEdit: (imageId: string) => void;
};

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 000-2.83L17.33 5.5a2 2 0 00-2.83 0L4 16.17V20z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconGrip({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="15" cy="8" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="16" r="1.5" />
      <circle cx="15" cy="16" r="1.5" />
    </svg>
  );
}

/** Outer wrapper: lift + shadow (overflow-visible so shadow is not clipped). */
const adminTileOuter =
  "rounded-xl transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "shadow-[0_4px_18px_rgba(0,0,0,0.12)] " +
  "hover:scale-[1.015] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] " +
  "active:scale-[0.992] active:transition-[transform] active:duration-[160ms]";

const actionBtn =
  `inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg ` +
  `border border-white/12 bg-zinc-950/75 text-zinc-100 shadow-sm backdrop-blur-sm ` +
  `transition-[background-color,border-color,transform] duration-200 ease-out ` +
  `hover:bg-zinc-900/90 active:scale-[0.97] disabled:cursor-wait disabled:opacity-45 ` +
  `${linkFocusVisible}`;

const overlayEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function ProjectImagesSortableTile({
  id,
  image: img,
  project: _project,
  positionLabel,
  isSelected,
  effectiveCoverId,
  disabled,
  busyCover,
  busyDelete,
  onSelect,
  onSelectableKeyDown,
  onSetCover,
  onDelete,
  onOpenFocus,
  onEdit,
}: Props) {
  void _project;

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
  const objectPosition = resolveImageObjectPosition(img);
  const isCover = effectiveCoverId === img.id;
  const identity = img.filename || img.storagePath || img.id.slice(0, 8);

  const transformStr = transform ? CSS.Transform.toString(transform) : null;
  const style: React.CSSProperties = {
    transform: isDragging
      ? transformStr
        ? `${transformStr} scale(1.02)`
        : "scale(1.02)"
      : transformStr ?? undefined,
    transition: transition ?? undefined,
    zIndex: isDragging ? 40 : undefined,
  };

  const dropTarget = isOver && !isDragging;

  const stop = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const outerClass = [
    adminTileOuter,
    "group group/tile relative min-w-0 overflow-visible",
    isDragging ? "z-10 hover:!scale-100 hover:!shadow-[0_4px_18px_rgba(0,0,0,0.12)]" : "",
  ].join(" ");

  const innerClass = [
    "relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-zinc-950/40 transition-[border-color] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    !isDragging ? "hover:border-zinc-700/85" : "",
    isDragging
      ? "border-zinc-500/55 shadow-2xl shadow-black/60 ring-1 ring-white/10"
      : "",
    !isDragging && isSelected
      ? "border-zinc-400/50 ring-1 ring-zinc-200/15"
      : "",
    !isDragging && !isSelected
      ? "border-zinc-800/80"
      : "",
    isCover && !isDragging ? "ring-1 ring-amber-400/25 border-amber-900/35" : "",
    dropTarget ? "ring-1 ring-inset ring-emerald-400/25" : "",
  ].join(" ");

  return (
    <li ref={setNodeRef} style={style} className="min-w-0 list-none">
      <div className={outerClass}>
        <div className={innerClass}>
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label={`Reorder: ${identity}`}
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            className={
              "absolute left-2 top-2 z-20 flex h-9 w-9 touch-none cursor-grab select-none items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-950/80 text-zinc-400 shadow-md backdrop-blur-sm transition-colors hover:border-zinc-600 hover:text-zinc-200 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            <IconGrip className="opacity-90" />
          </button>

          <div
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Select for details: ${identity}`}
            onClick={() => onSelect(img.id)}
            onKeyDown={(e) => onSelectableKeyDown(e, img.id)}
            className={`relative cursor-pointer outline-none ${linkFocusVisible}`}
          >
            <div className={`${portfolioIndexThumbAspect} overflow-hidden bg-zinc-900`}>
              <NextImage
                src={preview}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized
                className={galleryGridImage}
                style={{ objectPosition }}
              />
              <div className={galleryTileMediaOverlay} aria-hidden />

              <span className="pointer-events-none absolute right-2 top-11 rounded-md border border-zinc-700/50 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-zinc-500">
                {positionLabel}
              </span>

              {img.externalUrl?.trim() ? (
                <span className="pointer-events-none absolute left-2 top-11 rounded border border-zinc-700/50 bg-zinc-950/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                  URL
                </span>
              ) : null}

              {isCover ? (
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-amber-700/50 bg-zinc-950/92 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/95">
                  Cover
                </span>
              ) : null}

              {/* Desktop: overlay opacity 0→1 @ 180ms; actions translate-y 4px→0 */}
              <div
                className={
                  "absolute inset-0 z-[2] hidden items-center justify-center bg-black/55 opacity-0 " +
                  `pointer-events-none transition-opacity duration-[180ms] ${overlayEase} ` +
                  "group-hover/tile:pointer-events-auto group-hover/tile:opacity-100 md:flex"
                }
              >
                <div
                  className={
                    "flex translate-y-1 flex-wrap items-center justify-center gap-2 px-2 " +
                    `transition-transform duration-[180ms] ${overlayEase} ` +
                    "group-hover/tile:translate-y-0"
                  }
                >
                  {!isCover ? (
                    <button
                      type="button"
                      disabled={disabled || busyCover}
                      onClick={(e) => {
                        stop(e);
                        void onSetCover(img.id);
                      }}
                      className={actionBtn}
                      title="Set as cover"
                      aria-label="Set as cover"
                    >
                      <IconStar className="text-amber-200/95" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      stop(e);
                      onOpenFocus(img.id);
                    }}
                    className={actionBtn}
                    title="Set focal point"
                    aria-label="Set focal point"
                  >
                    <IconTarget className="text-zinc-100" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      stop(e);
                      onEdit(img.id);
                    }}
                    className={actionBtn}
                    title="Edit details"
                    aria-label="Edit details"
                  >
                    <IconPencil className="text-zinc-100" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || busyDelete}
                    onClick={(e) => {
                      stop(e);
                      void onDelete(img.id);
                    }}
                    className={
                      actionBtn +
                      " border-red-950/50 bg-red-950/35 text-red-200/95 hover:bg-red-950/50"
                    }
                    title="Delete image"
                    aria-label="Delete image"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile / touch: action strip */}
          <div className="flex items-center justify-center gap-1.5 border-t border-zinc-800/50 bg-zinc-950/90 px-1.5 py-2 md:hidden">
            {!isCover ? (
              <button
                type="button"
                disabled={disabled || busyCover}
                onClick={(e) => {
                  e.stopPropagation();
                  void onSetCover(img.id);
                }}
                className={`${actionBtn} min-h-[48px] min-w-[48px] flex-1 border-amber-900/40 bg-amber-950/20 text-amber-100/95`}
                aria-label="Set as cover"
              >
                <IconStar />
              </button>
            ) : null}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onOpenFocus(img.id);
              }}
              className={`${actionBtn} min-h-[48px] min-w-[48px] flex-1`}
              aria-label="Focal point"
            >
              <IconTarget />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(img.id);
              }}
              className={`${actionBtn} min-h-[48px] min-w-[48px] flex-1`}
              aria-label="Edit details"
            >
              <IconPencil />
            </button>
            <button
              type="button"
              disabled={disabled || busyDelete}
              onClick={(e) => {
                e.stopPropagation();
                void onDelete(img.id);
              }}
              className={`${actionBtn} min-h-[48px] min-w-[48px] flex-1 border-red-950/45 bg-red-950/25 text-red-200/95`}
              aria-label="Delete"
            >
              <IconTrash />
            </button>
          </div>

          <p
            className="truncate border-t border-zinc-800/40 px-2 py-1.5 text-center font-mono text-[10px] text-zinc-600 md:text-left"
            title={identity}
          >
            {identity}
          </p>
        </div>
      </div>
    </li>
  );
}
