import Image from "next/image";
import Link from "next/link";
import { EditorialGallery } from "@/components/gallery/editorial-gallery";
import { PageMain } from "@/components/site-chrome";
import {
  editorialImageOverlay,
  editorialImageTone,
  focusRing,
  linkFocusVisible,
  stackMetaToTitle,
  stackTitleToBody,
  tapSoft,
  transitionColorsQuick,
  transitionQuick,
  typeBodyMuted,
  typeH1Page,
  typeMeta,
} from "@/lib/editorial";
import { getPortfolioBodyImages, type PortfolioProject } from "@/lib/portfolio-data";

export type PortfolioProjectViewProps = {
  project: PortfolioProject;
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
  /** Prefix for project detail routes, e.g. `/portfolio` or `/client`. */
  basePath: string;
  indexHref: string;
  indexLabel: string;
};

export function PortfolioProjectView({
  project,
  prev,
  next,
  basePath,
  indexHref,
  indexLabel,
}: PortfolioProjectViewProps) {
  return (
    <PageMain>
      <article className="pb-24 pt-28 sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-28">
        <header className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <p className={typeMeta}>{project.category}</p>
          <h1 className={`${stackMetaToTitle} ${typeH1Page}`}>{project.title}</h1>
          <p className={`${stackTitleToBody} max-w-lg sm:max-w-xl ${typeBodyMuted}`}>{project.intro}</p>
          <p className={`${stackTitleToBody} ${typeMeta}`}>
            {project.year}
            <span className="mx-3.5 text-zinc-700">·</span>
            {project.location}
          </p>
        </header>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-14 w-screen max-w-[100vw] sm:mt-16 lg:mt-20">
          <div className="relative aspect-[16/10] max-h-[min(68vh,720px)] w-full overflow-hidden bg-zinc-900 sm:aspect-[2/1]">
            <Image
              src={project.coverImage}
              alt=""
              fill
              className={`${editorialImageTone}`}
              sizes="100vw"
              priority
            />
            <div className={editorialImageOverlay} aria-hidden />
          </div>
        </div>

        <EditorialGallery images={getPortfolioBodyImages(project)} />

        <footer className="mt-20 border-t border-zinc-800/40 sm:mt-24 lg:mt-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            {next ? (
              <Link
                href={`${basePath}/${next.slug}`}
                className={`group block cursor-pointer py-16 ${transitionQuick} sm:py-20 lg:py-24 ${focusRing} rounded-sm ${tapSoft}`}
              >
                <span className={`${typeMeta} ${transitionColorsQuick} group-hover:text-zinc-400`}>
                  Next project
                </span>
                <span className={`mt-5 block max-w-2xl font-serif text-[clamp(1.65rem,3.5vw,2.35rem)] font-normal leading-[1.12] tracking-[-0.03em] text-zinc-300/95 ${transitionColorsQuick} group-hover:text-zinc-100/92`}>
                  {next.title}
                </span>
              </Link>
            ) : null}

            <div className="flex flex-col gap-10 border-t border-zinc-800/40 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
              <Link
                href={indexHref}
                className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
              >
                {indexLabel}
              </Link>
              {prev ? (
                <Link
                  href={`${basePath}/${prev.slug}`}
                  className={`text-left text-[11px] tracking-[0.04em] text-zinc-500 underline decoration-transparent underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/45 sm:text-right ${linkFocusVisible} ${tapSoft}`}
                >
                  <span className="mr-2.5 text-zinc-600">Previous</span>
                  <span className="font-serif text-[0.9375rem] font-normal tracking-[-0.02em] text-zinc-400">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" aria-hidden />
              )}
            </div>
          </div>
        </footer>
      </article>
    </PageMain>
  );
}
