import Link from "next/link";
import { EditorialHero } from "@/components/hero/editorial-hero";
import {
  editorialFrame,
  editorialImageOverlay,
  homeTileImageBase,
  homeTileImageHover,
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
import { HomeFeaturedWork } from "@/components/home/home-featured-work";
import { HomeMoreWork } from "@/components/home/home-more-work";
import { ABOUT_STUDIO_IMAGE } from "@/lib/portfolio-data";
import { getHomeFeaturedEditorialData, getHomeMoreWorkTiles } from "@/lib/services/home-portfolio-data";
import { getResolvedLandingHero } from "@/lib/services/site-landing";

/**
 * Selected Work: kein negativer Rand unter lg (kein Überlapp auf schmalen Viewports).
 * Ab lg: etwas stärkerer editorial Überlapp (–mt-32) + angepasstes pt.
 */
const HOME_FIRST_AFTER_HERO =
  "mt-0 px-6 pt-[4.5rem] pb-[4.25rem] sm:px-10 sm:pt-[6.5rem] sm:pb-[5rem] lg:-mt-32 lg:px-16 lg:pt-[5rem] lg:pb-[5.5rem]";
/** Approach: eigener Block / Abschluss — lg stärkerer Break nach More Work. */
const HOME_EDITORIAL_SECTION =
  "px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:pt-32 lg:pb-16";
/** More Work: deutlich eigenständiger Block; mehr Luft zu Featured + zu Approach (nur lg+). */
const HOME_MORE_WORK_SECTION =
  "px-6 pb-12 pt-14 sm:px-10 sm:pb-14 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-32";

function AboutTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="about-heading">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-16">
        <div className="order-2 max-w-[26rem] shrink-0 lg:order-1 lg:max-w-[min(100%,24rem)] xl:max-w-[26rem]">
          <p
            className={`${typeMeta} font-serif font-normal normal-case tracking-[0.18em] text-zinc-500/80`}
          >
            Studio
          </p>
          <h2 id="about-heading" className={`${stackMetaToTitle} ${typeH2Large}`}>
            Approach
          </h2>
          <p
            className={`${stackTitleToBody} ${typeBody} max-w-[26rem] text-[0.9375rem] leading-[1.92] tracking-[0.02em] text-zinc-400/95 sm:text-base sm:leading-[1.95]`}
          >
            Enough light to read the subject, never enough to stage them. If that pace fits your brief, more
            context lives on About. Selected commissions and collaborations are arranged through Contact.
          </p>
        </div>
        <div className="order-1 w-full lg:order-2 lg:max-w-[min(100%,46%)]">
          <div className={`${editorialFrame} ml-auto w-full max-w-md lg:max-w-none`}>
            <div className="relative aspect-[3/4] w-full lg:aspect-[4/5]">
              <img
                src={ABOUT_STUDIO_IMAGE}
                alt=""
                className={`absolute inset-0 h-full w-full ${homeTileImageBase} ${homeTileImageHover} object-[center_45%]`}
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
  const [landingHero, featured, moreWorkTiles] = await Promise.all([
    getResolvedLandingHero(),
    getHomeFeaturedEditorialData(),
    getHomeMoreWorkTiles(),
  ]);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-zinc-950 text-zinc-100 antialiased">
      <EditorialHero
        images={landingHero.heroImageUrls}
        slideIntervalMs={landingHero.heroSlideIntervalMs}
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-lg max-sm:translate-y-[-2vh]">
            <h1 className={typeH1Hero}>{landingHero.title}</h1>
            <p className={`mt-4 max-w-md sm:mt-6 ${typeBody}`}>{landingHero.subtitle}</p>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-normal tracking-[0.06em] sm:mt-10 sm:gap-x-3 sm:gap-y-1">
              <Link
                href={landingHero.link1.href}
                className={`text-zinc-200 underline decoration-zinc-400/55 underline-offset-[8px] ${transitionQuick} hover:text-zinc-50 hover:decoration-zinc-300/50 sm:text-zinc-500 sm:decoration-zinc-600/40 sm:underline-offset-[7px] sm:hover:text-zinc-400 sm:hover:decoration-zinc-500/50 ${linkFocusVisible} ${tapSoft}`}
              >
                {landingHero.link1.label}
              </Link>
              <span className="text-zinc-600 sm:text-zinc-700">·</span>
              <Link
                href={landingHero.link2.href}
                className={`text-zinc-500/85 underline decoration-zinc-600/30 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/45 sm:text-zinc-500 sm:decoration-zinc-600/40 sm:hover:decoration-zinc-500/50 ${linkFocusVisible} ${tapSoft}`}
              >
                {landingHero.link2.label}
              </Link>
            </p>
          </div>
        </div>
      </EditorialHero>

      <main className="relative z-10 pb-24 sm:pb-28 lg:pb-32">
        <HomeFeaturedWork items={featured} className={HOME_FIRST_AFTER_HERO} />

        <HomeMoreWork items={moreWorkTiles} className={HOME_MORE_WORK_SECTION} />

        <section className={HOME_EDITORIAL_SECTION}>
          <AboutTeaser />
        </section>
      </main>
    </div>
  );
}
