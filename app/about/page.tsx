import type { Metadata } from "next";
import { PageMain } from "@/components/site-chrome";
import {
  editorialImageTone,
  editorialImageOverlay,
  stackMetaToTitle,
  stackTitleToBody,
  typeBodyMuted,
  typeH1Page,
  typeH2Section,
  typeMeta,
} from "@/lib/editorial";
import { ABOUT_STUDIO_IMAGE } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "About — Daniel Pintarić",
  description:
    "Portrait and editorial photographer based in Berlin — light, pace, and how commissions are handled.",
};

const VALUES = [
  {
    title: "Precision",
    text: "Frame edges and timing are decided; nothing ornamental earns its place without a reason.",
  },
  {
    title: "Atmosphere",
    text: "Mood comes from light volume and the length of a pause — not from props or overstylists.",
  },
  {
    title: "Narrative",
    text: "A good picture should imply what happened just before and what might happen next, even when nothing moves.",
  },
] as const;

export default function AboutPage() {
  return (
    <PageMain>
      <div className="px-6 pb-20 pt-28 sm:px-10 lg:px-16 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Studio</p>
          <h1 className={`${stackMetaToTitle} ${typeH1Page}`}>About</h1>
          <p className={`${stackTitleToBody} max-w-xl ${typeBodyMuted}`}>
            Portrait and editorial work from a studio in Berlin. Commissions usually arrive from magazines,
            design-led houses, and private clients who ask for a quiet set and a restrained file — never a
            performance for the camera.
          </p>

          <div className="mt-16 grid gap-16 lg:mt-20 lg:grid-cols-2 lg:items-start lg:gap-28">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 lg:aspect-[4/5]">
              <img
                src={ABOUT_STUDIO_IMAGE}
                alt=""
                className={`absolute inset-0 h-full w-full ${editorialImageTone} object-cover object-[center_45%]`}
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className={editorialImageOverlay} aria-hidden />
            </div>
            <div className="space-y-12 lg:space-y-14 lg:pt-2">
              <div>
                <h2 className={typeH2Section}>How the pictures behave</h2>
                <p className={`mt-6 ${typeBodyMuted}`}>
                  Natural light when it fits the subject; small sculpting strokes of artificial light when
                  the brief asks for structure. Colour is corrected toward what the day actually looked
                  like — not toward trend. Contrast stays in the lower register so skin and fabric keep
                  their authority.
                </p>
              </div>
              <div>
                <h2 className={typeH2Section}>On set</h2>
                <p className={`mt-6 ${typeBodyMuted}`}>
                  Prep is thorough and quiet. During the shoot, direction stays minimal: enough to place
                  someone in the light, never enough to replace their breathing. Post-production tightens
                  what was already there; it does not invent a second scene.
                </p>
              </div>
              <div>
                <h2 className={typeH2Section}>Base and travel</h2>
                <p className={`mt-6 ${typeBodyMuted}`}>
                  Based in Berlin; most work stays in Germany or across the border when the schedule allows.
                  Longer travel follows the brief — editorial coverages, launches, extended portrait weeks.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-20 border-t border-zinc-800/50 pt-16 lg:mt-28 lg:pt-20" aria-label="Values">
            <h2 className={typeH2Section}>What the work assumes</h2>
            <ul className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-10 lg:mt-16 lg:gap-14">
              {VALUES.map((item, i) => (
                <li key={item.title} className={i === 1 ? "sm:pt-4 lg:pt-8" : ""}>
                  <p className={typeMeta}>{item.title}</p>
                  <p className={`mt-4 ${typeBodyMuted} text-[13px]`}>{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageMain>
  );
}
