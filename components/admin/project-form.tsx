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
const labelClassCompact =
  "mb-0.5 block text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-500";
const fieldClass =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none";
const fieldClassCompact =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[13px] leading-snug text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none";

export function ProjectForm({ mode, action, project, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  const lb = compact ? labelClassCompact : labelClass;
  const fd = compact ? fieldClassCompact : fieldClass;
  const pairGrid = compact ? "grid grid-cols-2 gap-x-3 gap-y-2" : "grid gap-4 sm:grid-cols-2";

  return (
    <form
      action={formAction}
      className={compact ? "space-y-2.5" : "mx-auto max-w-xl space-y-5"}
    >
      {mode === "edit" && project ? (
        <input type="hidden" name="id" value={project.id} />
      ) : null}

      {state?.error ? (
        <p
          className={
            compact
              ? "rounded border border-red-900/60 bg-red-950/40 px-2.5 py-1.5 text-xs text-red-200"
              : "rounded border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          }
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className={lb}>
          Title
        </label>
        <input id="title" name="title" required className={fd} defaultValue={project?.title ?? ""} />
      </div>

      <div>
        <label htmlFor="slug" className={lb}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          className={fd}
          defaultValue={project?.slug ?? ""}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Lowercase letters, numbers, hyphens"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className={lb}>
          Subtitle
        </label>
        <input id="subtitle" name="subtitle" className={fd} defaultValue={project?.subtitle ?? ""} />
      </div>

      <div>
        <label htmlFor="description" className={lb}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={compact ? 3 : 5}
          className={fd}
          defaultValue={project?.description ?? ""}
        />
      </div>

      <div className={pairGrid}>
        <div className="min-w-0">
          <label htmlFor="visibility" className={lb}>
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            className={fd}
            defaultValue={project?.visibility ?? "public"}
          >
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
            <option value="private">private</option>
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="sortOrder" className={lb}>
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            required
            className={fd}
            defaultValue={project?.sortOrder ?? 0}
          />
        </div>
      </div>

      <div className={pairGrid}>
        <div className="min-w-0">
          <label htmlFor="category" className={lb}>
            Category
          </label>
          <input id="category" name="category" className={fd} defaultValue={project?.category ?? ""} />
        </div>
        <div className="min-w-0">
          <label htmlFor="year" className={lb}>
            Year
          </label>
          <input id="year" name="year" className={fd} defaultValue={project?.year ?? ""} />
        </div>
      </div>

      <div className={pairGrid}>
        <div className="min-w-0">
          <label htmlFor="location" className={lb}>
            Location
          </label>
          <input id="location" name="location" className={fd} defaultValue={project?.location ?? ""} />
        </div>
        <div className="min-w-0">
          <label htmlFor="layoutType" className={lb}>
            Layout type
          </label>
          <select
            id="layoutType"
            name="layoutType"
            className={fd}
            defaultValue={project?.layoutType ?? "mixed"}
          >
            <option value="cinematic">cinematic</option>
            <option value="grid">grid</option>
            <option value="mixed">mixed</option>
          </select>
        </div>
      </div>

      <div className={compact ? "pt-0.5" : "pt-2"}>
        <button
          type="submit"
          disabled={pending}
          className={
            compact
              ? "cursor-pointer rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
              : "cursor-pointer rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
          }
        >
          {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
