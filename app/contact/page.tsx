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

export default async function ContactPage() {
  const site = await getResolvedSiteGlobal();

  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Availability</p>
          <h1 className={`${stackMetaToTitle} ${typeH1Page}`}>Contact</h1>
          <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>
            The studio takes a limited number of commissions each season — editorial assignments, portraits,
            and collaborations with publishers, brands, and studios who prefer a quiet, deliberate shoot.
            Timing, place, and what you need delivered are enough for a first note; a reply usually follows
            within a few working days from Berlin.
          </p>

          <div className="mt-16 grid gap-16 sm:gap-20 lg:mt-24 lg:grid-cols-2 lg:gap-24">
            <div className="space-y-14 lg:space-y-16">
              <div>
                <h2 className={typeH2Contact}>Direct</h2>
                <p className="mt-5 text-sm font-light leading-relaxed text-zinc-500">
                  <a
                    href={site.footerEmailMailto}
                    className={`text-zinc-400 underline decoration-zinc-600/40 underline-offset-[6px] ${transitionQuick} hover:text-zinc-300 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                  >
                    {site.footerEmailLinkLabel}
                  </a>
                </p>
              </div>
              <div>
                <h2 className={typeH2Contact}>Collaborations</h2>
                <p className={`mt-5 max-w-md ${typeBodyMuted}`}>
                  Editors, art buyers, and in-house creative teams: the same brief you would hand to any
                  trusted photographer is enough to see whether schedules align — no pitch deck required.
                </p>
              </div>
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
            </div>

            <div className="pt-12 lg:pt-1 lg:pl-14 xl:pl-20">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  );
}
