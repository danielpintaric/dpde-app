import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ClientProjectStickyHeader } from "@/components/client/client-project-sticky-header";
import { ClientImageActions } from "@/components/gallery/client-image-actions";
import { PublicPortfolioGallery } from "@/components/gallery/public-portfolio-gallery";
import { PageMain } from "@/components/site-chrome";
import {
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
import {
  getLightboxImages,
  getPortfolioBodyImages,
  type PortfolioProject,
} from "@/lib/portfolio-data";
import { resolveProjectImageObjectPosition } from "@/lib/image-object-position";

const ClientSelectionGallery = dynamic(
  () =>
    import("@/components/gallery/client-selection-gallery").then((m) => m.ClientSelectionGallery),
  { ssr: true },
);

export type PortfolioProjectViewProps = {
  project: PortfolioProject;
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
  /** Prefix for project detail routes, e.g. `/portfolio` or `/client`. */
  basePath: string;
  indexHref: string;
  indexLabel: string;
  /** When set (e.g. client share), prev/next links append `?token=…`. */
  accessToken?: string | null;
  /** Enables per-image downloads in the client token flow. */
  clientDownload?: { token: string } | null;
  /** When true, image selection is available (wrap page with ClientSelectionProvider). */
  clientSelectionMode?: boolean;
};

function tokenQuerySuffix(accessToken: string | null | undefined): string {
  const t = accessToken?.trim();
  return t ? `?token=${encodeURIComponent(t)}` : "";
}

export function PortfolioProjectView({
  project,
  prev,
  next,
  basePath,
  indexHref,
  indexLabel,
  accessToken,
  clientDownload,
  clientSelectionMode = false,
}: PortfolioProjectViewProps) {
  const navSuffix = tokenQuerySuffix(accessToken);
  const galleryClientDownload =
    clientDownload?.token.trim() && project.slug
      ? { token: clientDownload.token.trim(), projectSlug: project.slug }
      : undefined;

  const coverAsset = project.coverImageId
    ? project.images.find((im) => im.imageId === project.coverImageId)
    : project.images[0];
  const coverObjectPosition = coverAsset
    ? resolveProjectImageObjectPosition(coverAsset)
    : "50% 50%";
  const showCoverDownload =
    galleryClientDownload &&
    coverAsset?.imageId &&
    coverAsset.storageBacked;
  const showCoverActions =
    galleryClientDownload &&
    coverAsset?.imageId &&
    (showCoverDownload || clientSelectionMode);

  return (
    <PageMain>
      <article
        className={
          clientSelectionMode
            ? "pb-16 pt-0 sm:pb-20 lg:pb-24"
            : "pb-12 pt-28 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-28"
        }
      >
        {clientSelectionMode ? <ClientProjectStickyHeader projectTitle={project.title} /> : null}

        {!clientSelectionMode ? (
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
        ) : null}

        <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-14 sm:px-10 lg:mt-16 lg:px-16">
          <div className="md:pl-4 lg:pl-7">
            <div
              className={`relative w-full overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 shadow-[0_22px_60px_-18px_rgba(0,0,0,0.55)] aspect-[16/9] max-h-[70vh]`}
            >
              <Image
                src={project.coverImage}
                alt=""
                fill
                className={`h-full w-full ${editorialImageTone}`}
                style={{ objectPosition: coverObjectPosition }}
                sizes="(max-width: 1280px) calc(100vw - 3rem), 1152px"
              />
            </div>
          </div>
        </div>

        {showCoverActions && galleryClientDownload && coverAsset ? (
          <div className="mx-auto mt-6 flex max-w-7xl justify-center px-6 sm:px-10 lg:px-16">
            <ClientImageActions
              image={coverAsset}
              clientDownload={galleryClientDownload}
              useClientSelection={clientSelectionMode}
              downloadLinkLabel="Download lead image"
              className="justify-center"
            />
          </div>
        ) : null}

        {clientSelectionMode ? (
          <ClientSelectionGallery
            images={getPortfolioBodyImages(project)}
            lightboxImages={getLightboxImages(project)}
            clientDownload={galleryClientDownload}
            galleryTitle={project.title}
          />
        ) : (
          <PublicPortfolioGallery
            images={getPortfolioBodyImages(project)}
            lightboxImages={getLightboxImages(project)}
            clientDownload={galleryClientDownload}
            galleryTitle={project.title}
          />
        )}

        <footer className="mt-14 border-t border-zinc-800/40 sm:mt-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            {next ? (
              <Link
                href={`${basePath}/${next.slug}${navSuffix}`}
                className={`group block cursor-pointer py-10 sm:py-12 lg:py-14 ${transitionQuick} ${focusRing} rounded-sm ${tapSoft}`}
              >
                <span className={`${typeMeta} ${transitionColorsQuick} group-hover:text-zinc-400`}>
                  Next project
                </span>
                <span className={`mt-5 block max-w-2xl font-serif text-[clamp(1.65rem,3.5vw,2.35rem)] font-normal leading-[1.12] tracking-[-0.03em] text-zinc-300/95 ${transitionColorsQuick} group-hover:text-zinc-100/92`}>
                  {next.title}
                </span>
              </Link>
            ) : null}

            <div className="flex flex-col gap-8 border-t border-zinc-800/40 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-9 sm:py-9">
              <Link
                href={indexHref}
                className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
              >
                {indexLabel}
              </Link>
              {prev ? (
                <Link
                  href={`${basePath}/${prev.slug}${navSuffix}`}
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
