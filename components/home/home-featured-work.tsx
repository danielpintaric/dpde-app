import Link from "next/link";
import {
  editorialFrameInteractive,
  editorialImage,
  editorialImageOverlay,
  editorialImageTone,
} from "@/lib/editorial";

/** Ruhiger als globales `typeMeta`: weniger „UI-Label“, eher Magazin-Kicker. */
const featuredSectionKicker =
  "font-serif text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500/75 sm:text-[11px] sm:tracking-[0.16em]";

/** Ruhigerer Zoom als {@link editorialImage} (Nebenkacheln). */
const supportImageHover =
  "transition-[transform,filter] duration-[680ms] ease-[cubic-bezier(0.2,1,0.3,1)] group-hover:scale-[1.014] group-hover:brightness-[1]";

export type HomeFeaturedWorkItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  /** Optional zweites Frame aus dem Projekt (nur für Nebenkacheln). */
  secondarySrc?: string;
};

type Props = {
  items: HomeFeaturedWorkItem[];
  className?: string;
};

function FeaturedTileLead({
  href,
  src,
  title,
  category,
  sizes,
  imageWrapperClassName,
}: {
  href: string;
  src: string;
  title: string;
  category: string;
  sizes: string;
  imageWrapperClassName: string;
}) {
  return (
    <Link
      href={href}
      className={`${editorialFrameInteractive} group block`}
      aria-label={`${title} — ${category}`}
    >
      <div className={`${imageWrapperClassName} overflow-hidden`}>
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full ${editorialImage}`}
          sizes={sizes}
          loading="eager"
          fetchPriority="high"
        />
        <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-zinc-950/65 via-zinc-950/14 to-transparent px-3 pb-3.5 pt-12 sm:px-4 sm:pb-4 sm:pt-14"
          aria-hidden
        >
          <p className="max-w-[26ch] font-serif text-[clamp(1.0625rem,3vw,1.48rem)] font-normal leading-[1.1] tracking-[-0.032em] text-zinc-100/98 transition-colors duration-500 ease-out group-hover:text-white">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedTileSupport({
  href,
  src,
  title,
  category,
  sizes,
  imageWrapperClassName,
}: {
  href: string;
  src: string;
  title: string;
  category: string;
  sizes: string;
  imageWrapperClassName: string;
}) {
  return (
    <Link
      href={href}
      className={`${editorialFrameInteractive} group block`}
      aria-label={`${title} — ${category}`}
    >
      <div className={`${imageWrapperClassName} overflow-hidden`}>
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full ${editorialImageTone} ${supportImageHover}`}
          sizes={sizes}
          loading="lazy"
        />
        <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
      </div>
      <p className="mt-2.5 max-w-[20ch] font-serif text-[0.8125rem] font-normal leading-snug tracking-[-0.018em] text-zinc-500 transition-colors duration-500 ease-out group-hover:text-zinc-300 sm:text-[0.875rem]">
        {title}
      </p>
    </Link>
  );
}

export function HomeFeaturedWork({ items, className }: Props) {
  const list = items
    .slice(0, 3)
    .filter((x) => x.slug.trim() !== "" && x.image.trim() !== "");
  if (list.length === 0) {
    return null;
  }

  const [lead, second, third] = list;
  const leadOnly = list.length === 1;
  const pairOnly = list.length === 2;

  return (
    <section className={className} aria-labelledby="home-featured-work-heading">
      <div className="mx-auto w-full max-w-7xl">
        <h2 id="home-featured-work-heading" className={featuredSectionKicker}>
          Selected work
        </h2>

        {leadOnly ? (
          <div className="mt-7 md:mt-10">
            <FeaturedTileLead
              href={`/portfolio/${lead.slug}`}
              src={lead.image}
              title={lead.title}
              category={lead.category}
              sizes="(min-width: 1280px) 80rem, 100vw"
              imageWrapperClassName="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[2/1] md:min-h-[min(62vh,46rem)] md:max-h-[min(78vh,48rem)]"
            />
          </div>
        ) : pairOnly ? (
          <div className="mt-7 grid grid-cols-1 gap-8 md:mt-10 md:gap-9 lg:mt-11 lg:grid-cols-[minmax(0,1fr)_minmax(12.5rem,31%)] lg:items-start lg:gap-x-11 xl:gap-x-12">
            <div className="min-w-0">
              <FeaturedTileLead
                href={`/portfolio/${lead.slug}`}
                src={lead.image}
                title={lead.title}
                category={lead.category}
                sizes="(min-width: 1024px) 62vw, 92vw"
                imageWrapperClassName="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[16/11] lg:aspect-[2/1] lg:min-h-[min(56vh,44rem)]"
              />
            </div>
            <div className="flex min-w-0 flex-col lg:max-w-none">
              <FeaturedTileSupport
                href={`/portfolio/${second!.slug}`}
                src={second!.secondarySrc?.trim() || second!.image}
                title={second!.title}
                category={second!.category}
                sizes="(min-width: 1024px) 28vw, 92vw"
                imageWrapperClassName="relative aspect-[3/4] w-full"
              />
            </div>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-8 md:mt-10 md:gap-9 lg:mt-11 lg:grid-cols-[minmax(0,1fr)_minmax(12.5rem,31%)] lg:items-start lg:gap-x-11 xl:gap-x-12">
            <div className="min-w-0">
              <FeaturedTileLead
                href={`/portfolio/${lead.slug}`}
                src={lead.image}
                title={lead.title}
                category={lead.category}
                sizes="(min-width: 1024px) 62vw, 92vw"
                imageWrapperClassName="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[16/11] lg:aspect-[2/1] lg:min-h-[min(58vh,46rem)]"
              />
            </div>
            <aside className="flex min-w-0 flex-col gap-7 sm:gap-8 md:gap-9 lg:max-w-none">
              <FeaturedTileSupport
                href={`/portfolio/${second!.slug}`}
                src={second!.secondarySrc?.trim() || second!.image}
                title={second!.title}
                category={second!.category}
                sizes="(min-width: 1024px) 28vw, 92vw"
                imageWrapperClassName="relative aspect-[3/4] w-full"
              />
              <FeaturedTileSupport
                href={`/portfolio/${third!.slug}`}
                src={third!.secondarySrc?.trim() || third!.image}
                title={third!.title}
                category={third!.category}
                sizes="(min-width: 1024px) 28vw, 92vw"
                imageWrapperClassName="relative aspect-[3/4] w-full"
              />
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
