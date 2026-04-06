"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AdminSelect } from "@/components/admin/admin-select";
import { editorSaveButtonFullWidthClass } from "@/components/admin/editor-save-button-styles";
import { useProjectEditorSession } from "@/components/admin/project-editor-session-context";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/actions/admin-project-actions";
import { slugify } from "@/lib/utils/slugify";
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

/** Kompakt: an Inspector-Panel (`ProjectImageDetailsForm` compact) angeglichen */
const labelCompact =
  "mb-0.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600";
const fieldCompact =
  "w-full rounded border border-zinc-700/85 bg-zinc-900/75 px-2 py-1 text-[11px] leading-snug text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500/80 focus:outline-none";
const sectionLabel = "mb-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600";
const pairGridCompact = "grid grid-cols-2 gap-x-2 gap-y-2";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private", label: "Private" },
] as const;

const LAYOUT_OPTIONS = [
  { value: "cinematic", label: "Cinematic" },
  { value: "grid", label: "Grid" },
  { value: "mixed", label: "Mixed" },
] as const;

/** Gleiche Regel wie `pattern` am Slug-Input (HTML5 matcht die volle Zeichenkette). */
const ADMIN_PROJECT_SLUG_HTML_PATTERN = "[a-z0-9]+(?:-[a-z0-9]+)*";
const ADMIN_PROJECT_SLUG_VALID_RE = new RegExp(`^${ADMIN_PROJECT_SLUG_HTML_PATTERN}$`);

function slugFieldInlineStatus(value: string): "neutral" | "good" | "invalid" {
  if (value.length === 0) {
    return "neutral";
  }
  return ADMIN_PROJECT_SLUG_VALID_RE.test(value) ? "good" : "invalid";
}

type CompactProjectSnapshot = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  visibility: string;
  sortOrder: string;
  category: string;
  year: string;
  location: string;
  layoutType: string;
};

function snapshotFromProject(p: Project): CompactProjectSnapshot {
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    subtitle: p.subtitle ?? "",
    description: p.description ?? "",
    visibility: p.visibility ?? "public",
    sortOrder: String(p.sortOrder ?? 0),
    category: p.category ?? "",
    year: p.year ?? "",
    location: p.location ?? "",
    layoutType: p.layoutType ?? "mixed",
  };
}

function readCompactProjectForm(form: HTMLFormElement): CompactProjectSnapshot {
  const fd = new FormData(form);
  return {
    title: String(fd.get("title") ?? ""),
    slug: String(fd.get("slug") ?? ""),
    subtitle: String(fd.get("subtitle") ?? ""),
    description: String(fd.get("description") ?? ""),
    visibility: String(fd.get("visibility") ?? "public"),
    sortOrder: String(fd.get("sortOrder") ?? "0"),
    category: String(fd.get("category") ?? ""),
    year: String(fd.get("year") ?? ""),
    location: String(fd.get("location") ?? ""),
    layoutType: String(fd.get("layoutType") ?? "mixed"),
  };
}

function equalCompactSnapshot(a: CompactProjectSnapshot, b: CompactProjectSnapshot): boolean {
  return (
    a.title === b.title &&
    a.slug === b.slug &&
    a.subtitle === b.subtitle &&
    a.description === b.description &&
    a.visibility === b.visibility &&
    a.sortOrder === b.sortOrder &&
    a.category === b.category &&
    a.year === b.year &&
    a.location === b.location &&
    a.layoutType === b.layoutType
  );
}

function SlugInlineHint({
  id,
  status,
  compact,
}: {
  id: string;
  status: "neutral" | "good" | "invalid";
  compact: boolean;
}) {
  if (status === "neutral") {
    return null;
  }
  const text =
    status === "good"
      ? "Looks good"
      : "Use lowercase letters, numbers, and hyphens";
  const sizeClass = compact ? "mt-1 text-[9px] leading-snug" : "mt-1 text-[11px] leading-snug";
  const toneClass = status === "good" ? "text-zinc-500" : "text-zinc-400";
  return (
    <p id={id} className={`${sizeClass} ${toneClass}`} role="status" aria-live="polite">
      {text}
    </p>
  );
}

function IconCopyOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ProjectForm({ mode, action, project, compact = false }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const session = useProjectEditorSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(() => project?.title ?? "");
  const [slug, setSlug] = useState(() => project?.slug ?? "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [portfolioUrlCopied, setPortfolioUrlCopied] = useState(false);
  const copyPortfolioUrlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackProjectDirty =
    Boolean(session && compact && mode === "edit" && project);

  const syncProjectDirty = () => {
    if (!session || !trackProjectDirty || !project) {
      return;
    }
    const form = formRef.current;
    if (!form) {
      return;
    }
    session.setProjectDirty(
      !equalCompactSnapshot(readCompactProjectForm(form), snapshotFromProject(project)),
    );
  };

  useEffect(() => {
    if (!session) {
      return;
    }
    session.setProjectSaving(pending);
  }, [pending, session]);

  useEffect(() => {
    if (!trackProjectDirty || !project) {
      session?.setProjectDirty(false);
      return;
    }
    if (!session) {
      return;
    }
    const sess = session;
    const proj = project;
    const id = requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) {
        sess.setProjectDirty(false);
        return;
      }
      sess.setProjectDirty(
        !equalCompactSnapshot(readCompactProjectForm(form), snapshotFromProject(proj)),
      );
    });
    return () => cancelAnimationFrame(id);
  }, [trackProjectDirty, project, session]);

  useEffect(() => {
    if (mode === "create" && !project) {
      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      return;
    }
    if (mode === "edit" && project) {
      setTitle(project.title ?? "");
      setSlug(project.slug ?? "");
      setIsSlugManuallyEdited(false);
    }
  }, [mode, project?.id]);

  const scheduleCompactDirtySync = () => {
    if (!trackProjectDirty) {
      return;
    }
    requestAnimationFrame(() => syncProjectDirty());
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitle(v);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(v));
    }
    scheduleCompactDirtySync();
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value);
    scheduleCompactDirtySync();
  };

  useEffect(() => {
    return () => {
      if (copyPortfolioUrlTimeoutRef.current != null) {
        clearTimeout(copyPortfolioUrlTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyPortfolioUrl = () => {
    const s = slug.trim();
    if (!s) {
      return;
    }
    const url = `${window.location.origin}/portfolio/${s}`;
    void navigator.clipboard.writeText(url).then(() => {
      setPortfolioUrlCopied(true);
      if (copyPortfolioUrlTimeoutRef.current != null) {
        clearTimeout(copyPortfolioUrlTimeoutRef.current);
      }
      copyPortfolioUrlTimeoutRef.current = setTimeout(() => {
        setPortfolioUrlCopied(false);
        copyPortfolioUrlTimeoutRef.current = null;
      }, 1500);
    });
  };

  const lb = compact ? labelCompact : labelClass;
  const fd = compact ? fieldCompact : fieldClass;
  const pairGrid = compact ? pairGridCompact : "grid gap-4 sm:grid-cols-2";

  const slugHintStatus = slugFieldInlineStatus(slug);
  const slugHintId = "project-form-slug-hint";
  const slugAriaDescribedBy = slugHintStatus === "neutral" ? undefined : slugHintId;

  return (
    <form
      ref={formRef}
      action={formAction}
      data-editor-save="project"
      className={compact ? "space-y-0" : "mx-auto max-w-xl space-y-5"}
      onInput={trackProjectDirty ? syncProjectDirty : undefined}
      onChange={trackProjectDirty ? syncProjectDirty : undefined}
    >
      {mode === "edit" && project ? (
        <input type="hidden" name="id" value={project.id} />
      ) : null}

      {state?.error ? (
        <p
          className={
            compact
              ? "mb-3 rounded border border-red-900/60 bg-red-950/40 px-2.5 py-1.5 text-xs text-red-200"
              : "rounded border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          }
        >
          {state.error}
        </p>
      ) : null}

      {compact ? (
        <>
          <div className="space-y-2">
            <p className={sectionLabel}>Identity</p>
            <div>
              <label htmlFor="title" className={lb}>
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className={fd}
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div>
              <label htmlFor="slug" className={lb}>
                Slug
              </label>
              <div className="relative">
                <input
                  id="slug"
                  name="slug"
                  required
                  className={`${fd} pr-8`}
                  value={slug}
                  onChange={handleSlugChange}
                  pattern={ADMIN_PROJECT_SLUG_HTML_PATTERN}
                  title="Lowercase letters, numbers, hyphens"
                  aria-invalid={slugHintStatus === "invalid"}
                  aria-describedby={slugAriaDescribedBy}
                />
                <button
                  type="button"
                  onClick={handleCopyPortfolioUrl}
                  aria-label={portfolioUrlCopied ? "Copied" : "Copy project URL"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-zinc-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/70"
                >
                  <span className="sr-only">Copy URL</span>
                  {portfolioUrlCopied ? <IconCheck /> : <IconCopyOutline />}
                </button>
              </div>
              <SlugInlineHint id={slugHintId} status={slugHintStatus} compact />
            </div>
            <div>
              <label htmlFor="subtitle" className={lb}>
                Subtitle
              </label>
              <input id="subtitle" name="subtitle" className={fd} defaultValue={project?.subtitle ?? ""} />
            </div>
          </div>

          <div className="mt-3 border-t border-zinc-800/40 pt-3">
            <p className={sectionLabel}>Description</p>
            <div>
              <label htmlFor="description" className={lb}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className={`${fd} resize-y min-h-[4.5rem]`}
                defaultValue={project?.description ?? ""}
              />
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t border-zinc-800/40 pt-3">
            <p className={sectionLabel}>Details</p>
            <div className={pairGridCompact}>
              <div className="min-w-0">
                <label htmlFor="visibility" className={lb}>
                  Visibility
                </label>
                <AdminSelect
                  id="visibility"
                  name="visibility"
                  dense
                  disabled={pending}
                  defaultValue={project?.visibility ?? "public"}
                  options={[...VISIBILITY_OPTIONS]}
                />
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
                  className={`${fd} tabular-nums`}
                  defaultValue={project?.sortOrder ?? 0}
                />
              </div>
            </div>
            <div className={pairGridCompact}>
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
            <div className={pairGridCompact}>
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
                <AdminSelect
                  id="layoutType"
                  name="layoutType"
                  dense
                  disabled={pending}
                  defaultValue={project?.layoutType ?? "mixed"}
                  options={[...LAYOUT_OPTIONS]}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-zinc-800/40 pt-3">
            <p className={sectionLabel}>Save</p>
            <div className="rounded-md border border-zinc-800/50 bg-zinc-900/35 px-2 py-2 shadow-sm shadow-black/10">
              <button type="submit" disabled={pending} className={editorSaveButtonFullWidthClass}>
                {pending ? "Saving…" : mode === "create" ? "New project" : "Save changes"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="title" className={lb}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className={fd}
              value={title}
              onChange={handleTitleChange}
            />
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
              value={slug}
              onChange={handleSlugChange}
              pattern={ADMIN_PROJECT_SLUG_HTML_PATTERN}
              title="Lowercase letters, numbers, hyphens"
              aria-invalid={slugHintStatus === "invalid"}
              aria-describedby={slugAriaDescribedBy}
            />
            <SlugInlineHint id={slugHintId} status={slugHintStatus} compact={false} />
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
              rows={5}
              className={fd}
              defaultValue={project?.description ?? ""}
            />
          </div>

          <div className={pairGrid}>
            <div>
              <label htmlFor="visibility" className={lb}>
                Visibility
              </label>
              <AdminSelect
                id="visibility"
                name="visibility"
                disabled={pending}
                defaultValue={project?.visibility ?? "public"}
                options={[...VISIBILITY_OPTIONS]}
              />
            </div>
            <div>
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
            <div>
              <label htmlFor="category" className={lb}>
                Category
              </label>
              <input id="category" name="category" className={fd} defaultValue={project?.category ?? ""} />
            </div>
            <div>
              <label htmlFor="year" className={lb}>
                Year
              </label>
              <input id="year" name="year" className={fd} defaultValue={project?.year ?? ""} />
            </div>
          </div>

          <div>
            <label htmlFor="location" className={lb}>
              Location
            </label>
            <input id="location" name="location" className={fd} defaultValue={project?.location ?? ""} />
          </div>

          <div>
            <label htmlFor="layoutType" className={lb}>
              Layout type
            </label>
            <AdminSelect
              id="layoutType"
              name="layoutType"
              disabled={pending}
              defaultValue={project?.layoutType ?? "mixed"}
              options={[...LAYOUT_OPTIONS]}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="cursor-pointer rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
            >
              {pending ? "Saving…" : mode === "create" ? "New project" : "Save changes"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
