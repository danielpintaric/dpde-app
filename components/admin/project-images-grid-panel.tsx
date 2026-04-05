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
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { reorderProjectImagesAction } from "@/lib/actions/admin-image-actions";
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (orderSaving || !over || active.id === over.id) {
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
    [orderSaving, orderPatch, baseOrderedIds, serverSyncKey, project.id, project.slug, router],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(288px,400px)] lg:items-start xl:gap-10">
      <div className="min-w-0">
        <p className="mb-4 max-w-2xl text-[11px] leading-relaxed tracking-wide text-zinc-500">
          <span className="text-zinc-400">Sortierung</span>
          <span className="mx-1.5 text-zinc-700">·</span>
          Oberen Griff ziehen. Reihenfolge wird als <span className="tabular-nums text-zinc-500">0 … n−1</span>{" "}
          gespeichert.
          {orderSaving ? (
            <span className="ml-2 font-medium text-amber-200/80 transition-colors duration-200">
              Speichert …
            </span>
          ) : null}
        </p>
        {orderError ? (
          <p className="mb-4 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-xs leading-snug text-red-100/90 shadow-sm shadow-black/20">
            {orderError}
          </p>
        ) : null}
        {images.length === 0 ? (
          <p className="mb-4 text-sm leading-relaxed text-zinc-600">
            Noch keine Bilder – oben in die Ablage ziehen oder dort klicken.
          </p>
        ) : null}
        <DndContext
          id={`dnd-project-images-${project.id}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy} disabled={orderSaving}>
            <ul className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
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
                    disabled={orderSaving}
                    onSelect={selectTile}
                    onSelectableKeyDown={onSelectableKeyDown}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-6">
        {selectedImage ? (
          <div className="rounded-xl border border-zinc-800/70 border-l-2 border-l-amber-500/35 bg-zinc-950/70 p-4 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.04] transition-[box-shadow,border-color] duration-200">
            <div className="mb-4 flex items-baseline justify-between gap-2 border-b border-zinc-800/60 pb-3">
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                Aktives Bild
              </h3>
              <span className="text-[10px] text-zinc-600">Metadaten</span>
            </div>
            {selectedImage.storagePath ? (
              <p
                className="mb-4 truncate font-mono text-[10px] text-zinc-500"
                title={selectedImage.storagePath}
              >
                {selectedImage.storagePath}
              </p>
            ) : null}
            <ProjectImageDetailsForm
              project={project}
              image={selectedImage}
              aspectValue={selectedAspect}
              showCustomAspect={selectedShowCustom}
              justSaved={savedImageId === selectedImage.id}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30 px-4 py-8 text-center text-sm leading-relaxed text-zinc-600">
            {images.length === 0
              ? "Nach dem Upload erscheinen Bilder hier. Anschließend ein Kachelbild auswählen für Metadaten."
              : "Bild im Raster auswählen, um Metadaten zu bearbeiten."}
          </div>
        )}
      </aside>
    </div>
  );
}
