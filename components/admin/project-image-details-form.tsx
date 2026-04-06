"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { updateProjectImageDetailsAction } from "@/lib/actions/admin-image-actions";
import { ADMIN_IMAGE_ASPECT_PRESETS } from "@/lib/constants/admin-image-aspects";
import type { Image, Project } from "@/types/project";

type DetailsSnapshot = {
  caption: string;
  altText: string;
  aspectClass: string;
  objectPosition: string;
  sortOrder: string;
};

const inputClass =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600";
const labelClass = "mb-1 block text-[10px] uppercase tracking-wider text-zinc-600";

function readSnapshot(form: HTMLFormElement): DetailsSnapshot {
  const fd = new FormData(form);
  return {
    caption: String(fd.get("caption") ?? ""),
    altText: String(fd.get("altText") ?? ""),
    aspectClass: String(fd.get("aspectClass") ?? ""),
    objectPosition: String(fd.get("objectPosition") ?? ""),
    sortOrder: String(fd.get("sortOrder") ?? ""),
  };
}

function equalSnapshot(a: DetailsSnapshot, b: DetailsSnapshot): boolean {
  return (
    a.caption === b.caption &&
    a.altText === b.altText &&
    a.aspectClass === b.aspectClass &&
    a.objectPosition === b.objectPosition &&
    a.sortOrder === b.sortOrder
  );
}

function SubmitDetailsButton({ dirty, compact }: { dirty: boolean; compact: boolean }) {
  const { pending } = useFormStatus();
  const disabled = !dirty || pending;
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className={`rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-45 border-zinc-500 bg-zinc-800/40 text-zinc-200 enabled:cursor-pointer enabled:hover:border-zinc-400 enabled:hover:bg-zinc-800 ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {pending ? "Saving…" : "Save details"}
    </button>
  );
}

type Props = {
  project: Project;
  image: Image;
  aspectValue: string;
  showCustomAspect: boolean;
  justSaved: boolean;
  /** Enges Layout im Inspector-Panel (einspaltig, kleinere Kontrollen). */
  compact?: boolean;
};

export function ProjectImageDetailsForm({
  project,
  image,
  aspectValue,
  showCustomAspect,
  justSaved,
  compact = false,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialRef = useRef<DetailsSnapshot>({
    caption: image.caption ?? "",
    altText: image.altText ?? "",
    aspectClass: aspectValue,
    objectPosition: image.objectPosition ?? "",
    sortOrder: String(image.sortOrder),
  });
  const [dirty, setDirty] = useState(false);
  const [savedVisible, setSavedVisible] = useState(justSaved);

  useEffect(() => {
    const next: DetailsSnapshot = {
      caption: image.caption ?? "",
      altText: image.altText ?? "",
      aspectClass: aspectValue,
      objectPosition: image.objectPosition ?? "",
      sortOrder: String(image.sortOrder),
    };
    initialRef.current = next;
    const form = formRef.current;
    if (form) {
      setDirty(!equalSnapshot(readSnapshot(form), next));
    } else {
      setDirty(false);
    }
  }, [
    image.id,
    image.caption,
    image.altText,
    image.objectPosition,
    image.sortOrder,
    aspectValue,
  ]);

  useEffect(() => {
    setSavedVisible(justSaved);
    if (!justSaved) {
      return;
    }
    const t = window.setTimeout(() => setSavedVisible(false), 4000);
    return () => window.clearTimeout(t);
  }, [justSaved]);

  useEffect(() => {
    if (dirty) {
      setSavedVisible(false);
    }
  }, [dirty]);

  const syncDirty = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    setDirty(!equalSnapshot(readSnapshot(form), initialRef.current));
  };

  const cLabel = compact ? "mb-0.5 block text-[9px] uppercase tracking-wider text-zinc-600" : labelClass;
  const cInput = compact
    ? "w-full rounded border border-zinc-700/90 bg-zinc-900/80 px-1.5 py-1 text-[11px] leading-snug text-zinc-100 placeholder:text-zinc-600"
    : inputClass;
  const cGrid = compact ? "grid grid-cols-1 gap-2" : "grid gap-3 sm:grid-cols-2";

  return (
    <form
      ref={formRef}
      action={updateProjectImageDetailsAction}
      className={compact ? "space-y-2" : "space-y-3"}
      onChange={syncDirty}
      onInput={syncDirty}
    >
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="imageId" value={image.id} />
      <input type="hidden" name="projectSlug" value={project.slug} />

      <div className={cGrid}>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor={`caption-${image.id}`} className={cLabel}>
            Caption
          </label>
          <textarea
            id={`caption-${image.id}`}
            name="caption"
            rows={2}
            defaultValue={image.caption ?? ""}
            className={`${cInput} resize-y ${compact ? "min-h-[2.25rem]" : "min-h-[2.5rem]"}`}
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor={`alt-${image.id}`} className={cLabel}>
            Alt text
          </label>
          <input
            id={`alt-${image.id}`}
            name="altText"
            type="text"
            defaultValue={image.altText ?? ""}
            className={cInput}
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor={`aspect-${image.id}`} className={cLabel}>
            Aspect class
          </label>
          <select
            id={`aspect-${image.id}`}
            name="aspectClass"
            defaultValue={aspectValue}
            className={cInput}
          >
            {showCustomAspect ? (
              <option value={aspectValue}>
                Current (custom):{" "}
                {aspectValue.length > 48 ? `${aspectValue.slice(0, 48)}…` : aspectValue}
              </option>
            ) : null}
            {ADMIN_IMAGE_ASPECT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`pos-${image.id}`} className={cLabel}>
            Object position
          </label>
          <input
            id={`pos-${image.id}`}
            name="objectPosition"
            type="text"
            defaultValue={image.objectPosition ?? ""}
            className={cInput}
            placeholder="e.g. center 30% 50%"
          />
        </div>
        <div>
          <label htmlFor={`sort-${image.id}`} className={cLabel}>
            Sort order
          </label>
          <input
            id={`sort-${image.id}`}
            name="sortOrder"
            type="number"
            defaultValue={image.sortOrder}
            className={cInput}
          />
        </div>
        <div className={`flex flex-col gap-2 ${compact ? "" : "sm:col-span-2"}`}>
          <div className={`flex flex-wrap items-center ${compact ? "gap-x-2 gap-y-1" : "gap-x-3 gap-y-1"}`}>
            <SubmitDetailsButton dirty={dirty} compact={compact} />
            {savedVisible ? (
              <span role="status" aria-live="polite" className="text-[11px] text-emerald-400/90 tabular-nums">
                Saved
              </span>
            ) : null}
            {dirty ? (
              <span className="text-[11px] text-amber-100/70 tabular-nums">Unsaved changes</span>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
