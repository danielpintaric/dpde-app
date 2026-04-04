import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/site-chrome";
import {
  editorialImage,
  editorialImageOverlay,
  focusRing,
  linkFocusVisible,
  pageContentShell,
  stackTitleToBody,
  tapSoft,
  transitionColorsQuick,
  transitionQuick,
  typeBodyMuted,
  typeH1Page,
  typeH2Section,
  typeMeta,
} from "@/lib/editorial";
import { getPortfolioProjects } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Work — Daniel Pintarić",
  description:
    "Portrait, editorial, and personal series — Daniel Pintarić, Berlin. Commissions and private work in one archive.",
};

const CATEGORIES = ["Editorial", "Portrait", "Architecture", "Personal"] as const;

export default function PortfolioPage() {
  const projects = getPortfolioProjects();

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

          <ul className="mt-14 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:gap-x-12 lg:gap-y-20">
            {projects.map((project, i) => (
              <li key={project.slug} className={i % 2 === 1 ? "sm:mt-6 lg:mt-10" : ""}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className={`group block cursor-pointer ${focusRing}`}
                >
                  <div className="relative overflow-hidden bg-zinc-900">
                    <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                      <img
                        src={project.coverImage}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${editorialImage}`}
                        sizes="(min-width: 1024px) 40vw, 50vw"
                        loading="lazy"
                      />
                      <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
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
            ))}
          </ul>
        </div>
      </div>
    </PageMain>
  );
}
