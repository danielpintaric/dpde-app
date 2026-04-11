import Link from "next/link";
import {
  editorialFrameInteractive,
  homeSectionKicker,
  homeTileCaptionStack,
  homeTileImageBase,
  homeTileImageHover,
  homeTileMeta,
  homeTileMetaToTitle,
  homeTileTitle,
} from "@/lib/editorial";
import type { HomeMoreWorkTile } from "@/lib/services/home-portfolio-data";

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
  sectionLabel: string;
};

export function HomeMoreWork({ items, className, sectionLabel }: Props) {
  if (items.length === 0) {
    return null;
  }

  const n = items.length;
  /** Letzte Zeile: ein Tile (4,7,10…) → zentriert; zwei Tiles (2,5,8…) → 2+1-Spalten, Zeile ohne Loch. */
  const remainder = n % 3;

  return (
    <section className={className} aria-labelledby="home-more-work-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="home-more-work-heading" className={homeSectionKicker}>
          {sectionLabel}
        </h2>
        <ul className="mt-9 grid list-none grid-cols-1 gap-x-0 gap-y-16 sm:mt-11 sm:gap-y-[4.5rem] md:grid-cols-2 md:gap-x-12 md:gap-y-[4.75rem] lg:mt-10 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-24">
          {items.map((item, i) => {
            const isSoloLastRow = remainder === 1 && i === n - 1;
            const isPairLastWide = remainder === 2 && i === n - 2;
            const hasMeta = item.category.trim().length > 0;
            return (
              <li
                key={`${item.slug}-${i}`}
                className={`min-w-0${isSoloLastRow ? " lg:col-span-3 lg:flex lg:justify-center" : ""}${isPairLastWide ? " lg:col-span-2" : ""}`}
              >
                <Link
                  href={`/portfolio/${item.slug}`}
                  className={`${editorialFrameInteractive} group block${isSoloLastRow ? " w-full max-w-[min(28rem,100%)] sm:max-w-[min(32rem,100%)] lg:max-w-[min(36rem,100%)]" : ""}`}
                  aria-label={`${item.title} — ${item.category}`}
                >
                  <div className={`relative w-full overflow-hidden ${aspectClass(i)}`}>
                    <img
                      src={item.src}
                      alt=""
                      className={`absolute inset-0 h-full w-full ${homeTileImageBase} ${homeTileImageHover}${item.imgClassName ? ` ${item.imgClassName}` : ""}`}
                      sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 88vw"
                      loading="lazy"
                    />
                  </div>
                  <div className={homeTileCaptionStack}>
                    {hasMeta ? <p className={homeTileMeta}>{item.category}</p> : null}
                    <p className={`${homeTileTitle} ${hasMeta ? homeTileMetaToTitle : ""}`}>{item.title}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
