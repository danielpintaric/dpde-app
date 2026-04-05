"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { uploadProjectImagesFiles } from "@/lib/admin/project-images-upload-api";

type Props = {
  projectId: string;
  projectSlug: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

function hasFilePayload(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).some(
    (t) => t === "Files" || t === "application/x-moz-file",
  );
}

export function ProjectImagesUploadDropzone({ projectId, projectSlug }: Props) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fileDragOver, setFileDragOver] = useState(false);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(null), 4500);
    return () => window.clearTimeout(t);
  }, [success]);

  const runUpload = useCallback(
    async (files: File[]) => {
      setError(null);
      setSuccess(null);
      if (files.length === 0) {
        setError("Keine gültigen Bilddateien.");
        return;
      }
      setPending(true);
      try {
        const result = await uploadProjectImagesFiles(projectId, projectSlug, files);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess(
          result.uploadedCount === 1
            ? "1 Bild hochgeladen."
            : `${result.uploadedCount} Bilder hochgeladen.`,
        );
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } finally {
        setPending(false);
      }
    },
    [projectId, projectSlug, router],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list || list.length === 0) return;
      void runUpload(Array.from(list));
    },
    [runUpload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFileDragOver(false);
      if (pending) return;
      const list = e.dataTransfer.files;
      if (!list || list.length === 0) return;
      void runUpload(Array.from(list));
    },
    [pending, runUpload],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasFilePayload(e)) return;
    setFileDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) {
      return;
    }
    setFileDragOver(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasFilePayload(e)) {
      e.dataTransfer.dropEffect = pending ? "none" : "copy";
    }
  }, [pending]);

  const openPicker = useCallback(() => {
    if (pending) return;
    inputRef.current?.click();
  }, [pending]);

  const onKeyDownZone = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker],
  );

  return (
    <div className="mb-8">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        disabled={pending}
        onChange={onInputChange}
      />

      {error ? (
        <p className="mb-3 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-xs leading-snug text-red-100/90 shadow-sm shadow-black/20">
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="mb-3 rounded-lg border border-emerald-900/35 bg-emerald-950/25 px-3 py-2.5 text-xs leading-snug text-emerald-100/90 shadow-sm shadow-black/15"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <label htmlFor={inputId} className="sr-only">
        Bilddateien zum Hochladen auswählen
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label="Bilder per Drag and Drop oder Klick hochladen"
        aria-disabled={pending}
        onClick={openPicker}
        onKeyDown={onKeyDownZone}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        className={[
          "relative cursor-pointer rounded-xl border border-dashed px-4 py-10 text-center transition-[border-color,background-color,box-shadow,opacity] duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          pending ? "pointer-events-none opacity-60" : "",
          fileDragOver && !pending
            ? "border-amber-500/35 bg-amber-950/15 shadow-[0_0_28px_-12px_rgba(251,191,36,0.25)]"
            : "border-zinc-700/55 bg-zinc-950/40 hover:border-zinc-600/55 hover:bg-zinc-900/35",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-zinc-300">
          Bilder hierher ziehen
          <span className="mx-2 text-zinc-600">·</span>
          <span className="text-zinc-400">oder klicken zum Auswählen</span>
        </p>
        <p className="mt-2 text-[11px] text-zinc-500">
          JPEG, PNG, WebP, GIF, AVIF · mehrere Dateien möglich
        </p>
        {pending ? (
          <p className="mt-3 text-[11px] font-medium tracking-wide text-amber-200/85">
            Upload läuft …
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
        Speicherort: Bucket <code className="text-zinc-500">project-images</code>, Pfad{" "}
        <code className="text-zinc-500">projects/{`{id}`}/original/</code>
      </p>
    </div>
  );
}
