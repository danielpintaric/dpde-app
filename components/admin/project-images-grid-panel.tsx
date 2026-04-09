"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProjectImageMutation,
  reorderProjectImagesAction,
  setProjectCoverMutation,
  updateProjectImageDetailsMutation,
} from "@/lib/actions/admin-image-actions";
import { isArrowNavBlockedForBatch } from "@/lib/admin/batch-edit-keyboard";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import { FocalPointModal } from "@/components/admin/focal-point-modal";
import { useProjectEditorSession } from "@/components/admin/project-editor-session-context";
import { ProjectImageDetailsForm } from "@/components/admin/project-image-details-form";
import { ProjectImagesSortableTile } from "@/components/admin/project-images-sortable-tile";
import {
  ADMIN_IMAGE_ASPECT_PRESETS,
  DEFAULT_UPLOAD_ASPECT_CLASS,
} from "@/lib/constants/admin-image-aspects";
import type { Image, Project } from "@/types/project";

type Props = {
  project: Project;
  images: Image[];
  savedImageId: string | null;
};

function aspectSelectValue(img: Image): string {
  return img.aspectClass?.trim() || DEFAULT_UPLOAD_ASPECT_CLASS;
}

function pickInitialSelectedId(images: Image[], savedImageId: string | null): string | null {
  if (images.length === 0) return null;
  if (savedImageId && images.some((i) => i.id === savedImageId)) {
    return savedImageId;
  }
  return images[0]?.id ?? null;
}

function sortImagesBySortOrder(images: Image[]): Image[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

function syncKeyFromImages(images: Image[]): string {
  return sortImagesBySortOrder(images)
    .map((i) => `${i.id}:${i.sortOrder}:${i.focalX ?? ""}:${i.focalY ?? ""}`)
    .join("|");
}

function mergeFocal(image: Image, local: Record<string, { focalX: number | null; focalY: number | null }>): Image {
  const p = local[image.id];
  if (p === undefined) return image;
  return { ...image, focalX: p.focalX, focalY: p.focalY };
}

export function ProjectImagesGridPanel({ project, images, savedImageId }: Props) {
  const router = useRouter();
  const editorSession = useProjectEditorSession();
  const presetValues = new Set(ADMIN_IMAGE_ASPECT_PRESETS.map((p) => p.value));

  const [optimisticCoverId, setOptimisticCoverId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [localFocal, setLocalFocal] = useState<
    Record<string, { focalX: number | null; focalY: number | null }>
  >({});

  const [selectedId, setSelectedId] = useState<string | null>(() =>
    pickInitialSelectedId(images, savedImageId),
  );

  const [focalModalImageId, setFocalModalImageId] = useState<string | null>(null);
  const [detailsNavError, setDetailsNavError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ type: "cover" | "delete"; id: string } | null>(null);

  const effectiveCoverId = optimisticCoverId ?? project.coverImageId;

  const visibleImages = useMemo(() => {
    return sortImagesBySortOrder(images)
      .filter((i) => !removedIds.has(i.id))
      .map((i) => mergeFocal(i, localFocal));
  }, [images, removedIds, localFocal]);

  const serverSyncKey = useMemo(() => syncKeyFromImages(images), [images]);
  const baseOrderedIds = useMemo(
    () => visibleImages.map((i) => i.id),
    [visibleImages],
  );

  const [orderPatch, setOrderPatch] = useState<{
    serverKey: string;
    ids: string[];
  } | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const patchActive = orderPatch !== null && orderPatch.serverKey === serverSyncKey;
  const orderedIds = patchActive ? orderPatch.ids : baseOrderedIds;

  const imageById = useMemo(() => new Map(visibleImages.map((i) => [i.id, i] as const)), [visibleImages]);

  const resolvedSelectedId = useMemo(() => {
    if (selectedId != null && visibleImages.some((i) => i.id === selectedId)) {
      return selectedId;
    }
    return visibleImages[0]?.id ?? null;
  }, [visibleImages, selectedId]);

  const selectTile = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    if (optimisticCoverId != null && project.coverImageId === optimisticCoverId) {
      setOptimisticCoverId(null);
    }
  }, [optimisticCoverId, project.coverImageId]);

  useEffect(() => {
    setRemovedIds((prev) => {
      const next = new Set([...prev].filter((id) => images.some((i) => i.id === id)));
      return next.size === prev.size ? prev : next;
    });
  }, [images]);

  const onSelectableKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTile(id);
      }
    },
    [selectTile],
  );

  const selectedImage = resolvedSelectedId ? imageById.get(resolvedSelectedId) : undefined;
  const selectedDetailsIdx = resolvedSelectedId ? orderedIds.indexOf(resolvedSelectedId) : -1;
  const detailsCanGoPrev = selectedDetailsIdx > 0;
  const detailsCanGoNext =
    selectedDetailsIdx >= 0 && selectedDetailsIdx < orderedIds.length - 1;
  const focalNavIdx = focalModalImageId ? orderedIds.indexOf(focalModalImageId) : -1;

  const selectedAspect = selectedImage ? aspectSelectValue(selectedImage) : "";
  const selectedShowCustom = selectedImage ? !presetValues.has(selectedAspect) : false;
  const inspectorPreviewW =
    selectedImage?.width != null && selectedImage.width > 0 ? selectedImage.width : 1600;
  const inspectorPreviewH =
    selectedImage?.height != null && selectedImage.height > 0 ? selectedImage.height : 1200;

  useEffect(() => {
    if (selectedImage || !editorSession) {
      return;
    }
    editorSession.setImageDetailsDirty(false);
    editorSession.setImageDetailsSaving(false);
  }, [selectedImage, editorSession]);

  useEffect(() => {
    setDetailsNavError(null);
  }, [resolvedSelectedId]);

  const handleDetailsNav = useCallback(
    async (dir: "prev" | "next") => {
      if (!resolvedSelectedId || orderedIds.length < 2) {
        return;
      }
      const idx = orderedIds.indexOf(resolvedSelectedId);
      if (idx < 0) {
        return;
      }
      const nextIdx = dir === "next" ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= orderedIds.length) {
        return;
      }

      if (editorSession?.imageDetailsDirty) {
        const form = document.querySelector<HTMLFormElement>(
          'form[data-editor-save="image-details"]',
        );
        if (!form) {
          setDetailsNavError("Details form not ready.");
          return;
        }
        const result = await updateProjectImageDetailsMutation(new FormData(form));
        if (!result.ok) {
          setDetailsNavError(result.error);
          return;
        }
        setDetailsNavError(null);
        await router.refresh();
      } else {
        setDetailsNavError(null);
      }
      setSelectedId(orderedIds[nextIdx]);
    },
    [editorSession, orderedIds, resolvedSelectedId, router],
  );

  useEffect(() => {
    if (focalModalImageId != null || !selectedImage || orderedIds.length < 2) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
        return;
      }
      if (isArrowNavBlockedForBatch()) {
        return;
      }
      e.preventDefault();
      if (e.key === "ArrowLeft") {
        if (!detailsCanGoPrev) {
          return;
        }
        void handleDetailsNav("prev");
      } else {
        if (!detailsCanGoNext) {
          return;
        }
        void handleDetailsNav("next");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    detailsCanGoNext,
    detailsCanGoPrev,
    focalModalImageId,
    handleDetailsNav,
    orderedIds.length,
    selectedImage,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (orderSaving || pending || !over || active.id === over.id) {
        return;
      }
      const currentIds =
        orderPatch !== null && orderPatch.serverKey === serverSyncKey
          ? orderPatch.ids
          : baseOrderedIds;
      const oldIndex = currentIds.indexOf(String(active.id));
      const newIndex = currentIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }
      const next = arrayMove(currentIds, oldIndex, newIndex);
      setOrderPatch({ serverKey: serverSyncKey, ids: next });
      setOrderError(null);
      setOrderSaving(true);
      const result = await reorderProjectImagesAction(project.id, project.slug, next);
      setOrderSaving(false);
      if (!result.ok) {
        setOrderPatch(null);
        setOrderError(result.error);
        return;
      }
      router.refresh();
    },
    [
      orderSaving,
      pending,
      orderPatch,
      baseOrderedIds,
      serverSyncKey,
      project.id,
      project.slug,
      router,
    ],
  );

  useEffect(() => {
    if (!focalModalImageId) return;
    if (!visibleImages.some((i) => i.id === focalModalImageId)) {
      setFocalModalImageId(null);
    }
  }, [focalModalImageId, visibleImages]);

  const handleSetCover = useCallback(
    async (imageId: string) => {
      if (pending) return;
      setPending({ type: "cover", id: imageId });
      setOptimisticCoverId(imageId);
      const result = await setProjectCoverMutation(project.id, project.slug, imageId);
      setPending(null);
      if (!result.ok) {
        setOptimisticCoverId(null);
        setOrderError(result.error);
        return;
      }
      router.refresh();
    },
    [pending, project.id, project.slug, router],
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      if (pending) return;
      if (!window.confirm("Delete this image permanently? This cannot be undone.")) {
        return;
      }
      setPending({ type: "delete", id: imageId });
      setRemovedIds((prev) => new Set(prev).add(imageId));
      setOrderPatch((prev) => {
        if (!prev || prev.serverKey !== serverSyncKey) return prev;
        const ids = prev.ids.filter((x) => x !== imageId);
        return { ...prev, ids };
      });
      const result = await deleteProjectImageMutation(project.id, project.slug, imageId);
      if (!result.ok) {
        setRemovedIds((prev) => {
          const n = new Set(prev);
          n.delete(imageId);
          return n;
        });
        setOrderPatch(null);
        setPending(null);
        setOrderError(result.error);
        return;
      }
      setPending(null);
      if (resolvedSelectedId === imageId) {
        const rest = orderedIds.filter((x) => x !== imageId);
        setSelectedId(rest[0] ?? null);
      }
      setOrderPatch(null);
      router.refresh();
    },
    [pending, project.id, project.slug, orderedIds, resolvedSelectedId, router, serverSyncKey],
  );

  const focalModalImage = focalModalImageId ? imageById.get(focalModalImageId) ?? null : null;

  const onFocalSaved = useCallback(
    (imageId: string, focalX: number | null, focalY: number | null) => {
      setLocalFocal((prev) => ({ ...prev, [imageId]: { focalX, focalY } }));
      router.refresh();
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <FocalPointModal
        project={project}
        image={focalModalImage}
        open={focalModalImageId != null && focalModalImage != null}
        onClose={() => setFocalModalImageId(null)}
        onSaved={onFocalSaved}
        batchIndex={focalNavIdx >= 0 ? focalNavIdx + 1 : 1}
        batchTotal={orderedIds.length}
        batchCanGoPrev={focalNavIdx > 0}
        batchCanGoNext={focalNavIdx >= 0 && focalNavIdx < orderedIds.length - 1}
        onBatchNavigatePrev={() => {
          if (focalNavIdx <= 0) {
            return;
          }
          setFocalModalImageId(orderedIds[focalNavIdx - 1]!);
        }}
        onBatchNavigateNext={() => {
          if (focalNavIdx < 0 || focalNavIdx >= orderedIds.length - 1) {
            return;
          }
          setFocalModalImageId(orderedIds[focalNavIdx + 1]!);
        }}
      />

      <div className="min-w-0 space-y-3">
        {orderError ? (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-xs leading-snug text-red-100/90 shadow-sm shadow-black/20">
            {orderError}
          </p>
        ) : null}
        {orderSaving ? (
          <p className="text-[11px] font-medium tracking-wide text-zinc-500">Saving order…</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-start lg:gap-x-9 lg:gap-y-6 xl:gap-x-11">
        <div className="min-w-0 self-start">
          {images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800/55 bg-zinc-950/30 px-6 py-16 text-center sm:py-20">
              <p className="font-serif text-lg tracking-tight text-zinc-200">No photos yet</p>
              <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed text-zinc-500">
                Use the upload area above to add images. They will show up here right away.
              </p>
            </div>
          ) : (
            <DndContext
              id={`dnd-project-images-${project.id}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={orderedIds}
                strategy={rectSortingStrategy}
                disabled={orderSaving || Boolean(pending)}
              >
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                  {orderedIds.map((id, index) => {
                    const img = imageById.get(id);
                    if (!img) return null;
                    const positionLabel = `#${index + 1}`;
                    return (
                      <ProjectImagesSortableTile
                        key={id}
                        id={id}
                        image={img}
                        project={project}
                        positionLabel={positionLabel}
                        isSelected={resolvedSelectedId === img.id}
                        effectiveCoverId={effectiveCoverId}
                        disabled={orderSaving || Boolean(pending)}
                        busyCover={pending?.type === "cover" && pending.id === img.id}
                        busyDelete={pending?.type === "delete" && pending.id === img.id}
                        onSelect={selectTile}
                        onSelectableKeyDown={onSelectableKeyDown}
                        onSetCover={handleSetCover}
                        onDelete={handleDelete}
                        onOpenFocus={(iid) => setFocalModalImageId(iid)}
                        onEdit={(iid) => selectTile(iid)}
                      />
                    );
                  })}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <aside className="min-w-0 w-full max-w-[360px] justify-self-end self-start pl-1 lg:sticky lg:top-24 lg:z-10 lg:pl-2">
          {selectedImage ? (
            <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-600/35 bg-zinc-950/85 shadow-md shadow-black/25 ring-1 ring-zinc-200/10 transition-[border-color,background-color,box-shadow] duration-200 ease-out">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-zinc-800/55 bg-zinc-950/70 px-2.5 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                    Details
                  </span>
                  {orderedIds.length > 1 ? (
                    <span className="text-[9px] tabular-nums text-zinc-500">
                      {selectedDetailsIdx + 1} / {orderedIds.length}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {orderedIds.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image details"
                        disabled={!detailsCanGoPrev}
                        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-zinc-700/70 bg-zinc-900/50 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
                        onClick={() => void handleDetailsNav("prev")}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next image details"
                        disabled={!detailsCanGoNext}
                        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-zinc-700/70 bg-zinc-900/50 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
                        onClick={() => void handleDetailsNav("next")}
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                  <span className="min-w-0 truncate text-right text-[9px] text-zinc-500 tabular-nums">
                    {selectedImage.width != null && selectedImage.height != null
                      ? `${selectedImage.width}×${selectedImage.height}`
                      : "—"}
                  </span>
                </div>
              </div>
              {detailsNavError ? (
                <p className="shrink-0 border-b border-red-900/30 bg-red-950/25 px-2.5 py-1.5 text-[10px] leading-snug text-red-100/90">
                  {detailsNavError}
                </p>
              ) : null}
              <div className="shrink-0 bg-gradient-to-b from-zinc-900/40 to-zinc-950/90 px-3 pb-6 pt-3">
                <NextImage
                  src={getAdminImagePreviewUrl(selectedImage)}
                  alt=""
                  width={inspectorPreviewW}
                  height={inspectorPreviewH}
                  sizes="(max-width: 1024px) 90vw, 320px"
                  unoptimized
                  className="mx-auto h-auto max-h-[220px] w-full object-contain object-center opacity-[0.98]"
                />
              </div>
              {selectedImage.storagePath ? (
                <p
                  className="shrink-0 truncate border-t border-zinc-800/35 bg-zinc-950/40 px-2.5 py-1.5 font-mono text-[8px] leading-snug text-zinc-600"
                  title={selectedImage.storagePath}
                >
                  {selectedImage.storagePath}
                </p>
              ) : null}
              <div className="shrink-0 bg-zinc-950/55 px-2.5 pb-3 pt-4">
                <ProjectImageDetailsForm
                  project={project}
                  image={selectedImage}
                  aspectValue={selectedAspect}
                  showCustomAspect={selectedShowCustom}
                  justSaved={savedImageId === selectedImage.id}
                  compact
                  onDirtyChange={(d) => editorSession?.setImageDetailsDirty(d)}
                  onSavingChange={(s) => editorSession?.setImageDetailsSaving(s)}
                  onSaveAndNext={
                    detailsCanGoNext
                      ? async () => {
                          await router.refresh();
                          setSelectedId(orderedIds[selectedDetailsIdx + 1]!);
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-xl border border-dashed border-zinc-800/70 bg-zinc-950/80 shadow-sm shadow-black/15">
              <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-zinc-800/40 bg-zinc-950/50 px-2.5 py-1.5">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                  Details
                </span>
                <span className="text-right text-[9px] text-zinc-600">—</span>
              </div>
              <div
                className="flex shrink-0 justify-center bg-gradient-to-b from-zinc-900/75 via-zinc-900 to-zinc-950/85 px-2 py-5 pb-5"
                aria-hidden
              >
                <div className="flex w-full max-w-[min(100%,240px)] items-center justify-center rounded-md border border-zinc-800/40 bg-zinc-900/30 px-3 py-6 text-center">
                  <span className="text-[11px] leading-relaxed text-zinc-600">Preview</span>
                </div>
              </div>
              <p className="shrink-0 border-t border-zinc-800/45 px-3 py-3 text-center text-sm leading-relaxed text-zinc-600">
                {images.length === 0
                  ? "Upload images, then tap a tile to edit caption and framing."
                  : "Select a photo to edit details."}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
