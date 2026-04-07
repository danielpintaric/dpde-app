import Link from "next/link";
import { isSpecialHref } from "@/lib/href-utils";
import { phoneToTelHref } from "@/lib/nav-utils";
import type { ResolvedSiteGlobal } from "@/types/site-global";
import { linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";

type SiteFooterProps = {
  site: ResolvedSiteGlobal;
};

export function SiteFooter({ site }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const showInstagram = Boolean(site.instagramUrl?.trim());
  const extraUrl = site.footerExtraUrl?.trim() ?? "";
  const extraLabel = site.footerExtraLabel?.trim() ?? "";
  const showExtraLink = extraUrl.length > 0 && extraLabel.length > 0;
  const ctaHref = site.footerCtaHref.trim() || "/contact";
  const ctaIsSpecial = isSpecialHref(ctaHref);

  return (
    <footer className="mt-10 border-t border-zinc-800/25 sm:mt-12">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:px-16 lg:pt-28 lg:pb-28">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between lg:gap-12">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
              © {year} {site.copyrightHolder}
            </p>
            <p className="mt-3 max-w-sm text-[12px] font-light leading-[1.65] tracking-[0.02em] text-zinc-500">
              {site.footerTagline}
            </p>
            {site.hasValidContactEmail ? (
              <p className="mt-4">
                <a
                  href={site.footerEmailMailto}
                  className={`text-[11px] font-normal tracking-[0.05em] text-zinc-600 underline decoration-zinc-700/35 underline-offset-[6px] ${transitionQuick} hover:text-zinc-500 hover:decoration-zinc-600/50 ${linkFocusVisible} ${tapSoft}`}
                >
                  {site.footerEmailLinkLabel}
                </a>
              </p>
            ) : null}
            {site.contactPhone?.trim() && phoneToTelHref(site.contactPhone) ? (
              <p className="mt-3">
                <a
                  href={phoneToTelHref(site.contactPhone)!}
                  className={`text-[11px] font-normal tracking-[0.05em] text-zinc-600 underline decoration-zinc-700/35 underline-offset-[6px] ${transitionQuick} hover:text-zinc-500 hover:decoration-zinc-600/50 ${linkFocusVisible} ${tapSoft}`}
                >
                  {site.contactPhone.trim()}
                </a>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 sm:gap-x-12">
            {showInstagram ? (
              <a
                href={site.instagramUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
              >
                {site.instagramLabel}
              </a>
            ) : null}
            {showExtraLink ? (
              isSpecialHref(extraUrl) ? (
                <a
                  href={extraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                >
                  {extraLabel}
                </a>
              ) : (
                <Link
                  href={extraUrl}
                  className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                >
                  {extraLabel}
                </Link>
              )
            ) : null}
            {site.footerCtaLabel.trim().length > 0 && ctaHref.length > 0 ? (
              ctaIsSpecial ? (
                <a
                  href={ctaHref}
                  className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                >
                  {site.footerCtaLabel}
                </a>
              ) : (
                <Link
                  href={ctaHref}
                  className={`text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                >
                  {site.footerCtaLabel}
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Wraps inner page content; global header and footer live in root layout. */
export function PageMain({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex-1">{children}</div>;
}
