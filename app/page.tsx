import Link from "next/link";
import {
  editorialFrame,
  editorialFrameInteractive,
  editorialImage,
  editorialImageOverlay,
  linkFocusVisible,
  stackMetaToTitle,
  stackTitleToBody,
  tapSoft,
  transitionQuick,
  typeBody,
  typeH1Hero,
  typeH2Large,
  typeMeta,
} from "@/lib/editorial";
import {
  ABOUT_STUDIO_IMAGE,
  type HomeWorkPreviewFrame,
  homepageImages,
} from "@/lib/portfolio-data";
import {
  getHomeHeroFallbackImageSrc,
  getHomepageLinkedProjects,
  getHomeWorkMosaicFrames,
} from "@/lib/services/home-portfolio-data";

function Hero({ imageSrc }: { imageSrc: string }) {
  return (
    <section
      className="relative z-0 flex min-h-[100svh] w-full shrink-0 flex-col justify-end bg-zinc-950 pb-[env(safe-area-inset-bottom,0px)] text-zinc-100 sm:min-h-dvh"
      aria-label="Introduction"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_42%] brightness-[0.92] contrast-[1.04] sm:brightness-[0.88] sm:contrast-[1.06]"
          sizes="100vw"
          fetchPriority="high"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-zinc-950/[0.07] sm:bg-zinc-950/[0.12]"
          aria-hidden
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/68 to-zinc-950/34 sm:via-zinc-950/82 sm:to-zinc-950/45"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/54 via-black/18 to-black/8 sm:from-black/72 sm:via-black/28 sm:to-black/5"
        aria-hidden
      />
      {/* Exit fade — bottom ~25%: scene hand-off into body */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[25%] min-h-[5.5rem] max-h-[min(30dvh,26rem)] bg-gradient-to-t from-zinc-950 via-zinc-950/42 to-transparent sm:h-[28%] sm:via-zinc-950/55"
        aria-hidden
      />

      <div className="relative z-10 w-full px-6 pb-24 pt-[calc(4.75rem+env(safe-area-inset-top,0px))] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 lg:pb-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-lg max-sm:translate-y-[-2vh]">
            <h1 className={typeH1Hero}>Daniel Pintarić</h1>
            <p className={`mt-4 max-w-md sm:mt-6 ${typeBody}`}>
              Portrait and editorial work, Berlin — spare daylight, long tonal range, print as the first
              verdict. Travel when the brief warrants the distance.
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-normal tracking-[0.06em] sm:mt-10 sm:gap-x-3 sm:gap-y-1">
              <Link
                href="/portfolio"
                className={`text-zinc-200 underline decoration-zinc-400/55 underline-offset-[8px] ${transitionQuick} hover:text-zinc-50 hover:decoration-zinc-300/50 sm:text-zinc-500 sm:decoration-zinc-600/40 sm:underline-offset-[7px] sm:hover:text-zinc-400 sm:hover:decoration-zinc-500/50 ${linkFocusVisible} ${tapSoft}`}
              >
                View work
              </Link>
              <span className="text-zinc-600 sm:text-zinc-700">·</span>
              <Link
                href="/contact"
                className={`text-zinc-500/85 underline decoration-zinc-600/30 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/45 sm:text-zinc-500 sm:decoration-zinc-600/40 sm:hover:decoration-zinc-500/50 ${linkFocusVisible} ${tapSoft}`}
              >
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Recent pieces — dominant + two stack portraits + winter stack + two portrait halves (row 3) + two (row 4).
 */
/** Dominant cell uses fillCell so the image covers the full md row-span-2 area (no aspect gap). */
const RECENT_PIECES_GRID = [
  {
    grid: "md:col-span-7 md:row-span-2 md:row-start-1 md:col-start-1",
    fillCell: true,
  },
  {
    grid: "md:col-span-5 md:row-start-1 md:col-start-8",
    aspect: "aspect-[3/4]",
  },
  {
    grid: "md:col-span-5 md:row-start-2 md:col-start-8",
    aspect: "aspect-[3/4]",
  },
  {
    grid: "md:col-span-6 md:row-start-3 md:col-start-1",
    aspect: "aspect-[3/4]",
  },
  {
    grid: "md:col-span-6 md:row-start-3 md:col-start-7",
    aspect: "aspect-[3/4]",
  },
  {
    grid: "md:col-span-6 md:row-start-4 md:col-start-1",
    aspect: "aspect-[3/4]",
  },
  {
    grid: "md:col-span-6 md:row-start-4 md:col-start-7",
    aspect: "aspect-[3/4]",
  },
] as const;

/**
 * First block after hero: on mobile, no negative margin — overlap was pulling the gallery into the first
 * viewport on iPhone. Desktop keeps the intentional overlap into the hero.
 */
const HOME_FIRST_AFTER_HERO =
  "relative z-10 mt-0 px-6 pt-20 pb-16 sm:-mt-20 sm:px-10 sm:pt-24 sm:pb-[4.5rem] lg:px-16 lg:pb-20";
/** One rhythm for all editorial stacks on home (avoids py-12 + py-12 feeling too loose). */
const HOME_EDITORIAL_SECTION = "px-6 py-9 sm:px-10 sm:py-10 lg:px-16 lg:py-10";
/** Strip before Work — same vertical scale as sections */
const SECTION_BREAK = "py-9 sm:py-10 lg:py-10";

function WorkMosaic({ frames }: { frames: HomeWorkPreviewFrame[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 md:items-stretch"
      aria-label="Selected work"
    >
      {frames.map(({ src, slug, imgClassName }, i) => {
        const cfg = RECENT_PIECES_GRID[i] ?? RECENT_PIECES_GRID[0]!;
        const fillCell = "fillCell" in cfg && cfg.fillCell;
        return (
          <li
            key={`${slug}-${i}`}
            className={`${cfg.grid} ${fillCell ? "flex min-h-0 flex-col md:h-full" : ""}`}
          >
            <Link
              href={`/portfolio/${slug}`}
              className={`${editorialFrameInteractive} ${fillCell ? "flex min-h-0 flex-1 flex-col md:h-full" : "block"}`}
            >
              <div
                className={
                  fillCell
                    ? "relative aspect-[3/4] w-full min-h-[14rem] flex-1 md:aspect-auto md:h-full md:min-h-0"
                    : `relative w-full ${"aspect" in cfg ? cfg.aspect : "aspect-[3/4]"}`
                }
              >
                <img
                  src={src}
                  alt=""
                  className={`absolute inset-0 h-full w-full ${editorialImage}${imgClassName ? ` ${imgClassName}` : ""}`}
                  sizes="(min-width: 1024px) 35vw, (min-width: 768px) 45vw, 92vw"
                  loading="lazy"
                />
                <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AboutTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="about-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-12">
        <div className="order-2 max-w-[26rem] shrink-0 lg:order-1 lg:max-w-[min(100%,22rem)] xl:max-w-[24rem]">
          <p className={typeMeta}>Studio</p>
          <h2 id="about-heading" className={`${stackMetaToTitle} ${typeH2Large}`}>
            Approach
          </h2>
          <p className={`${stackTitleToBody} ${typeBody} max-w-[22rem] leading-[1.85] tracking-[0.015em]`}>
            Enough light to read the subject, never enough to stage them. If that pace fits your brief, more
            context lives on About. Selected commissions and collaborations are arranged through Contact.
          </p>
        </div>
        <div className="order-1 w-full lg:order-2 lg:max-w-[min(100%,48%)]">
          <div className={`${editorialFrame} ml-auto w-full max-w-md lg:max-w-none`}>
            <div className="relative aspect-[3/4] w-full lg:aspect-[4/5]">
              <img
                src={ABOUT_STUDIO_IMAGE}
                alt=""
                className={`absolute inset-0 h-full w-full ${editorialImage} object-[center_45%]`}
                sizes="(min-width: 1024px) 42vw, 90vw"
                loading="lazy"
              />
              <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  /** Fixed landscape hero (`HOME_HERO_IMAGE`); not the first featured project cover from DB. */
  const heroSrc = getHomeHeroFallbackImageSrc();

  const { widePlateProject, wideBelowProject, duoProject } =
    await getHomepageLinkedProjects();

  const mosaicFrames = await getHomeWorkMosaicFrames();

  /** First block after hero overlaps hero — wide rail is the opening beat. */
  const widePlateSectionClass = HOME_FIRST_AFTER_HERO;
  const duoSectionClass = widePlateProject ? HOME_EDITORIAL_SECTION : HOME_FIRST_AFTER_HERO;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-zinc-950 text-zinc-100 antialiased">
      <Hero imageSrc={heroSrc} />

      <main className="relative z-10 pb-20 sm:pb-24 lg:pb-28">
        {widePlateProject ? (
          <section className={widePlateSectionClass} aria-label={widePlateProject.title}>
            <div className="mx-auto w-full max-w-7xl">
              <Link href={`/portfolio/${widePlateProject.slug}`} className={editorialFrameInteractive}>
                <div className="relative aspect-[5/4] w-full sm:aspect-[2/1] lg:aspect-[2/1] lg:max-h-[min(68vh,42rem)]">
                  <img
                    src={homepageImages.widePlate}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover object-[center_40%] brightness-[0.88] contrast-[1.06] ${editorialImage}`}
                    sizes="(min-width: 1280px) 80rem, 100vw"
                    loading="lazy"
                  />
                  <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        {widePlateProject ? (
          <section className={HOME_EDITORIAL_SECTION} aria-label={widePlateProject.title}>
            <div className="mx-auto w-full max-w-7xl">
              <Link href={`/portfolio/${widePlateProject.slug}`} className={editorialFrameInteractive}>
                <div className="relative aspect-[3/4] w-full">
                  <img
                    src={homepageImages.widePlateFollow}
                    alt=""
                    className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_45%]`}
                    sizes="(min-width: 1280px) 80rem, 100vw"
                    loading="lazy"
                  />
                  <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        {widePlateProject && wideBelowProject ? (
          <section className={HOME_EDITORIAL_SECTION} aria-label={wideBelowProject.title}>
            <div className="mx-auto flex max-w-7xl flex-col gap-5 md:gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-x-4 md:gap-y-0 md:content-start">
                <div className="md:col-span-6 md:self-start">
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrameInteractive}>
                    <div className="relative aspect-[3/4] w-full">
                      <img
                        src={homepageImages.widePlateBelow}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_45%]`}
                        sizes="(min-width: 1024px) 46vw, 92vw"
                        loading="lazy"
                      />
                      <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                    </div>
                  </Link>
                </div>
                <div className="md:col-span-6 md:self-start">
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrameInteractive}>
                    <div className="relative aspect-[3/4] w-full">
                      <img
                        src={homepageImages.widePlateBelowBeside}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_48%]`}
                        sizes="(min-width: 1024px) 46vw, 92vw"
                        loading="lazy"
                      />
                      <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                    </div>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-x-4 md:gap-y-0 md:content-start">
                <div className="md:col-span-6 md:self-start">
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrameInteractive}>
                    <div className="relative aspect-[3/4] w-full">
                      <img
                        src={homepageImages.wideBelowPair[0]}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_45%]`}
                        sizes="(min-width: 1024px) 46vw, 92vw"
                        loading="lazy"
                      />
                      <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                    </div>
                  </Link>
                </div>
                <div className="md:col-span-6 md:self-start">
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrameInteractive}>
                    <div className="relative aspect-[3/4] w-full">
                      <img
                        src={homepageImages.wideBelowPair[1]}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_45%]`}
                        sizes="(min-width: 1024px) 46vw, 92vw"
                        loading="lazy"
                      />
                      <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {duoProject ? (
          <section className={duoSectionClass} aria-label={duoProject.title}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-x-4 md:gap-y-0 md:content-start">
              <div className="md:col-span-7 md:self-start">
                <Link href={`/portfolio/${duoProject.slug}`} className={editorialFrameInteractive}>
                  <div className="relative aspect-[5/4] w-full sm:aspect-[16/10] md:aspect-[16/10]">
                    <img
                      src={homepageImages.duo[0]}
                      alt=""
                      className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_42%]`}
                      sizes="(min-width: 1024px) 46vw, 92vw"
                      loading="lazy"
                    />
                    <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                  </div>
                </Link>
              </div>
              <div className="md:col-span-5 md:self-start">
                <Link href={`/portfolio/${duoProject.slug}`} className={editorialFrameInteractive}>
                  <div className="relative aspect-[3/4] w-full">
                    <img
                      src={homepageImages.duo[1]}
                      alt=""
                      className={`absolute inset-0 h-full w-full ${editorialImage} object-cover object-[center_44%]`}
                      sizes="(min-width: 1024px) 38vw, 92vw"
                      loading="lazy"
                    />
                    <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                  </div>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className={SECTION_BREAK} aria-label="Break">
          <p className={`${typeMeta} text-center tracking-[0.4em]`}>Selected work</p>
        </section>

        <section className={HOME_EDITORIAL_SECTION}>
          <div className="mx-auto max-w-7xl">
            <p className={typeMeta}>Work</p>
            <h2 className={`${stackMetaToTitle} ${typeH2Large}`}>Recent pieces</h2>
            <p className={`${stackTitleToBody} max-w-md ${typeBody}`}>
              Recent commissions and personal series — editorial and portrait work gathered in one index
              under Work.
            </p>
            <div className="mt-6 md:mt-8">
              <WorkMosaic frames={mosaicFrames} />
            </div>
          </div>
        </section>

        <section className={HOME_EDITORIAL_SECTION}>
          <AboutTeaser />
        </section>
      </main>
    </div>
  );
}
