import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/site-chrome";
import {
  linkFocusVisible,
  pageContentShell,
  stackMetaToTitle,
  stackTitleToBody,
  tapSoft,
  transitionQuick,
  typeBodyMuted,
  typeH1Page,
  typeH2Contact,
  typeMeta,
} from "@/lib/editorial";
import { getResolvedSiteGlobal } from "@/lib/services/site-global";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedSiteGlobal();
  const locationPart = site.locationCity?.trim() ? `, ${site.locationCity.trim()}` : ", Berlin";
  const description = site.bioLine?.trim()
    ? `${site.bioLine.trim()} — ${site.brandName}.`
    : `Editorial and portrait commissions, collaborations — ${site.brandName}${locationPart}. Availability by season.`;
  return {
    title: "Contact",
    description,
  };
}

function SecondaryContactLinks() {
  return (
    <p className="text-[12px] font-light tracking-[0.02em] text-zinc-600">
      <Link
        href="/portfolio"
        className={`text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
      >
        View work
      </Link>
      <span className="mx-2.5 text-zinc-700">·</span>
      <Link
        href="/client"
        className={`text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
      >
        Client area
      </Link>
    </p>
  );
}

export default async function ContactPage() {
  const site = await getResolvedSiteGlobal();

  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Availability</p>
          <h1 className={`${stackMetaToTitle} ${typeH1Page}`}>Contact</h1>
          {site.bioLine?.trim() ? (
            <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>{site.bioLine.trim()}</p>
          ) : null}
          <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>
            The studio takes a limited number of commissions each season — editorial assignments, portraits,
            and collaborations with publishers, brands, and studios who prefer a quiet, deliberate shoot.
            Timing, place, and what you need delivered are enough for a first note; a reply usually follows
            within a few working days
            {site.locationCity?.trim() ? ` from ${site.locationCity.trim()}` : " from Berlin"}.
          </p>

          <div className="mt-14 grid gap-12 sm:mt-16 sm:gap-16 lg:mt-[4.75rem] lg:grid-cols-2 lg:gap-x-20 lg:gap-y-16 xl:gap-x-24">
            <div className="flex flex-col gap-12 lg:gap-14">
              {site.hasValidContactEmail ? (
                <div>
                  <h2 className={typeH2Contact}>Direct</h2>
                  <p className="mt-5">
                    <a
                      href={site.footerEmailMailto}
                      className={`text-[0.9375rem] font-light leading-relaxed text-zinc-300 underline decoration-zinc-600/45 underline-offset-[6px] sm:text-base ${transitionQuick} hover:text-zinc-200 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                    >
                      {site.footerEmail}
                    </a>
                  </p>
                  <div className="mt-7 lg:mt-8">
                    <SecondaryContactLinks />
                  </div>
                </div>
              ) : null}

              <div>
                <h2 className={typeH2Contact}>Collaborations</h2>
                <p className={`mt-5 max-w-md ${typeBodyMuted}`}>
                  Editors, art buyers, and in-house creative teams: the same brief you would hand to any
                  trusted photographer is enough to see whether schedules align — no pitch deck required.
                </p>
                {!site.hasValidContactEmail ? (
                  <div className="mt-8 lg:mt-9">
                    <SecondaryContactLinks />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-10 sm:pt-12 lg:pt-1 lg:pl-14 xl:pl-20">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  );
}
