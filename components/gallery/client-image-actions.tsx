"use client";

import type { ProjectImage } from "@/lib/portfolio-data";
import {
  buildClientImageDownloadHref,
  downloadClientImageViaFetch,
} from "@/lib/client-download-link";
import { ClientFavoriteStarIcon } from "@/components/client/client-favorite-button";
import {
  linkFocusVisible,
  tapSoft,
  transitionQuick,
  typeMeta,
} from "@/lib/editorial";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";
import { useCallback, useState } from "react";

type ClientImageActionsProps = {
  image: ProjectImage;
  clientDownload?: { token: string; projectSlug: string };
  /** When inside ClientSelectionProvider, show selection control for this image id. */
  useClientSelection?: boolean;
  /** Override visible label for the download link (default: Download). */
  downloadLinkLabel?: string;
  className?: string;
};

export function ClientImageActions({
  image,
  clientDownload,
  useClientSelection = false,
  downloadLinkLabel = "Download",
  className = "",
}: ClientImageActionsProps) {
  const selectionCtx = useOptionalClientSelection();
  const showSelection = Boolean(useClientSelection && selectionCtx && image.imageId?.trim());
  const imageId = image.imageId?.trim() ?? "";
  const selected = showSelection && selectionCtx ? selectionCtx.selected.has(imageId) : false;

  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadHint, setDownloadHint] = useState<string | null>(null);

  const hasDownload = Boolean(clientDownload?.token && clientDownload.projectSlug && image.imageId && image.storageBacked);

  const onDownloadClick = useCallback(async () => {
    if (!clientDownload?.token || !clientDownload.projectSlug || !image.imageId) {
      return;
    }
    setDownloadHint(null);
    setDownloadBusy(true);
    const href = buildClientImageDownloadHref(
      clientDownload.token,
      clientDownload.projectSlug,
      image.imageId,
    );
    const result = await downloadClientImageViaFetch(href);
    setDownloadBusy(false);
    if (!result.ok) {
      setDownloadHint(result.message);
    }
  }, [clientDownload?.projectSlug, clientDownload?.token, image.imageId]);

  if (!hasDownload && !showSelection) {
    return null;
  }

  return (
    <p
      className={`mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-normal tracking-[0.04em] text-zinc-500 ${typeMeta}${className ? ` ${className}` : ""}`}
    >
      {hasDownload && clientDownload ? (
        <span className="inline-flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={onDownloadClick}
            disabled={downloadBusy}
            aria-busy={downloadBusy}
            className={`cursor-pointer border-0 bg-transparent p-0 text-left font-inherit underline decoration-zinc-700/35 underline-offset-[6px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-600/45 disabled:cursor-wait disabled:opacity-60 ${linkFocusVisible} ${tapSoft}`}
          >
            {downloadLinkLabel}
          </button>
          {downloadHint ? (
            <span className="max-w-[14rem] text-[10px] leading-snug text-red-400/90" role="status">
              {downloadHint}
            </span>
          ) : null}
        </span>
      ) : null}
      {showSelection && imageId && selectionCtx ? (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={selected ? "Remove from favorites" : "Add to favorites"}
          onClick={() => selectionCtx.toggle(imageId)}
          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-700/40 bg-zinc-950/78 p-2 text-amber-200/85 ${transitionQuick} hover:border-zinc-600/50 hover:text-amber-100 ${linkFocusVisible} ${tapSoft} ${selected ? "border-amber-200/35 text-amber-100" : ""}`}
        >
          <ClientFavoriteStarIcon filled={selected} className="h-[1.05rem] w-[1.05rem]" />
        </button>
      ) : null}
    </p>
  );
}
