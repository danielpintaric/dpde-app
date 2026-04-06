"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSiteHomeAction, type SiteHomeSaveState } from "@/lib/actions/admin-site-home-actions";
import { editorSaveButtonFullWidthClass } from "@/components/admin/editor-save-button-styles";
import { SiteHeroImageSlots } from "@/components/admin/site-hero-image-slots";
import {
  LANDING_HERO_INTERVAL_MAX_SECONDS,
  LANDING_HERO_INTERVAL_MIN_SECONDS,
} from "@/lib/hero-site-interval";
import type { SiteHomeFormValues } from "@/types/site-landing";
import type { Project } from "@/types/project";

const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500";
const fieldClass =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none";
const sectionTitle =
  "mb-1 border-b border-zinc-800/80 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500";
const sectionIntro = "mb-4 text-[12px] leading-relaxed text-zinc-500";
const panelClass =
  "rounded-xl border border-zinc-800/50 bg-zinc-950/35 p-5 shadow-sm shadow-black/10 sm:p-6";

type ProjectOption = Pick<Project, "id" | "title" | "slug">;

function SiteHomeHeroSection({ initial }: { initial: SiteHomeFormValues }) {
  return (
    <section className={panelClass} aria-labelledby="site-home-hero-heading">
      <h2 id="site-home-hero-heading" className={sectionTitle}>
        Hero
      </h2>
      <p className={sectionIntro}>
        Hero copy and images for the public homepage. Empty title or subtitle falls back to site
        defaults. Leave all image slots empty to use the default hero image after save.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="hero_title" className={labelClass}>
            Hero title
          </label>
          <input
            id="hero_title"
            name="hero_title"
            className={fieldClass}
            defaultValue={initial.heroTitle}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="hero_subtitle" className={labelClass}>
            Hero subtitle
          </label>
          <textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={4}
            className={`${fieldClass} resize-y`}
            defaultValue={initial.heroSubtitle}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className={labelClass}>Hero images</span>
          <p className="text-[11px] leading-relaxed text-zinc-600">
            Up to three images (first = initial slide). Uploaded files go to{" "}
            <span className="font-mono text-zinc-500">site/hero/slot-*</span> in the project storage
            bucket — isolated from portfolio project folders. Empty slots are ignored when saving.
          </p>
          <SiteHeroImageSlots
            key={`${initial.heroImage1}\u0001${initial.heroImage2}\u0001${initial.heroImage3}`}
            initial1={initial.heroImage1}
            initial2={initial.heroImage2}
            initial3={initial.heroImage3}
          />
        </div>

        <div>
          <label htmlFor="hero_interval_seconds" className={labelClass}>
            Hero interval
          </label>
          <input
            id="hero_interval_seconds"
            name="hero_interval_seconds"
            type="number"
            min={LANDING_HERO_INTERVAL_MIN_SECONDS}
            max={LANDING_HERO_INTERVAL_MAX_SECONDS}
            step={1}
            className={fieldClass}
            defaultValue={initial.heroIntervalSeconds}
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
            Time between hero image transitions in seconds.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hero_link_1_label" className={labelClass}>
              Link 1 label
            </label>
            <input
              id="hero_link_1_label"
              name="hero_link_1_label"
              className={fieldClass}
              defaultValue={initial.heroLink1Label}
            />
          </div>
          <div>
            <label htmlFor="hero_link_1_href" className={labelClass}>
              Link 1 href
            </label>
            <input
              id="hero_link_1_href"
              name="hero_link_1_href"
              className={fieldClass}
              defaultValue={initial.heroLink1Href}
            />
          </div>
          <div>
            <label htmlFor="hero_link_2_label" className={labelClass}>
              Link 2 label
            </label>
            <input
              id="hero_link_2_label"
              name="hero_link_2_label"
              className={fieldClass}
              defaultValue={initial.heroLink2Label}
            />
          </div>
          <div>
            <label htmlFor="hero_link_2_href" className={labelClass}>
              Link 2 href
            </label>
            <input
              id="hero_link_2_href"
              name="hero_link_2_href"
              className={fieldClass}
              defaultValue={initial.heroLink2Href}
            />
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-600">
          For each link, set both label and href — or leave both empty to use the default pair on the
          public site.
        </p>
      </div>
    </section>
  );
}

function SiteHomeFeaturedSection({
  initial,
  projects,
}: {
  initial: SiteHomeFormValues;
  projects: ProjectOption[];
}) {
  const sorted = projects.slice().sort((a, b) => a.title.localeCompare(b.title));

  const [featuredProjectId1, setFeaturedProjectId1] = useState(initial.featuredProjectId1);
  const [featuredProjectId2, setFeaturedProjectId2] = useState(initial.featuredProjectId2);
  const [featuredProjectId3, setFeaturedProjectId3] = useState(initial.featuredProjectId3);

  useEffect(() => {
    setFeaturedProjectId1(initial.featuredProjectId1);
    setFeaturedProjectId2(initial.featuredProjectId2);
    setFeaturedProjectId3(initial.featuredProjectId3);
  }, [initial.featuredProjectId1, initial.featuredProjectId2, initial.featuredProjectId3]);

  const slots = [
    {
      id: "featured_project_id_1" as const,
      label: "Featured project 1",
      value: featuredProjectId1,
      onChange: setFeaturedProjectId1,
    },
    {
      id: "featured_project_id_2" as const,
      label: "Featured project 2",
      value: featuredProjectId2,
      onChange: setFeaturedProjectId2,
    },
    {
      id: "featured_project_id_3" as const,
      label: "Featured project 3",
      value: featuredProjectId3,
      onChange: setFeaturedProjectId3,
    },
  ];

  return (
    <section className={panelClass} aria-labelledby="site-home-featured-heading">
      <h2 id="site-home-featured-heading" className={sectionTitle}>
        Featured projects
      </h2>
      <p className={sectionIntro}>
        Three slots define order for &ldquo;Selected work&rdquo; on the landing page. Empty slots are
        skipped. Applies when the portfolio is served from Supabase and{" "}
        <span className="font-mono text-zinc-400">PORTFOLIO_DATA</span> is not{" "}
        <span className="font-mono text-zinc-400">static</span>.
      </p>

      <div className="flex flex-col gap-4">
        {slots.map(({ id, label, value, onChange }) => (
          <div key={id}>
            <label htmlFor={id} className={labelClass}>
              {label}
            </label>
            <select
              id={id}
              name={id}
              className={fieldClass}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={sorted.length === 0}
            >
              <option value="">— None —</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  initial: SiteHomeFormValues;
  projects: ProjectOption[];
};

export function SiteHomeForm({ initial, projects }: Props) {
  const [state, formAction, pending] = useActionState(
    saveSiteHomeAction,
    null as SiteHomeSaveState,
  );

  return (
    <form action={formAction} className="mx-auto flex max-w-3xl flex-col gap-10">
      {state?.error ? (
        <p
          className="rounded-lg border border-red-900/50 bg-red-950/25 px-3 py-2 text-sm text-red-200/95"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-200/90">
          Saved.
        </p>
      ) : null}

      <SiteHomeHeroSection initial={initial} />
      <SiteHomeFeaturedSection initial={initial} projects={projects} />

      <div>
        <button type="submit" className={editorSaveButtonFullWidthClass} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
