import Link from "next/link";
import {
  editorialFrame,
  editorialImage,
  editorialImageOverlay,
  stackMetaToTitle,
  stackTitleToBody,
  typeBody,
  typeH1Hero,
  typeH2Large,
  typeMeta,
} from "@/lib/editorial";
import {
  ABOUT_STUDIO_IMAGE,
  getHomeFeaturedEditorial,
  getProjectBySlug,
  HOME_HERO_IMAGE,
  HOME_WORK_PREVIEW,
  homepageImages,
} from "@/lib/portfolio-data";

function Hero({ imageSrc }: { imageSrc: string }) {
  return (
    <section
      className="relative z-0 flex min-h-dvh w-full shrink-0 flex-col justify-end bg-zinc-950 text-zinc-100"
      aria-label="Introduction"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_42%] brightness-[0.88] contrast-[1.06]"
          sizes="100vw"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-zinc-950/[0.12]" aria-hidden />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/82 to-zinc-950/45"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/78 via-black/32 to-black/15 sm:from-black/72 sm:via-black/28 sm:to-black/5"
        aria-hidden
      />
      {/* Exit fade — bottom ~25%: scene hand-off into body */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[25%] min-h-[5.5rem] max-h-[min(30dvh,26rem)] bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent sm:h-[28%]"
        aria-hidden
      />

      <div className="relative z-10 w-full px-6 pb-14 pt-[5.5rem] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 lg:pb-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-lg">
            <h1 className={typeH1Hero}>Daniel Pintarić</h1>
            <p className={`mt-5 max-w-md sm:mt-6 ${typeBody}`}>
              Portrait and editorial work, Berlin — spare daylight, long tonal range, print as the first
              verdict. Travel when the brief warrants the distance.
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-normal tracking-[0.06em] text-zinc-500 sm:mt-10">
              <Link
                href="/portfolio"
                className="text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/50"
              >
                View work
              </Link>
              <span className="text-zinc-700">·</span>
              <Link
                href="/contact"
                className="text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/50"
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

/** Overlap into hero; bottom padding stays moderate — next block adds its own top padding. */
const HOME_FIRST_AFTER_HERO =
  "relative z-10 px-6 -mt-16 pt-20 pb-14 sm:-mt-20 sm:px-10 sm:pt-24 sm:pb-16 lg:px-16 lg:pb-16";
/** One rhythm for all editorial stacks on home (avoids py-12 + py-12 feeling too loose). */
const HOME_EDITORIAL_SECTION = "px-6 py-8 sm:px-10 sm:py-9 lg:px-16 lg:py-9";
/** Strip before Work — same vertical scale as sections */
const SECTION_BREAK = "py-8 sm:py-9 lg:py-9";

function WorkMosaic() {
  return (
    <ul
      className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 md:items-stretch"
      aria-label="Selected work"
    >
      {HOME_WORK_PREVIEW.map(({ src, slug, imgClassName }, i) => {
        const cfg = RECENT_PIECES_GRID[i] ?? RECENT_PIECES_GRID[0]!;
        const fillCell = "fillCell" in cfg && cfg.fillCell;
        return (
          <li
            key={`${slug}-${i}`}
            className={`${cfg.grid} ${fillCell ? "flex min-h-0 flex-col md:h-full" : ""}`}
          >
            <Link
              href={`/portfolio/${slug}`}
              className={`${editorialFrame} ${fillCell ? "flex min-h-0 flex-1 flex-col md:h-full" : "block"}`}
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8 xl:gap-9">
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

export default function Home() {
  const editorial = getHomeFeaturedEditorial();
  const blockA = editorial[0];
  const heroSrc = blockA?.image ?? HOME_HERO_IMAGE;

  const widePlateProject = getProjectBySlug(homepageImages.widePlateSlug);
  const wideBelowProject = getProjectBySlug(homepageImages.widePlateBelowSlug);
  const duoProject = getProjectBySlug(homepageImages.duoSlug);

  /** First block after hero overlaps hero — wide rail is the opening beat. */
  const widePlateSectionClass = HOME_FIRST_AFTER_HERO;
  const duoSectionClass = widePlateProject ? HOME_EDITORIAL_SECTION : HOME_FIRST_AFTER_HERO;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-zinc-950 text-zinc-100 antialiased">
      <Hero imageSrc={heroSrc} />

      <main className="relative z-10">
        {widePlateProject ? (
          <section className={widePlateSectionClass} aria-label={widePlateProject.title}>
            <div className="mx-auto w-full max-w-7xl">
              <Link href={`/portfolio/${widePlateProject.slug}`} className={editorialFrame}>
                <div className="relative aspect-[5/4] w-full sm:aspect-[2/1] lg:aspect-[2/1] lg:max-h-[min(68vh,42rem)]">
                  <img
                    src={homepageImages.widePlate}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_40%] brightness-[0.88] contrast-[1.06] transition duration-300 ease-out group-hover:scale-[1.015] group-hover:opacity-[0.94]"
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
              <Link href={`/portfolio/${widePlateProject.slug}`} className={editorialFrame}>
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
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrame}>
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
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrame}>
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
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrame}>
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
                  <Link href={`/portfolio/${wideBelowProject.slug}`} className={editorialFrame}>
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
                <Link href={`/portfolio/${duoProject.slug}`} className={editorialFrame}>
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
                <Link href={`/portfolio/${duoProject.slug}`} className={editorialFrame}>
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
            <div className="mt-3 md:mt-4">
              <WorkMosaic />
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
