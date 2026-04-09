import type { Metadata } from "next";
import Link from "next/link";
import { GalleryHoverLoupe } from "@/components/gallery/gallery-hover-loupe";
import { PageMain } from "@/components/site-chrome";
import {
  focusRing,
  galleryGridImage,
  linkFocusVisible,
  pageContentShell,
  portfolioIndexThumbAspect,
  portfolioIndexThumbMediaOverlay,
  portfolioIndexThumbShell,
  stackTitleToBody,
  tapSoft,
  transitionColorsQuick,
  transitionQuick,
  typeBodyMuted,
  typeH1Page,
  typeH2Section,
  typeMeta,
} from "@/lib/editorial";
/** Data: {@link loadWorkPortfolioProjects} → public Supabase (no session cookies). */
import { coverProjectImage, resolveProjectImageObjectPosition } from "@/lib/image-object-position";
import { loadWorkPortfolioProjects } from "@/lib/services/portfolio-view-data";

export const metadata: Metadata = {
  title: "Work — Daniel Pintarić",
  description:
    "Portrait, editorial, and personal series — Daniel Pintarić, Berlin. Commissions and private work in one archive.",
};

const CATEGORIES = ["Editorial", "Portrait", "Architecture", "Personal"] as const;

export default async function PortfolioPage() {
  const projects = await loadWorkPortfolioProjects();

  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <h1 className={typeH1Page}>Work</h1>
          <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>
            Commissions and personal series, sorted by impulse. Categories are for orientation only — the
            pictures carry the argument, not the labels.
          </p>

          <div
            className="mt-14 flex flex-wrap gap-x-3 gap-y-2 border-b border-zinc-800/40 pb-12"
            role="group"
            aria-label="Categories (filter coming soon)"
          >
            {CATEGORIES.map((label) => (
              <button
                key={label}
                type="button"
                className={`cursor-pointer rounded-sm px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500 ${transitionQuick} hover:text-zinc-400 ${tapSoft} ${linkFocusVisible}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-6xl lg:mt-20">
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800/55 bg-zinc-900/35 px-8 py-16 text-center sm:py-20">
                <p className="font-serif text-base tracking-tight text-zinc-300">No images yet</p>
                <p className="mt-3 mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">
                  Upload images to get started — projects will appear here once they are published.
                </p>
              </div>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-12 p-0 m-0 sm:grid-cols-2 sm:gap-y-14 lg:gap-x-8 lg:gap-y-16">
                {projects.map((project) => {
                  const cover = coverProjectImage(project);
                  const thumbPos = cover
                    ? resolveProjectImageObjectPosition(cover)
                    : "50% 50%";
                  return (
                  <li key={project.slug}>
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className={`group block cursor-pointer ${focusRing} ${tapSoft}`}
                    >
                      <div className={portfolioIndexThumbShell}>
                        <div className={portfolioIndexThumbAspect}>
                          <img
                            src={project.coverImage}
                            alt=""
                            className={`absolute inset-0 h-full w-full ${galleryGridImage}`}
                            style={{ objectPosition: thumbPos }}
                            sizes="(min-width: 1024px) 30vw, 50vw"
                            loading="lazy"
                          />
                          <div className={portfolioIndexThumbMediaOverlay} aria-hidden />
                          <GalleryHoverLoupe />
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-1 sm:mt-6 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2
                          className={`${typeH2Section} text-xl ${transitionColorsQuick} sm:text-2xl group-hover:text-zinc-100/88`}
                        >
                          {project.title}
                        </h2>
                        <p className={typeMeta}>
                          {project.category}
                          <span className="mx-2 text-zinc-700">·</span>
                          {project.year}
                        </p>
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageMain>
  );
}
