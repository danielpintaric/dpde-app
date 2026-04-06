"use client";

import { useState } from "react";
import { tryParseProjectImageStoragePathFromPublicUrl } from "@/lib/storage/parse-project-image-public-url";

const previewFrame =
  "relative aspect-[16/10] w-full overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-900/40";
const imgClass = "absolute inset-0 h-full w-full object-cover object-center";
const slotLabel = "mb-0.5 block text-[10px] font-medium text-zinc-600";
const btnRow = "mt-2 flex flex-wrap items-center gap-2";
const fileInputClass =
  "block w-full cursor-pointer text-[11px] text-zinc-400 file:mr-3 file:cursor-pointer file:rounded file:border file:border-zinc-600 file:bg-zinc-800/80 file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-zinc-200 hover:file:border-zinc-500";
const slotsGridClass = "grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2";
const ghostBtn =
  "cursor-pointer rounded border border-zinc-700 bg-transparent px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40";

type SlotIndex = 0 | 1 | 2 | 3;
type HeroSlotNumber = 1 | 2 | 3 | 4;

type Props = {
  initial1: string;
  initial2: string;
  initial3: string;
  initial4: string;
  /** Called after hero URLs change (upload/remove) so parent can refresh dirty state. */
  onUrlsChange?: () => void;
};

export function SiteHeroImageSlots({
  initial1,
  initial2,
  initial3,
  initial4,
  onUrlsChange,
}: Props) {
  const [urls, setUrls] = useState<[string, string, string, string]>([
    initial1,
    initial2,
    initial3,
    initial4,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<number | null>(null);

  const setUrlAt = (i: SlotIndex, v: string) => {
    setUrls((prev) => {
      const next: [string, string, string, string] = [...prev];
      next[i] = v;
      return next;
    });
  };

  const upload = async (slot: HeroSlotNumber, file: File) => {
    const i = (slot - 1) as SlotIndex;
    const current = urls[i];
    const prevPath = tryParseProjectImageStoragePathFromPublicUrl(current);
    setError(null);
    setBusySlot(slot);
    try {
      const fd = new FormData();
      fd.set("slot", String(slot));
      fd.set("file", file);
      if (prevPath?.startsWith("site/hero/")) {
        fd.set("previousStoragePath", prevPath);
      }
      const res = await fetch("/api/admin/site-hero/upload", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        publicUrl?: string;
      };
      if (!res.ok || typeof data.publicUrl !== "string" || !data.publicUrl) {
        throw new Error(data.error ?? "Upload failed.");
      }
      setUrlAt(i, data.publicUrl);
      queueMicrotask(() => onUrlsChange?.());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusySlot(null);
    }
  };

  const clearSlot = async (slot: HeroSlotNumber) => {
    const i = (slot - 1) as SlotIndex;
    const current = urls[i];
    const path = tryParseProjectImageStoragePathFromPublicUrl(current);
    setError(null);
    setBusySlot(slot);
    try {
      if (path?.startsWith("site/hero/")) {
        const res = await fetch("/api/admin/site-hero/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePath: path }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "Could not remove file.");
        }
      }
      setUrlAt(i, "");
      queueMicrotask(() => onUrlsChange?.());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed.");
    } finally {
      setBusySlot(null);
    }
  };

  const slots: { slot: HeroSlotNumber; label: string; i: SlotIndex }[] = [
    { slot: 1, label: "Hero image 1", i: 0 },
    { slot: 2, label: "Hero image 2", i: 1 },
    { slot: 3, label: "Hero image 3", i: 2 },
    { slot: 4, label: "Hero image 4", i: 3 },
  ];

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-md border border-red-900/45 bg-red-950/20 px-2.5 py-1.5 text-[12px] text-red-200/95">
          {error}
        </p>
      ) : null}

      <div className={slotsGridClass}>
        {slots.map(({ slot, label, i }) => {
          const url = urls[i].trim();
          const busy = busySlot === slot;
          return (
            <div key={slot} className="min-w-0">
              <span className={slotLabel}>{label}</span>
              <div className={previewFrame}>
                {url ? (
                  <img src={url} alt="" className={imgClass} />
                ) : (
                  <div className="flex h-full min-h-[7.5rem] items-center justify-center px-4 text-center text-[11px] text-zinc-600">
                    No image in this slot. Upload stores the file in site storage and fills the slot — use
                    Save below to publish URLs to the landing page.
                  </div>
                )}
              </div>
              <input type="hidden" name={`hero_image_${slot}`} value={urls[i]} />
              <div className={btnRow}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className={fileInputClass}
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) {
                      void upload(slot, f);
                    }
                  }}
                />
                <button
                  type="button"
                  className={ghostBtn}
                  disabled={busy || !url}
                  onClick={() => void clearSlot(slot)}
                >
                  Remove
                </button>
                {busy ? (
                  <span className="text-[11px] text-zinc-500">Working…</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
