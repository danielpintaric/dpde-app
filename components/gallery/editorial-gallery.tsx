"use client";

import { useCallback, useState } from "react";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";
import { downloadClientSelectionZipPost } from "@/lib/client-download-link";
import type { ProjectImage } from "@/lib/portfolio-data";
import { linkFocusVisible, tapSoft, transitionQuick, typeMeta } from "@/lib/editorial";
import { GalleryFrame } from "./gallery-frame";
import { Lightbox } from "./lightbox";

type EditorialRow =
  | { kind: "full"; image: ProjectImage; index: number }
  | {
      kind: "split";
      left: ProjectImage;
      right: ProjectImage;
      leftIndex: number;
      rightIndex: number;
      leftSpan: 7 | 5 | 6;
      rightSpan: 7 | 5 | 6;
    };

/** Repeating 7/5 → 5/7 → 6/6 after the opening full-width plate */
const SPLIT_CYCLE = [
  [7, 5],
  [5, 7],
  [6, 6],
] as const;

export function buildEditorialRows(images: ProjectImage[]): EditorialRow[] {
  if (images.length === 0) return [];
  const rows: EditorialRow[] = [];
  let i = 0;
  let seq = 0;
  const n = images.length;

  rows.push({ kind: "full", image: images[i++]!, index: seq++ });

  let cycle = 0;
  while (i < n) {
    const remaining = n - i;
    if (remaining === 1) {
      rows.push({ kind: "full", image: images[i++]!, index: seq++ });
      break;
    }
    const [ls, rs] = SPLIT_CYCLE[cycle % SPLIT_CYCLE.length]!;
    cycle += 1;
    rows.push({
      kind: "split",
      left: images[i++]!,
      right: images[i++]!,
      leftIndex: seq++,
      rightIndex: seq++,
      leftSpan: ls,
      rightSpan: rs,
    });
  }

  return rows;
}

function lgColSpan(span: 12 | 7 | 5 | 6): string {
  switch (span) {
    case 12:
      return "lg:col-span-12";
    case 7:
      return "lg:col-span-7";
    case 5:
      return "lg:col-span-5";
    case 6:
      return "lg:col-span-6";
    default:
      return "lg:col-span-12";
  }
}

function lgColStartForRight(leftSpan: 7 | 5 | 6): string {
  switch (leftSpan) {
    case 7:
      return "lg:col-start-8";
    case 5:
      return "lg:col-start-6";
    case 6:
      return "lg:col-start-7";
    default:
      return "lg:col-start-auto";
  }
}

const SPLIT_RIGHT_OFFSET = ["", "lg:mt-24", "lg:mt-16", "lg:mt-32"] as const;

const ROW_GAP_AFTER_FIRST = "mt-12 sm:mt-16 lg:mt-20";

function rowTopClass(rowIndex: number): string {
  return rowIndex === 0 ? "" : ROW_GAP_AFTER_FIRST;
}

function splitRightExtraClass(splitIndex: number): string {
  return SPLIT_RIGHT_OFFSET[splitIndex % SPLIT_RIGHT_OFFSET.length] ?? "";
}

function splitRowsBefore(rows: EditorialRow[], rowIndex: number): number {
  let n = 0;
  for (let i = 0; i < rowIndex; i++) {
    if (rows[i]?.kind === "split") {
      n += 1;
    }
  }
  return n;
}

type EditorialGalleryProps = {
  images: ProjectImage[];
  clientDownload?: { token: string; projectSlug: string };
  /** When true, show selection controls (requires ClientSelectionProvider on the page). */
  useClientSelection?: boolean;
};

export function EditorialGallery({
  images,
  clientDownload,
  useClientSelection = false,
}: EditorialGalleryProps) {
  const rows = buildEditorialRows(images);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipHint, setZipHint] = useState<string | null>(null);
  const selection = useOptionalClientSelection();

  const handleDownloadSelected = useCallback(async () => {
    if (!selection || selection.selectedCount === 0) {
      return;
    }
    setZipHint(null);
    setZipBusy(true);
    const result = await downloadClientSelectionZipPost(selection.token, selection.projectSlug);
    setZipBusy(false);
    if (!result.ok) {
      setZipHint(result.message);
    }
  }, [selection]);

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, [setLightboxIndex, setLightboxOpen]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, [setLightboxOpen]);

  if (rows.length === 0) return null;

  const showSelectionSummary =
    Boolean(useClientSelection && selection) && (selection?.selectedCount ?? 0) > 0;

  return (
    <>
      <section className="mt-12 border-t border-zinc-800/40 pb-10 pt-12 sm:mt-14 sm:pt-14 sm:pb-12 lg:mt-16 lg:pt-16 lg:pb-14">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          {showSelectionSummary && selection ? (
            <div
              className={`${typeMeta} mb-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-zinc-500`}
            >
              <p className="m-0">
                {selection.selectedCount === 1
                  ? "1 image selected"
                  : `${selection.selectedCount} images selected`}
              </p>
              <span className="inline-flex flex-col items-start gap-1">
                <button
                  type="button"
                  onClick={() => void handleDownloadSelected()}
                  disabled={zipBusy}
                  aria-busy={zipBusy}
                  className={`cursor-pointer border-0 bg-transparent p-0 font-inherit text-[11px] font-normal tracking-[0.04em] underline decoration-zinc-700/35 underline-offset-[6px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-600/45 disabled:cursor-wait disabled:opacity-60 ${linkFocusVisible} ${tapSoft}`}
                >
                  {`Download selected (${selection.selectedCount})`}
                </button>
                {zipHint ? (
                  <span className="max-w-[18rem] text-[10px] leading-snug text-red-400/90" role="status">
                    {zipHint}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}
          {rows.map((row, rowIndex) => {
            if (row.kind === "full") {
              return (
                <div key={`full-${row.image.src}-${rowIndex}`} className={rowTopClass(rowIndex)}>
                  <GalleryFrame
                    image={row.image}
                    aspectClass={row.image.aspectClass}
                    sizes="(min-width: 1280px) min(72rem, 90vw), (min-width: 768px) 90vw, 100vw"
                    clientDownload={clientDownload}
                    useClientSelection={useClientSelection}
                    onOpen={() => openAt(row.index)}
                  />
                </div>
              );
            }

            const si = splitRowsBefore(rows, rowIndex);

            const { left, right, leftSpan, rightSpan, leftIndex, rightIndex } = row;
            const leftSpanClass = lgColSpan(leftSpan);
            const rightSpanClass = lgColSpan(rightSpan);
            const rightStartClass = lgColStartForRight(leftSpan);

            return (
              <div
                key={`split-${left.src}-${right.src}-${rowIndex}`}
                className={`${rowTopClass(rowIndex)} grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0`}
              >
                <div className={`md:col-span-1 ${leftSpanClass}`}>
                  <GalleryFrame
                    image={left}
                    aspectClass={left.aspectClass}
                    sizes="(min-width: 1280px) 45vw, (min-width: 768px) 46vw, 100vw"
                    clientDownload={clientDownload}
                    useClientSelection={useClientSelection}
                    onOpen={() => openAt(leftIndex)}
                  />
                </div>
                <div
                  className={`md:col-span-1 ${rightSpanClass} ${rightStartClass} ${splitRightExtraClass(si)}`}
                >
                  <GalleryFrame
                    image={right}
                    aspectClass={right.aspectClass}
                    sizes="(min-width: 1280px) 40vw, (min-width: 768px) 46vw, 100vw"
                    clientDownload={clientDownload}
                    useClientSelection={useClientSelection}
                    onOpen={() => openAt(rightIndex)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Lightbox
        images={images}
        open={lightboxOpen}
        activeIndex={lightboxIndex}
        onActiveIndexChange={setLightboxIndex}
        onClose={closeLightbox}
      />
    </>
  );
}
