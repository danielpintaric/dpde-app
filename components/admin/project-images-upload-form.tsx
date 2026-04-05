"use client";

import { useActionState } from "react";
import {
  type AdminImageUploadState,
  uploadProjectImagesAction,
} from "@/lib/actions/admin-image-actions";

type Props = {
  projectId: string;
  projectSlug: string;
};

export function ProjectImagesUploadForm({ projectId, projectSlug }: Props) {
  const [state, formAction, pending] = useActionState(
    uploadProjectImagesAction,
    null,
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="mb-10">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="projectSlug" value={projectSlug} />
      {state?.error ? (
        <p className="mb-3 rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor={`files-${projectId}`}
            className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500"
          >
            Upload images
          </label>
          <input
            id={`files-${projectId}`}
            name="files"
            type="file"
            accept="image/*"
            multiple
            required
            className="max-w-xs text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-xs file:text-zinc-200"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-600">
        Files go to bucket <code className="text-zinc-500">project-images</code> under{" "}
        <code className="text-zinc-500">projects/{`{id}`}/original/</code>.
      </p>
    </form>
  );
}
