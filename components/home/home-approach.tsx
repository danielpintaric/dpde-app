import Link from "next/link";
import { isSpecialHref } from "@/lib/href-utils";
import {
  editorialFrame,
  homeApproachKicker as approachKickerStyle,
  homeTileImageBase,
  homeTileImageHover,
  linkFocusVisible,
  stackMetaToTitle,
  stackTitleToBody,
  tapSoft,
  transitionQuick,
  typeBody,
  typeH2Large,
} from "@/lib/editorial";
import type { ResolvedHomeContent } from "@/types/site-landing";

type Props = Pick<
  ResolvedHomeContent,
  "approachKicker" | "approachTitle" | "approachBody" | "approachImageUrl" | "approachCta"
>;

export function HomeApproachBlock({
  approachKicker,
  approachTitle,
  approachBody,
  approachImageUrl,
  approachCta,
}: Props) {
  const cta = approachCta;

  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="home-approach-heading">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-16">
        <div className="order-2 max-w-[26rem] shrink-0 lg:order-1 lg:max-w-[min(100%,24rem)] xl:max-w-[26rem]">
          <p className={approachKickerStyle}>{approachKicker}</p>
          <h2 id="home-approach-heading" className={`${stackMetaToTitle} ${typeH2Large}`}>
            {approachTitle}
          </h2>
          <p
            className={`${stackTitleToBody} ${typeBody} max-w-[26rem] whitespace-pre-line text-[0.9375rem] leading-[1.92] tracking-[0.02em] text-zinc-400/95 sm:text-base sm:leading-[1.95]`}
          >
            {approachBody}
          </p>
          {cta ? (
            <p className="mt-6 text-[11px] font-normal tracking-[0.06em] sm:text-[12px]">
              {isSpecialHref(cta.href) ? (
                <a
                  href={cta.href}
                  className={`text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                  {...(cta.href.trim().startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {cta.label}
                </a>
              ) : (
                <Link
                  href={cta.href}
                  className={`text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] ${transitionQuick} hover:text-zinc-400 hover:decoration-zinc-500/55 ${linkFocusVisible} ${tapSoft}`}
                >
                  {cta.label}
                </Link>
              )}
            </p>
          ) : null}
        </div>
        <div className="order-1 w-full lg:order-2 lg:max-w-[min(100%,46%)]">
          <div className={`${editorialFrame} ml-auto w-full max-w-md lg:max-w-none`}>
            <div className="relative aspect-[3/4] w-full lg:aspect-[4/5]">
              <img
                src={approachImageUrl}
                alt=""
                className={`absolute inset-0 h-full w-full ${homeTileImageBase} ${homeTileImageHover} object-[center_45%]`}
                sizes="(min-width: 1024px) 42vw, 90vw"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
