import Link from "next/link";
import { EditorialHero } from "@/components/hero/editorial-hero";
import { HomeApproachBlock } from "@/components/home/home-approach";
import { HomeFeaturedWork } from "@/components/home/home-featured-work";
import { HomeMoreWork } from "@/components/home/home-more-work";
import {
  linkFocusVisible,
  tapSoft,
  transitionQuick,
  typeBody,
  typeH1Hero,
} from "@/lib/editorial";
import { getHomeFeaturedEditorialData, getHomeMoreWorkTiles } from "@/lib/services/home-portfolio-data";
import { getResolvedHomeContent, getResolvedLandingHero } from "@/lib/services/site-landing";

/**
 * Selected Work: kein negativer Rand unter lg (kein Überlapp auf schmalen Viewports).
 * Ab lg: etwas stärkerer editorial Überlapp (–mt-32) + angepasstes pt.
 */
const HOME_FIRST_AFTER_HERO =
  "mt-0 px-6 pt-[4.5rem] pb-[4.25rem] sm:px-10 sm:pt-[6.5rem] sm:pb-[5rem] lg:-mt-32 lg:px-16 lg:pt-20 lg:pb-22";
/** Approach: eigener Block / Abschluss — lg stärkerer Break nach More Work; pb für ruhigen Auslauf vor Footer. */
const HOME_EDITORIAL_SECTION =
  "px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:pt-32 lg:pb-20";
/** More Work: deutlich eigenständiger Block; mehr Luft zu Featured + zu Approach (nur lg+). */
const HOME_MORE_WORK_SECTION =
  "px-6 pb-12 pt-14 sm:px-10 sm:pb-14 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-32";

export default async function Home() {
  const [landingHero, homeContent, featured, moreWorkTiles] = await Promise.all([
    getResolvedLandingHero(),
    getResolvedHomeContent(),
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
          <div className="max-w-lg">
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

      <main className="relative z-10 pb-24 sm:pb-28 lg:pb-28">
        {homeContent.showSelectedWork ? (
          <HomeFeaturedWork
            items={featured}
            sectionLabel={homeContent.selectedWorkLabel}
            className={HOME_FIRST_AFTER_HERO}
          />
        ) : null}

        {homeContent.showMoreWork ? (
          <HomeMoreWork
            items={moreWorkTiles}
            sectionLabel={homeContent.moreWorkLabel}
            className={HOME_MORE_WORK_SECTION}
          />
        ) : null}

        {homeContent.showApproach ? (
          <section className={HOME_EDITORIAL_SECTION}>
            <HomeApproachBlock
              approachKicker={homeContent.approachKicker}
              approachTitle={homeContent.approachTitle}
              approachBody={homeContent.approachBody}
              approachImageUrl={homeContent.approachImageUrl}
              approachCta={homeContent.approachCta}
            />
          </section>
        ) : null}
      </main>
    </div>
  );
}
