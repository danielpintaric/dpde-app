"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { FocalPointPicker } from "@/components/admin/focal-point-picker";
import { AdminSelect } from "@/components/admin/admin-select";
import { editorSaveButtonPrimaryClass } from "@/components/admin/editor-save-button-styles";
import {
  updateProjectImageDetailsAction,
  updateProjectImageDetailsMutation,
} from "@/lib/actions/admin-image-actions";
import { ADMIN_IMAGE_ASPECT_PRESETS } from "@/lib/constants/admin-image-aspects";
import type { Image, Project } from "@/types/project";

type DetailsSnapshot = {
  caption: string;
  altText: string;
  aspectClass: string;
  objectPosition: string;
  focalX: string;
  focalY: string;
  imageFilterClass: string;
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
    focalX: String(fd.get("focalX") ?? ""),
    focalY: String(fd.get("focalY") ?? ""),
    imageFilterClass: String(fd.get("imageFilterClass") ?? ""),
    sortOrder: String(fd.get("sortOrder") ?? ""),
  };
}

function equalSnapshot(a: DetailsSnapshot, b: DetailsSnapshot): boolean {
  return (
    a.caption === b.caption &&
    a.altText === b.altText &&
    a.aspectClass === b.aspectClass &&
    a.objectPosition === b.objectPosition &&
    a.focalX === b.focalX &&
    a.focalY === b.focalY &&
    a.imageFilterClass === b.imageFilterClass &&
    a.sortOrder === b.sortOrder
  );
}

function ImageDetailsFormSavingBridge({ onSavingChange }: { onSavingChange?: (saving: boolean) => void }) {
  const { pending } = useFormStatus();
  useEffect(() => {
    onSavingChange?.(pending);
  }, [pending, onSavingChange]);
  return null;
}

function SubmitDetailsButton({ dirty, compact }: { dirty: boolean; compact: boolean }) {
  const { pending } = useFormStatus();
  const disabled = !dirty || pending;
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className={`font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 enabled:cursor-pointer ${
        compact
          ? editorSaveButtonPrimaryClass
          : "rounded border border-zinc-500 bg-zinc-800/40 px-3 py-1.5 text-xs text-zinc-200 enabled:hover:border-zinc-400 enabled:hover:bg-zinc-800"
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
  onDirtyChange?: (dirty: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
  /**
   * Wenn gesetzt: „Save & next“ (Mutation ohne Redirect) – z. B. Batch-Review im Grid.
   */
  onSaveAndNext?: () => void | Promise<void>;
};

export function ProjectImageDetailsForm({
  project,
  image,
  aspectValue,
  showCustomAspect,
  justSaved,
  compact = false,
  onDirtyChange,
  onSavingChange,
  onSaveAndNext,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [batchSaveError, setBatchSaveError] = useState<string | null>(null);
  const initialRef = useRef<DetailsSnapshot>({
    caption: image.caption ?? "",
    altText: image.altText ?? "",
    aspectClass: aspectValue,
    objectPosition: image.objectPosition ?? "",
    focalX: typeof image.focalX === "number" ? String(image.focalX) : "",
    focalY: typeof image.focalY === "number" ? String(image.focalY) : "",
    imageFilterClass: image.imageFilterClass ?? "",
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
      focalX: typeof image.focalX === "number" ? String(image.focalX) : "",
      focalY: typeof image.focalY === "number" ? String(image.focalY) : "",
      imageFilterClass: image.imageFilterClass ?? "",
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
    image.focalX,
    image.focalY,
    image.imageFilterClass,
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

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    setBatchSaveError(null);
  }, [image.id]);

  /** Nur bei echtem Bildwechsel — nicht bei Prop-Updates desselben `image.id` (z. B. Refresh). */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      captionRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [image.id]);

  const syncDirty = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    setDirty(!equalSnapshot(readSnapshot(form), initialRef.current));
  };

  const cLabel = compact ? "mb-0.5 block text-[9px] uppercase tracking-[0.08em] text-zinc-500" : labelClass;
  const cInput = compact
    ? "w-full rounded border border-zinc-700/85 bg-zinc-900/75 px-2 py-1 text-[11px] leading-snug text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500/80 focus:outline-none"
    : inputClass;
  const cGrid = compact ? "grid grid-cols-1 gap-2" : "grid gap-3 sm:grid-cols-2";

  const aspectOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (showCustomAspect) {
      const short = aspectValue.length > 48 ? `${aspectValue.slice(0, 48)}…` : aspectValue;
      list.push({ value: aspectValue, label: `Current (custom): ${short}` });
    }
    for (const p of ADMIN_IMAGE_ASPECT_PRESETS) {
      list.push({ value: p.value, label: p.label });
    }
    return list;
  }, [showCustomAspect, aspectValue]);

  const sectionLabel = (text: string) => (
    <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">{text}</p>
  );

  const hiddenFields = (
    <>
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="imageId" value={image.id} />
      <input type="hidden" name="projectSlug" value={project.slug} />
    </>
  );

  return (
    <form
      ref={formRef}
      action={updateProjectImageDetailsAction}
      data-editor-save="image-details"
      className={compact ? "space-y-0" : "space-y-3"}
      onChange={syncDirty}
      onInput={syncDirty}
    >
      {hiddenFields}
      {onSavingChange ? <ImageDetailsFormSavingBridge onSavingChange={onSavingChange} /> : null}

      {compact ? (
        <>
          <div className="space-y-2">
            {sectionLabel("Text")}
            <div>
              <label htmlFor={`caption-${image.id}`} className={cLabel}>
                Caption
              </label>
              <textarea
                ref={captionRef}
                id={`caption-${image.id}`}
                name="caption"
                rows={2}
                defaultValue={image.caption ?? ""}
                className={`${cInput} resize-y min-h-[2.25rem]`}
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
          </div>

          <div className="mt-3 border-t border-zinc-800/40 pt-3">
            {sectionLabel("Framing")}
            <FocalPointPicker image={image} compact onFocalChange={syncDirty} />
            <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2">
              <div className="min-w-0">
                <label htmlFor={`aspect-${image.id}`} className={cLabel}>
                  Aspect class
                </label>
                <AdminSelect
                  id={`aspect-${image.id}`}
                  name="aspectClass"
                  dense
                  defaultValue={aspectValue}
                  options={aspectOptions}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor={`pos-${image.id}`} className={cLabel}>
                  Legacy position (CSS)
                </label>
                <input
                  id={`pos-${image.id}`}
                  name="objectPosition"
                  type="text"
                  defaultValue={image.objectPosition ?? ""}
                  className={cInput}
                  placeholder="if no focal: e.g. center 30%"
                />
              </div>
              <div className="col-span-2 min-w-0">
                <label htmlFor={`filter-${image.id}`} className={cLabel}>
                  Filter classes (optional)
                </label>
                <input
                  id={`filter-${image.id}`}
                  name="imageFilterClass"
                  type="text"
                  defaultValue={image.imageFilterClass ?? ""}
                  className={cInput}
                  placeholder="e.g. brightness-[0.94] contrast-[1.03] — empty = default"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-zinc-800/40 pt-3">
            {sectionLabel("Order")}
            <div className="rounded-md border border-zinc-800/50 bg-zinc-900/35 px-2 py-2 shadow-sm shadow-black/10">
              <div>
                <label htmlFor={`sort-${image.id}`} className={cLabel}>
                  Sort order
                </label>
                <input
                  id={`sort-${image.id}`}
                  name="sortOrder"
                  type="number"
                  defaultValue={image.sortOrder}
                  className={`${cInput} tabular-nums`}
                />
              </div>
              {batchSaveError ? (
                <p className="mt-2 rounded border border-red-900/35 bg-red-950/30 px-2 py-1.5 text-[10px] leading-snug text-red-100/90">
                  {batchSaveError}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-zinc-800/40 pt-2">
                <SubmitDetailsButton dirty={dirty} compact={compact} />
                {onSaveAndNext ? (
                  <button
                    type="button"
                    className="rounded border border-zinc-700/80 bg-transparent px-2 py-1 text-[10px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900/50 hover:text-zinc-200"
                    onClick={() => {
                      void (async () => {
                        const form = formRef.current;
                        if (!form) return;
                        setBatchSaveError(null);
                        if (dirty) {
                          const result = await updateProjectImageDetailsMutation(new FormData(form));
                          if (!result.ok) {
                            setBatchSaveError(result.error);
                            return;
                          }
                        }
                        await onSaveAndNext();
                      })();
                    }}
                  >
                    Save & next
                  </button>
                ) : null}
                {savedVisible ? (
                  <span
                    role="status"
                    aria-live="polite"
                    className="text-[10px] font-medium text-emerald-500/85 tabular-nums"
                  >
                    Saved
                  </span>
                ) : null}
                {dirty ? (
                  <span className="text-[10px] text-zinc-500 tabular-nums">Unsaved changes</span>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={cGrid}>
          <div className="sm:col-span-2">
            <label htmlFor={`caption-${image.id}`} className={cLabel}>
              Caption
            </label>
            <textarea
              ref={captionRef}
              id={`caption-${image.id}`}
              name="caption"
              rows={2}
              defaultValue={image.caption ?? ""}
              className={`${cInput} resize-y min-h-[2.5rem]`}
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
            <AdminSelect
              id={`aspect-${image.id}`}
              name="aspectClass"
              defaultValue={aspectValue}
              options={aspectOptions}
            />
          </div>
          <FocalPointPicker image={image} onFocalChange={syncDirty} />
          <div>
            <label htmlFor={`pos-${image.id}`} className={cLabel}>
              Legacy position (CSS)
            </label>
            <input
              id={`pos-${image.id}`}
              name="objectPosition"
              type="text"
              defaultValue={image.objectPosition ?? ""}
              className={cInput}
              placeholder="if no focal: e.g. center 30% 50%"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`filter-${image.id}`} className={cLabel}>
              Filter classes (optional)
            </label>
            <input
              id={`filter-${image.id}`}
              name="imageFilterClass"
              type="text"
              defaultValue={image.imageFilterClass ?? ""}
              className={cInput}
              placeholder="e.g. brightness-[0.94] contrast-[1.03] — empty = default"
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
          <div className="flex flex-col gap-2 sm:col-span-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <SubmitDetailsButton dirty={dirty} compact={compact} />
              {savedVisible ? (
                <span role="status" aria-live="polite" className="text-[11px] text-emerald-400/90 tabular-nums">
                  Saved
                </span>
              ) : null}
              {dirty ? (
                <span className="text-[11px] text-zinc-500 tabular-nums">Unsaved changes</span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
