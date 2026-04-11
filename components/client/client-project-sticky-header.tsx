"use client";

import { useCallback, useState } from "react";
import { downloadClientSelectionZipPost } from "@/lib/client-download-link";
import { linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";
import { useOptionalClientSelection } from "@/components/client/client-selection-context";

type Props = {
  projectTitle: string;
};

/**
 * Sticky bar for token-based client project view (inside ClientSelectionProvider).
 */
export function ClientProjectStickyHeader({ projectTitle }: Props) {
  const selection = useOptionalClientSelection();
  const [zipBusy, setZipBusy] = useState(false);
  const [zipHint, setZipHint] = useState<string | null>(null);

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

  if (!selection) {
    return null;
  }

  const count = selection.selectedCount;
  const title = projectTitle.trim() || "Project";

  return (
    <header
      className={
        "sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/90 shadow-[0_1px_0_rgba(0,0,0,0.32)] " +
        "pt-[env(safe-area-inset-top,0px)]"
      }
    >
      <div className="mx-auto flex max-w-[1600px] min-h-[3.25rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-10">
        <h2 className="min-w-0 truncate font-serif text-[1.02rem] font-normal tracking-[-0.02em] text-zinc-100/95 sm:text-[1.08rem]">
          {title}
        </h2>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-1.5">
          <p className="m-0 tabular-nums text-[11px] font-normal tracking-[0.06em] text-zinc-500">
            Selected: {count}
          </p>
          <span className="inline-flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => void handleDownloadSelected()}
              disabled={zipBusy || count === 0}
              aria-busy={zipBusy}
              className={
                "cursor-pointer border-0 bg-transparent p-0 text-right font-inherit text-[11px] font-normal tracking-[0.05em] " +
                "text-zinc-500 underline decoration-zinc-700/35 underline-offset-[6px] transition-colors duration-200 " +
                "hover:text-zinc-400 hover:decoration-zinc-600/45 disabled:cursor-not-allowed disabled:no-underline " +
                "disabled:opacity-45 " +
                linkFocusVisible +
                " " +
                tapSoft +
                " " +
                transitionQuick
              }
            >
              Download selected
            </button>
            {zipHint ? (
              <span className="max-w-[14rem] text-right text-[10px] leading-snug text-red-400/90" role="status">
                {zipHint}
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </header>
  );
}
