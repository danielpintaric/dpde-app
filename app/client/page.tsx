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

export const metadata: Metadata = {
  title: "Client Area — Daniel Pintarić",
  description:
    "Private viewing rooms for commission delivery — access by invitation from the studio.",
};

export default function ClientPage() {
  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Private access</p>
          <h1 className={`${stackMetaToTitle} ${typeH1Page}`}>Client area</h1>
          <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>
            A closed room for your commission — proofs, finals, and any agreed follow-up — until the work
            is signed off. Nothing here is indexed or visible outside your invitation.
          </p>

          <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <div className="bg-zinc-900/40 p-10 sm:p-12">
                <h2 className={typeH2Contact}>Sign in</h2>
                <p className={`mt-5 text-[13px] leading-[1.75] text-zinc-500`}>
                  When a room is ready, the studio writes you directly with access. There is no open
                  registration and no public list of names.
                </p>
                <div className="mt-10 space-y-10">
                  <div className="space-y-3">
                    <label htmlFor="client-email" className={typeMeta}>
                      Email
                    </label>
                    <input
                      id="client-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      disabled
                      placeholder=""
                      className={`w-full cursor-not-allowed border-0 border-b border-zinc-800/80 bg-transparent py-4 text-[13px] font-light tracking-[0.02em] text-zinc-600 outline-none placeholder:text-zinc-600/90 ${transitionQuick}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="client-password" className={typeMeta}>
                      Access code
                    </label>
                    <input
                      id="client-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      disabled
                      placeholder=""
                      className={`w-full cursor-not-allowed border-0 border-b border-zinc-800/80 bg-transparent py-4 text-[13px] font-light tracking-[0.02em] text-zinc-600 outline-none placeholder:text-zinc-600/90 ${transitionQuick}`}
                    />
                  </div>
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed text-[11px] font-normal tracking-[0.1em] text-zinc-600 underline decoration-zinc-700/50 underline-offset-[10px] opacity-45"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 lg:pl-2 xl:pl-6">
              <div className={`space-y-10 text-[13px] font-light leading-[1.8] lg:pt-1 ${typeBodyMuted}`}>
                <p>
                  Each room matches one delivery — your side of the desk only. Review, print reference, or
                  internal approval stays inside that boundary.
                </p>
                <p>
                  If a handful of frames read closer to intent than the rest, say so. The studio takes that
                  narrowing as the brief for the next pass.
                </p>
                <p className="text-zinc-600">
                  No invitation yet?{" "}
                  <Link
                    href="/contact"
                    className={`text-zinc-400 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-300 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                  >
                    Get in touch
                  </Link>{" "}
                  with the job title or publication you were given.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  );
}
