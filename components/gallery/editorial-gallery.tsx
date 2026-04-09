"use client";

import { useCallback, useState } from "react";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";
import { downloadClientSelectionZipPost } from "@/lib/client-download-link";
import type { ProjectImage } from "@/lib/portfolio-data";
import { linkFocusVisible, tapSoft, transitionQuick, typeMeta } from "@/lib/editorial";
import { GalleryFrame } from "./gallery-frame";
import { Lightbox } from "./lightbox";

const UNIFORM_ASPECT = "aspect-[4/5]";

const gridGap = "grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 md:gap-6 lg:gap-7";

const gridSizes =
  "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 50vw";

type EditorialGalleryProps = {
  images: ProjectImage[];
  clientDownload?: { token: string; projectSlug: string };
  /** When true, show selection controls (requires ClientSelectionProvider on the page). */
  useClientSelection?: boolean;
  /** Shown quietly in the lightbox header */
  galleryTitle?: string;
};

export function EditorialGallery({
  images,
  clientDownload,
  useClientSelection = false,
  galleryTitle,
}: EditorialGalleryProps) {
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
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const showSelectionSummary =
    Boolean(useClientSelection && selection) && (selection?.selectedCount ?? 0) > 0;

  if (images.length === 0) {
    return (
      <section className="mt-12 border-t border-zinc-800/40 pb-10 pt-12 sm:mt-14 sm:pt-14 sm:pb-12 lg:mt-16 lg:pt-16 lg:pb-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-8">
          <div className="rounded-xl border border-dashed border-zinc-800/55 bg-zinc-900/35 px-8 py-16 text-center sm:py-20">
            <p className="font-serif text-base tracking-tight text-zinc-300">No images yet</p>
            <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed text-zinc-500">
              Images will appear here when the studio adds them to this project.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-12 border-t border-zinc-800/40 pb-10 pt-12 sm:mt-14 sm:pt-14 sm:pb-12 lg:mt-16 lg:pt-16 lg:pb-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-8">
          {showSelectionSummary && selection ? (
            <div
              className={`${typeMeta} mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-zinc-500 sm:mb-10`}
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

          <ul className={`list-none p-0 m-0 ${gridGap}`}>
            {images.map((image, index) => {
              const imageId = image.imageId?.trim() ?? "";
              const isSelected =
                Boolean(useClientSelection && selection && imageId) &&
                Boolean(selection?.selected.has(imageId));

              return (
                <li key={`${image.src}-${index}`} className="min-w-0">
                  <GalleryFrame
                    image={image}
                    aspectClass={UNIFORM_ASPECT}
                    sizes={gridSizes}
                    clientDownload={clientDownload}
                    useClientSelection={useClientSelection}
                    onOpen={() => openAt(index)}
                    variant="grid"
                    selected={isSelected}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Lightbox
        images={images}
        open={lightboxOpen}
        activeIndex={lightboxIndex}
        onActiveIndexChange={setLightboxIndex}
        onClose={closeLightbox}
        galleryTitle={galleryTitle}
      />
    </>
  );
}
