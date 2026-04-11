"use client";

import { useCallback, useState } from "react";
import type { ProjectImage } from "@/lib/portfolio-data";
import { EditorialImage, editorialListResetClass } from "@/components/gallery/editorial";
import {
  getPublicGalleryLayout,
  PUBLIC_GALLERY_LEAD_ASPECT_CLASS,
  PUBLIC_GALLERY_LEAD_SIZES,
  PUBLIC_PORTFOLIO_SERIES_GRID_CLASS,
  PUBLIC_PORTFOLIO_SERIES_ROW_SIZE,
  type PublicGalleryLayout,
} from "@/lib/public-gallery-layout";
import { resolveLightboxIndexForGridImage } from "@/components/gallery/gallery-lightbox-index";
import { Lightbox } from "@/components/gallery/lightbox";

function chunkPublicGalleryRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export type PublicPortfolioGalleryProps = {
  images: ProjectImage[];
  lightboxImages?: ProjectImage[];
  clientDownload?: { token: string; projectSlug: string };
  galleryTitle?: string;
};

type OpenAt = (globalIndex: number) => void;

function tileProps(
  image: ProjectImage,
  globalIndex: number,
  total: number,
  leadingGridIntro: string,
  clientDownload: PublicPortfolioGalleryProps["clientDownload"],
  openAt: OpenAt,
) {
  const layout = getPublicGalleryLayout(globalIndex, total);
  const liftIntro = Boolean(leadingGridIntro) && globalIndex === 0;
  return {
    image,
    globalIndex,
    layout,
    liftIntro,
    introId: leadingGridIntro ? "public-gallery-intro" : undefined,
    clientDownload,
    openAt,
  };
}

function PublicPortfolioSeriesTile({
  image,
  layout,
  globalIndex,
  leadingGridIntro,
  clientDownload,
  openAt,
  isSoleInRow,
}: {
  image: ProjectImage;
  layout: PublicGalleryLayout;
  globalIndex: number;
  leadingGridIntro: string;
  clientDownload: PublicPortfolioGalleryProps["clientDownload"];
  openAt: OpenAt;
  isSoleInRow?: boolean;
}) {
  const liftIntro = Boolean(leadingGridIntro) && globalIndex === 0;
  /** Last odd image: same full-width landscape rail as {@link PublicGalleryLeadBlock} */
  const soleFullWidth = Boolean(isSoleInRow);
  const aspectClass = soleFullWidth ? PUBLIC_GALLERY_LEAD_ASPECT_CLASS : layout.aspectClassName;
  const sizes = soleFullWidth ? PUBLIC_GALLERY_LEAD_SIZES : layout.sizes;
  const publicGridPresentation = soleFullWidth ? "featureSoft" : layout.publicGridPresentation;
  return (
    <li className={`${layout.itemClassName}${soleFullWidth ? " col-span-2 w-full" : ""}`}>
      <EditorialImage
        image={image}
        className={soleFullWidth ? "w-full" : undefined}
        aspectClass={aspectClass}
        sizes={sizes}
        clientDownload={clientDownload}
        onOpen={() => openAt(globalIndex)}
        variant="grid"
        publicGridPresentation={publicGridPresentation}
        suppressCaption={liftIntro}
        ariaDescribedBy={liftIntro ? "public-gallery-intro" : undefined}
        subtleHover
      />
    </li>
  );
}

/** Opener: first gallery image after the project hero (STEP 26A + 26B hierarchy). */
function PublicGalleryLeadBlock({
  image,
  total,
  leadingGridIntro,
  clientDownload,
  openAt,
}: {
  image: ProjectImage;
  total: number;
  leadingGridIntro: string;
  clientDownload: PublicPortfolioGalleryProps["clientDownload"];
  openAt: OpenAt;
}) {
  const globalIndex = 0;
  const isFirstAfterHero = globalIndex === 0;
  const t = tileProps(image, globalIndex, total, leadingGridIntro, clientDownload, openAt);

  /** Same track as project hero (`md:pl-4 lg:pl-7` parent) — full width, no extra max-w cap */
  const leadShellClass = isFirstAfterHero ? "w-full mt-12 md:mt-16 lg:mt-20" : undefined;

  return (
    <div className={leadShellClass}>
      <EditorialImage
        image={t.image}
        className="w-full"
        aspectClass={t.layout.aspectClassName}
        sizes={t.layout.sizes}
        clientDownload={t.clientDownload}
        onOpen={() => openAt(t.globalIndex)}
        variant="grid"
        publicGridPresentation={t.layout.publicGridPresentation}
        suppressCaption={t.liftIntro}
        ariaDescribedBy={t.liftIntro ? t.introId : undefined}
        subtleHover
      />
    </div>
  );
}

/** First 2-col row after the landscape lead — etwas mehr Luft als zwischen Folgezeilen */
const publicPortfolioLeadToSeriesSpacing = "mt-10 sm:mt-12 lg:mt-14";

/** Vertical gap between weiteren Serien-Paaren */
const publicPortfolioSeriesContinuationMargin = "mt-6 sm:mt-8 lg:mt-10";

/** Calm 2-column series: one horizontal pair per row (STEP 26C). */
function PublicGallerySeriesRow({
  rowImages,
  seriesRowIndex,
  globalBase,
  total,
  leadingGridIntro,
  clientDownload,
  openAt,
}: {
  rowImages: ProjectImage[];
  seriesRowIndex: number;
  globalBase: number;
  total: number;
  leadingGridIntro: string;
  clientDownload: PublicPortfolioGalleryProps["clientDownload"];
  openAt: OpenAt;
}) {
  const rowMargin =
    seriesRowIndex === 0 ? publicPortfolioLeadToSeriesSpacing : publicPortfolioSeriesContinuationMargin;
  const soleInRow = rowImages.length === 1;

  return (
    <ul
      className={`${editorialListResetClass} ${PUBLIC_PORTFOLIO_SERIES_GRID_CLASS} ${rowMargin}`}
    >
      {rowImages.map((image, posInRow) => {
        const globalIndex = globalBase + posInRow;
        const layout = getPublicGalleryLayout(globalIndex, total);
        return (
          <PublicPortfolioSeriesTile
            key={`${image.src}-${globalIndex}`}
            image={image}
            layout={layout}
            globalIndex={globalIndex}
            leadingGridIntro={leadingGridIntro}
            clientDownload={clientDownload}
            openAt={openAt}
            isSoleInRow={soleInRow}
          />
        );
      })}
    </ul>
  );
}

/**
 * Public portfolio body grid + lightbox — lead + uniform 2-column series (STEP 26A).
 * Does not import client-selection context.
 */
export function PublicPortfolioGallery({
  images,
  lightboxImages,
  clientDownload,
  galleryTitle,
}: PublicPortfolioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lbImages = lightboxImages ?? images;
  const total = images.length;

  const openAt = useCallback(
    (gridIndex: number) => {
      setLightboxIndex(resolveLightboxIndexForGridImage(images, gridIndex, lbImages));
      setLightboxOpen(true);
    },
    [images, lbImages],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const leadingGridIntro = images[0]?.caption?.trim() ? images[0].caption.trim() : "";
  const seriesImages = total > 0 ? images.slice(1) : [];
  const seriesRows = chunkPublicGalleryRows(seriesImages, PUBLIC_PORTFOLIO_SERIES_ROW_SIZE);

  if (images.length === 0) {
    return (
      <section className="mt-5 border-t border-zinc-800/30 pb-0 pt-8 sm:mt-6 sm:pt-10 md:-mt-5 lg:mt-8 lg:pt-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="rounded-xl border border-dashed border-zinc-800/55 bg-zinc-900/35 px-8 py-16 text-center sm:py-20">
            <p className="font-serif text-base tracking-tight text-zinc-300">No images yet</p>
            <p className="mt-3 mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">
              Images will appear here when the studio adds them to this project.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="mt-5 border-t border-zinc-800/30 pb-0 pt-8 sm:mt-6 sm:pt-10 md:-mt-5 lg:mt-8 lg:pt-12"
        aria-label={galleryTitle ? `${galleryTitle} — gallery` : "Project gallery"}
        aria-describedby={leadingGridIntro ? "public-gallery-intro" : undefined}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="md:pl-4 lg:pl-7">
            {leadingGridIntro ? (
              <p
                id="public-gallery-intro"
                className="mb-4 max-w-lg font-serif text-[13px] font-normal leading-relaxed tracking-[-0.01em] text-zinc-500 sm:mb-5 sm:text-[14px] sm:leading-[1.55] sm:text-zinc-400/90 text-pretty"
              >
                {leadingGridIntro}
              </p>
            ) : null}

            <PublicGalleryLeadBlock
              image={images[0]!}
              total={total}
              leadingGridIntro={leadingGridIntro}
              clientDownload={clientDownload}
              openAt={openAt}
            />

            {seriesRows.map((rowImages, seriesRowIndex) => (
              <PublicGallerySeriesRow
                key={`public-gallery-series-${seriesRowIndex}`}
                rowImages={rowImages}
                seriesRowIndex={seriesRowIndex}
                globalBase={1 + seriesRowIndex * PUBLIC_PORTFOLIO_SERIES_ROW_SIZE}
                total={total}
                leadingGridIntro={leadingGridIntro}
                clientDownload={clientDownload}
                openAt={openAt}
              />
            ))}
          </div>
        </div>
      </section>

      <Lightbox
        images={lbImages}
        open={lightboxOpen}
        activeIndex={lightboxIndex}
        onActiveIndexChange={setLightboxIndex}
        onClose={closeLightbox}
        galleryTitle={galleryTitle}
      />
    </>
  );
}
