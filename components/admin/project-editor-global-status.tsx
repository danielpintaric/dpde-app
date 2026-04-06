"use client";

import { useEffect, useRef, useState } from "react";
import { useProjectEditorSession } from "@/components/admin/project-editor-session-context";

type StatusBucket = "saving" | "dirty" | "clean";

function SavedStatusCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ProjectEditorGlobalStatus() {
  const ctx = useProjectEditorSession();
  if (!ctx) return null;

  const { projectDirty, imageDetailsDirty, projectSaving, imageDetailsSaving } = ctx;
  const saving = projectSaving || imageDetailsSaving;
  const dirty = projectDirty || imageDetailsDirty;

  const prevBucketRef = useRef<StatusBucket | null>(null);
  const [savedEnterKey, setSavedEnterKey] = useState(0);

  useEffect(() => {
    const bucket: StatusBucket = saving ? "saving" : dirty ? "dirty" : "clean";
    const prev = prevBucketRef.current;
    prevBucketRef.current = bucket;
    if (prev === null) {
      return;
    }
    if (bucket === "clean" && (prev === "saving" || prev === "dirty")) {
      setSavedEnterKey((k) => k + 1);
    }
  }, [saving, dirty]);

  if (saving) {
    return (
      <div
        className="mb-2 flex min-h-[1.375rem] items-center border-b border-zinc-800/50 pb-2"
        role="status"
        aria-live="polite"
      >
        <span className="text-[10px] font-medium tracking-wide text-zinc-400">Saving…</span>
      </div>
    );
  }

  if (dirty) {
    return (
      <div
        className="mb-2 flex min-h-[1.375rem] flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800/50 pb-2"
        role="status"
        aria-live="polite"
      >
        <span className="rounded border border-zinc-600/40 bg-zinc-900/55 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-300/90">
          Unsaved changes
        </span>
        <span className="text-[10px] text-zinc-600">
          {[projectDirty && "Project", imageDetailsDirty && "Image details"].filter(Boolean).join(" · ")}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-2 flex min-h-[1.375rem] items-center border-b border-transparent pb-2" aria-hidden="true">
      <div
        key={savedEnterKey}
        className={`flex items-center gap-1.5 ${savedEnterKey > 0 ? "editor-saved-enter" : ""}`}
      >
        <SavedStatusCheckIcon className="shrink-0 text-zinc-500/90" />
        <span className="text-[10px] tracking-wide text-zinc-600">All saved</span>
      </div>
    </div>
  );
}
