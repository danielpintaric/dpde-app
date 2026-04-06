"use client";

import { useActionState } from "react";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/actions/admin-project-actions";
import type { Project } from "@/types/project";

type Props = {
  mode: "create" | "edit";
  action: typeof createProjectAction | typeof updateProjectAction;
  project?: Project;
  /** Schmale linke Spalte im Edit-Split (kein max-w-xl, engere Abstände, einspaltige Felder). */
  compact?: boolean;
};

const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500";
const fieldClass =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none";

export function ProjectForm({ mode, action, project, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className={compact ? "space-y-4" : "mx-auto max-w-xl space-y-5"}
    >
      {mode === "edit" && project ? (
        <input type="hidden" name="id" value={project.id} />
      ) : null}

      {state?.error ? (
        <p className="rounded border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className={fieldClass}
          defaultValue={project?.title ?? ""}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          className={fieldClass}
          defaultValue={project?.slug ?? ""}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Lowercase letters, numbers, hyphens"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className={labelClass}>
          Subtitle
        </label>
        <input
          id="subtitle"
          name="subtitle"
          className={fieldClass}
          defaultValue={project?.subtitle ?? ""}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={compact ? 4 : 5}
          className={fieldClass}
          defaultValue={project?.description ?? ""}
        />
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor="visibility" className={labelClass}>
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            className={fieldClass}
            defaultValue={project?.visibility ?? "public"}
          >
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
            <option value="private">private</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className={labelClass}>
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            required
            className={fieldClass}
            defaultValue={project?.sortOrder ?? 0}
          />
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <input
            id="category"
            name="category"
            className={fieldClass}
            defaultValue={project?.category ?? ""}
          />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <input id="year" name="year" className={fieldClass} defaultValue={project?.year ?? ""} />
        </div>
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          Location
        </label>
        <input
          id="location"
          name="location"
          className={fieldClass}
          defaultValue={project?.location ?? ""}
        />
      </div>

      <div>
        <label htmlFor="layoutType" className={labelClass}>
          Layout type
        </label>
        <select
          id="layoutType"
          name="layoutType"
          className={fieldClass}
          defaultValue={project?.layoutType ?? "mixed"}
        >
          <option value="cinematic">cinematic</option>
          <option value="grid">grid</option>
          <option value="mixed">mixed</option>
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
