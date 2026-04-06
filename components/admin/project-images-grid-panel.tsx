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
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import {
  deleteProjectImagesBulkAction,
  reorderProjectImagesAction,
} from "@/lib/actions/admin-image-actions";
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
    .map((i) => `${i.id}:${i.sortOrder}`)
    .join("|");
}

export function ProjectImagesGridPanel({ project, images, savedImageId }: Props) {
  const router = useRouter();
  const editorSession = useProjectEditorSession();
  const presetValues = new Set(ADMIN_IMAGE_ASPECT_PRESETS.map((p) => p.value));

  const [selectedId, setSelectedId] = useState<string | null>(() =>
    pickInitialSelectedId(images, savedImageId),
  );

  const serverSyncKey = useMemo(() => syncKeyFromImages(images), [images]);
  const baseOrderedIds = useMemo(
    () => sortImagesBySortOrder(images).map((i) => i.id),
    [images],
  );
  const [orderPatch, setOrderPatch] = useState<{
    serverKey: string;
    ids: string[];
  } | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const patchActive =
    orderPatch !== null && orderPatch.serverKey === serverSyncKey;
  const orderedIds = patchActive ? orderPatch.ids : baseOrderedIds;

  const imageById = useMemo(() => new Map(images.map((i) => [i.id, i] as const)), [images]);

  const resolvedSelectedId = useMemo(() => {
    if (selectedId != null && images.some((i) => i.id === selectedId)) {
      return selectedId;
    }
    return sortImagesBySortOrder(images)[0]?.id ?? null;
  }, [images, selectedId]);

  const selectTile = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const bulkIdSet = useMemo(() => new Set(bulkIds), [bulkIds]);
  const bulkIdsInProject = useMemo(
    () => bulkIds.filter((id) => imageById.has(id)),
    [bulkIds, imageById],
  );
  const bulkCount = bulkIdsInProject.length;

  useEffect(() => {
    setBulkIds((prev) => {
      const next = prev.filter((id) => images.some((i) => i.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [serverSyncKey, images]);

  const toggleBulk = useCallback((id: string) => {
    setBulkIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clearBulk = useCallback(() => {
    setBulkIds([]);
    setBulkError(null);
  }, []);

  const runBulkDelete = useCallback(async () => {
    if (bulkIdsInProject.length === 0 || bulkDeleting) return;
    const n = bulkIdsInProject.length;
    if (
      !window.confirm(
        n === 1
          ? "Permanently delete this image? This cannot be undone."
          : `Permanently delete ${n} images? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBulkError(null);
    setBulkDeleting(true);
    try {
      const result = await deleteProjectImagesBulkAction(
        project.id,
        project.slug,
        bulkIdsInProject,
      );
      if (!result.ok) {
        setBulkError(result.error);
        return;
      }
      const deleted = new Set(bulkIdsInProject);
      const remainingOrdered = orderedIds.filter((id) => !deleted.has(id));
      setBulkIds([]);
      if (resolvedSelectedId && deleted.has(resolvedSelectedId)) {
        setSelectedId(remainingOrdered[0] ?? null);
      }
      router.refresh();
    } finally {
      setBulkDeleting(false);
    }
  }, [
    bulkDeleting,
    bulkIdsInProject,
    orderedIds,
    project.id,
    project.slug,
    resolvedSelectedId,
    router,
  ]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (orderSaving || bulkDeleting || !over || active.id === over.id) {
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
      bulkDeleting,
      orderPatch,
      baseOrderedIds,
      serverSyncKey,
      project.id,
      project.slug,
      router,
    ],
  );

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <div className="min-w-0 space-y-4">
        <p className="max-w-2xl text-[11px] leading-relaxed tracking-wide text-zinc-500">
          <span className="text-zinc-400">Order</span>
          <span className="mx-1.5 text-zinc-700">·</span>
          Drag the top handle. Sort index <span className="tabular-nums text-zinc-500">0 … n−1</span>.
          <span className="mx-1.5 text-zinc-700">·</span>
          <span className="text-zinc-400">Multi-select</span> — checkbox on each tile.
          {orderSaving ? (
            <span className="ml-2 font-medium text-zinc-400 transition-colors duration-200">Saving…</span>
          ) : null}
        </p>
        {bulkCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/55 px-3 py-2.5 text-xs shadow-sm shadow-black/15">
            <span className="font-medium tabular-nums text-zinc-300">{bulkCount} selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={bulkDeleting || orderSaving}
                onClick={runBulkDelete}
                className="cursor-pointer rounded-lg border border-red-950/50 bg-red-950/20 px-2.5 py-1.5 text-[11px] font-medium text-red-300/90 transition-colors hover:border-red-900/60 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={clearBulk}
                className="cursor-pointer rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Clear selection
              </button>
            </div>
          </div>
        ) : null}
        {bulkError ? (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-xs leading-snug text-red-100/90 shadow-sm shadow-black/20">
            {bulkError}
          </p>
        ) : null}
        {orderError ? (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-xs leading-snug text-red-100/90 shadow-sm shadow-black/20">
            {orderError}
          </p>
        ) : null}
        {images.length === 0 ? (
          <p className="text-sm leading-relaxed text-zinc-600">
            No images yet — use the drop zone above.
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-start lg:gap-x-9 lg:gap-y-6 xl:gap-x-11">
        <div className="min-w-0 self-start">
          <DndContext
            id={`dnd-project-images-${project.id}`}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={orderedIds}
              strategy={rectSortingStrategy}
              disabled={orderSaving || bulkDeleting}
            >
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
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
                      isBulkSelected={bulkIdSet.has(img.id)}
                      disabled={orderSaving || bulkDeleting}
                      onSelect={selectTile}
                      onSelectableKeyDown={onSelectableKeyDown}
                      onBulkToggle={toggleBulk}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        <aside className="min-w-0 w-full max-w-[360px] justify-self-end self-start pl-1 lg:sticky lg:top-24 lg:z-10 lg:pl-2">
          {selectedImage ? (
            <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-600/35 bg-zinc-950/85 shadow-md shadow-black/25 ring-1 ring-zinc-200/10 transition-[border-color,background-color,box-shadow] duration-200 ease-out">
              <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-zinc-800/55 bg-zinc-950/70 px-2.5 py-1.5">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Inspector
                </span>
                <span className="min-w-0 truncate text-right text-[9px] text-zinc-500 tabular-nums">
                  {selectedImage.width != null && selectedImage.height != null
                    ? `${selectedImage.width}×${selectedImage.height}`
                    : "—"}
                </span>
              </div>
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
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-lg border border-dashed border-zinc-800/70 bg-zinc-950/80 shadow-sm shadow-black/15">
              <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-zinc-800/40 bg-zinc-950/50 px-2.5 py-1.5">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                  Inspector
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
                  ? "After upload, pick a tile here to edit in the inspector."
                  : "Select a tile to edit details in the inspector."}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
