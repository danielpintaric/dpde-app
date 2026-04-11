"use client";

import type { ProjectImage } from "@/lib/portfolio-data";
import { ClientFavoriteTileButton } from "@/components/client/client-favorite-button";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";
import { ClientImageActions } from "@/components/gallery/client-image-actions";
import {
  GalleryTileMedia,
  galleryGridCardBorderClientDefault,
  galleryGridCardBorderClientSelected,
} from "@/components/gallery/gallery-tile-primitive";
import { galleryTileShell, linkFocusVisible, tapSoft, typeCaption } from "@/lib/editorial";

export type GalleryFrameClientTileProps = {
  image: ProjectImage;
  className?: string;
  aspectClass?: string;
  sizes?: string;
  clientDownload?: { token: string; projectSlug: string };
  onOpen?: () => void;
  selected: boolean;
};

/**
 * Client review grid tile — favorites, selection chrome, download row when needed.
 */
export function GalleryFrameClientTile({
  image,
  className = "",
  aspectClass,
  sizes,
  clientDownload,
  onOpen,
  selected,
}: GalleryFrameClientTileProps) {
  const selectionCtx = useOptionalClientSelection();
  const ratio = aspectClass ?? image.aspectClass;
  const imageId = image.imageId?.trim() ?? "";
  const showFavorite = Boolean(selectionCtx && imageId && onOpen);

  const borderClass = `${galleryTileShell} ${
    selected ? galleryGridCardBorderClientSelected : galleryGridCardBorderClientDefault
  }`;

  const showActionsRow =
    Boolean(clientDownload && image.imageId && image.storageBacked) ||
    Boolean(selectionCtx && imageId && !onOpen);

  return (
    <figure className={`group ${className}`}>
      {onOpen ? (
        <div
          className={`relative w-full origin-center overflow-hidden text-left ${ratio} ${borderClass} bg-zinc-900`}
        >
          <GalleryTileMedia
            image={image}
            sizes={sizes}
            variant="grid"
            overlayMode="clientGrid"
            showLoupe
          />
          <button
            type="button"
            onClick={onOpen}
            aria-label="Open image larger"
            className={`absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0 text-left ${linkFocusVisible} ${tapSoft}`}
          />
          {showFavorite && selectionCtx ? (
            <ClientFavoriteTileButton
              filled={selectionCtx.selected.has(imageId)}
              label={
                selectionCtx.selected.has(imageId) ? "Remove from favorites" : "Add to favorites"
              }
              onToggle={() => selectionCtx.toggle(imageId)}
            />
          ) : null}
        </div>
      ) : (
        <div className={`relative w-full origin-center overflow-hidden bg-zinc-900 ${ratio} ${borderClass}`}>
          <GalleryTileMedia
            image={image}
            sizes={sizes}
            variant="grid"
            overlayMode="clientGrid"
            showLoupe={false}
          />
        </div>
      )}
      {image.caption ? <figcaption className={typeCaption}>{image.caption}</figcaption> : null}
      {showActionsRow ? (
        <ClientImageActions
          image={image}
          clientDownload={clientDownload}
          useClientSelection={Boolean(selectionCtx && imageId && !onOpen)}
        />
      ) : null}
    </figure>
  );
}
