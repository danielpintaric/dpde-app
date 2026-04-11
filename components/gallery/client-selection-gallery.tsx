"use client";

import { useCallback, useMemo, useState } from "react";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";
import type { ProjectImage } from "@/lib/portfolio-data";
import { GalleryFrameClientTile } from "@/components/gallery/gallery-frame-client-tile";
import { resolveLightboxIndexForGridImage } from "@/components/gallery/gallery-lightbox-index";
import { Lightbox } from "@/components/gallery/lightbox";
import { linkFocusVisible, tapSoft, transitionQuick, typeMeta } from "@/lib/editorial";

const UNIFORM_ASPECT = "aspect-[4/5]";

const gridGap = "grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 md:gap-6 lg:gap-7";

const gridSizes =
  "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 50vw";

const filterBtnBase =
  "rounded-full border px-3.5 py-1.5 text-[11px] font-normal tracking-[0.06em] transition-colors duration-200 motion-reduce:transition-none";

export type ClientSelectionGalleryProps = {
  images: ProjectImage[];
  lightboxImages?: ProjectImage[];
  clientDownload?: { token: string; projectSlug: string };
  galleryTitle?: string;
};

/**
 * Token client review grid — favorites, filters, lightbox favorite control.
 * Must render under `ClientSelectionProvider`.
 */
export function ClientSelectionGallery({
  images,
  lightboxImages,
  clientDownload,
  galleryTitle,
}: ClientSelectionGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [viewFilter, setViewFilter] = useState<"all" | "selected">("all");
  const selection = useOptionalClientSelection();

  const lbImages = lightboxImages ?? images;

  const displayImages = useMemo(() => {
    if (!selection || viewFilter === "all") {
      return images;
    }
    return images.filter((im) => {
      const id = im.imageId?.trim() ?? "";
      return id.length > 0 && selection.selected.has(id);
    });
  }, [images, selection, viewFilter]);

  const openAt = useCallback(
    (gridIndex: number) => {
      setLightboxIndex(resolveLightboxIndexForGridImage(displayImages, gridIndex, lbImages));
      setLightboxOpen(true);
    },
    [displayImages, lbImages],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const activeLbImage = lbImages[lightboxIndex] ?? null;
  const activeLbId = activeLbImage?.imageId?.trim() ?? "";
  const favoriteControl =
    selection && activeLbId
      ? {
          active: selection.selected.has(activeLbId),
          onToggle: () => selection.toggle(activeLbId),
        }
      : null;

  const showClientFilter = Boolean(selection);

  if (images.length === 0) {
    return (
      <section className="mt-8 border-t border-zinc-800/40 pb-0 pt-10 sm:mt-10 sm:pt-12 lg:mt-12 lg:pt-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-8">
          <div className="rounded-xl border border-dashed border-zinc-800/55 bg-zinc-900/35 px-8 py-16 text-center sm:py-20">
            <p className="font-serif text-base tracking-tight text-zinc-300">
              Images will appear here soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const filterEmpty = showClientFilter && viewFilter === "selected" && displayImages.length === 0;

  return (
    <>
      <section className="mt-8 border-t border-zinc-800/40 pb-0 pt-10 sm:mt-10 sm:pt-12 lg:mt-12 lg:pt-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-8">
          {showClientFilter ? (
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="inline-flex gap-2 rounded-full border border-zinc-800/55 bg-zinc-950/82 p-1"
                role="group"
                aria-label="Gallery filter"
              >
                <button
                  type="button"
                  aria-pressed={viewFilter === "all"}
                  onClick={() => setViewFilter("all")}
                  className={`${filterBtnBase} ${linkFocusVisible} ${tapSoft} ${
                    viewFilter === "all"
                      ? "border-zinc-600/50 bg-zinc-900/65 text-zinc-200"
                      : "border-transparent text-zinc-500 hover:text-zinc-400"
                  } ${transitionQuick}`}
                >
                  All
                </button>
                <button
                  type="button"
                  aria-pressed={viewFilter === "selected"}
                  onClick={() => setViewFilter("selected")}
                  className={`${filterBtnBase} ${linkFocusVisible} ${tapSoft} ${
                    viewFilter === "selected"
                      ? "border-zinc-600/50 bg-zinc-900/65 text-zinc-200"
                      : "border-transparent text-zinc-500 hover:text-zinc-400"
                  } ${transitionQuick}`}
                >
                  Selected
                </button>
              </div>
              {selection && selection.selectedCount === 0 ? (
                <p className={`${typeMeta} m-0 text-zinc-600`}>Select your favorites</p>
              ) : null}
            </div>
          ) : null}

          {filterEmpty ? (
            <div className="rounded-xl border border-dashed border-zinc-800/50 bg-zinc-900/30 px-8 py-14 text-center sm:py-16">
              <p className="font-serif text-[15px] tracking-tight text-zinc-400">
                No favorites selected yet.
              </p>
            </div>
          ) : (
            <ul className={`list-none p-0 m-0 ${gridGap}`}>
              {displayImages.map((image, index) => {
                const imageId = image.imageId?.trim() ?? "";
                const isSelected =
                  Boolean(selection && imageId) && Boolean(selection?.selected.has(imageId));

                return (
                  <li key={`${image.src}-${index}`} className="min-w-0">
                    <GalleryFrameClientTile
                      image={image}
                      aspectClass={UNIFORM_ASPECT}
                      sizes={gridSizes}
                      clientDownload={clientDownload}
                      onOpen={() => openAt(index)}
                      selected={isSelected}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <Lightbox
        images={lbImages}
        open={lightboxOpen}
        activeIndex={lightboxIndex}
        onActiveIndexChange={setLightboxIndex}
        onClose={closeLightbox}
        galleryTitle={galleryTitle}
        favoriteControl={favoriteControl}
      />
    </>
  );
}
