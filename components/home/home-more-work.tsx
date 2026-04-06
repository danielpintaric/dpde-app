import Link from "next/link";
import { editorialFrameInteractive, editorialImageOverlay, typeMeta } from "@/lib/editorial";
import type { HomeMoreWorkTile } from "@/lib/services/home-portfolio-data";

/** Leichter als Leit-/Featured-Hover — zweite Ebene, zurückhaltend. */
const moreWorkImage =
  "absolute inset-0 h-full w-full object-cover brightness-[0.97] contrast-[1.02] transition-[transform,filter] duration-[650ms] ease-[cubic-bezier(0.2,1,0.3,1)] group-hover:scale-[1.011] group-hover:brightness-[1]";

const moreWorkSectionKicker =
  "font-serif text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500/75 sm:text-[11px] sm:tracking-[0.16em]";

function aspectClass(i: number): string {
  switch (i % 3) {
    case 0:
      return "aspect-[4/5]";
    case 1:
      return "aspect-[3/4]";
    default:
      return "aspect-[5/6]";
  }
}

type Props = {
  items: HomeMoreWorkTile[];
  className?: string;
};

export function HomeMoreWork({ items, className }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={className} aria-labelledby="home-more-work-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="home-more-work-heading" className={moreWorkSectionKicker}>
          More work
        </h2>
        <ul className="mt-9 grid list-none grid-cols-1 gap-x-0 gap-y-16 sm:mt-11 sm:gap-y-[4.5rem] md:grid-cols-2 md:gap-x-12 md:gap-y-[4.75rem] lg:grid-cols-3 lg:gap-x-14 lg:gap-y-24 lg:[&>li:nth-child(3n+2)]:translate-y-3">
          {items.map((item, i) => (
            <li key={`${item.slug}-${i}`} className="min-w-0">
              <Link
                href={`/portfolio/${item.slug}`}
                className={`${editorialFrameInteractive} group block`}
                aria-label={`${item.title} — ${item.category}`}
              >
                <div className={`relative w-full overflow-hidden ${aspectClass(i)}`}>
                  <img
                    src={item.src}
                    alt=""
                    className={`${moreWorkImage}${item.imgClassName ? ` ${item.imgClassName}` : ""}`}
                    sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 88vw"
                    loading="lazy"
                  />
                  <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
                </div>
                <div className="mt-4 sm:mt-5">
                  {item.category.trim() ? (
                    <p className={`${typeMeta} text-[9px] text-zinc-600`}>{item.category}</p>
                  ) : null}
                  <p className="mt-1 font-serif text-[0.9375rem] font-normal leading-snug tracking-[-0.022em] text-zinc-400 transition-colors duration-500 ease-out group-hover:text-zinc-200 sm:text-base">
                    {item.title}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
