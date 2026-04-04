import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CinematicFlow } from "@/components/gallery/cinematic-flow";
import { GridGallery } from "@/components/gallery/grid-gallery";
import { MixedGallery } from "@/components/gallery/mixed-gallery";
import { PageMain } from "@/components/site-chrome";
import {
  editorialImageOverlay,
  editorialImageTone,
  stackMetaToTitle,
  stackTitleToBody,
  typeBodyMuted,
  typeH1Page,
  typeMeta,
} from "@/lib/editorial";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getPortfolioProjects,
  type PortfolioProject,
} from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPortfolioProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project" };
  }
  return {
    title: project.title,
    description: project.intro,
  };
}

function ProjectGallery({ project }: { project: PortfolioProject }) {
  switch (project.layoutType) {
    case "cinematic":
      return <CinematicFlow images={project.images} />;
    case "grid":
      return <GridGallery images={project.images} />;
    case "mixed":
      return <MixedGallery images={project.images} />;
    default:
      return <CinematicFlow images={project.images} />;
  }
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(slug);

  return (
    <PageMain>
      <article className="pb-20 pt-28 sm:pb-28 sm:pt-28 lg:pb-28 lg:pt-28">
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

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-12 w-screen max-w-[100vw] sm:mt-16 lg:mt-20">
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

        <div className="mt-16 sm:mt-20 lg:mt-24">
          <ProjectGallery project={project} />
        </div>

        <footer className="mt-24 border-t border-zinc-800/50 sm:mt-28 lg:mt-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            {next ? (
              <Link
                href={`/portfolio/${next.slug}`}
                className="group block py-14 transition duration-300 ease-out sm:py-16 lg:py-20"
              >
                <span className={`${typeMeta} transition group-hover:text-zinc-400`}>Next project</span>
                <span className="mt-5 block max-w-2xl font-serif text-[clamp(1.65rem,3.5vw,2.35rem)] font-normal leading-[1.12] tracking-[-0.03em] text-zinc-300 transition duration-300 ease-out group-hover:text-zinc-100">
                  {next.title}
                </span>
              </Link>
            ) : null}

            <div className="flex flex-col gap-10 border-t border-zinc-800/50 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12">
              <Link
                href="/portfolio"
                className="text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/50"
              >
                All work
              </Link>
              {prev ? (
                <Link
                  href={`/portfolio/${prev.slug}`}
                  className="text-left text-[11px] tracking-[0.04em] text-zinc-500 underline decoration-transparent underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/40 sm:text-right"
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
