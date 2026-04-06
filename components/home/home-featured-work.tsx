import Link from "next/link";
import {
  editorialFrameInteractive,
  editorialImageOverlay,
  homeSectionKicker,
  homeTileCaptionStack,
  homeTileImageBase,
  homeTileImageHover,
  homeTileTitle,
} from "@/lib/editorial";

/** Lead: Titel im Overlay — gleiches Timing wie Kachel-Hover (statischer String für Tailwind). */
const leadOverlayTitle =
  "max-w-[26ch] font-serif text-[clamp(1.0625rem,3vw,1.48rem)] font-normal leading-[1.1] tracking-[-0.032em] text-zinc-100/98 transition-colors duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-white";

/** Lead-Bild: feste, bildstarke Höhe ab lg — verlässlich, kein Flex-Kollaps. */
const leadImageLgPair =
  "relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] md:aspect-[16/11] lg:aspect-[2/1] lg:min-h-[min(56vh,44rem)]";

/**
 * Trio lg+: gleiche Zeilenhöhe wie rechte Spalte — Lead-Bild füllt Zelle (flex-1), Mindesthöhe gegen Kollaps.
 */
const leadImageTrioLgStretch =
  "relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/11] lg:aspect-auto lg:flex-1 lg:min-h-[min(62vw,46rem)]";

/**
 * Trio lg+: Support-Bild wächst in der gestreckten Spalte (flex-1), mit Mindesthöhe.
 */
const supportImageTrioLgStretch =
  "relative w-full overflow-hidden aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-[min(26vw,18rem)]";

/** Support (Pair / generisch): ruhiges 3:4. */
const supportImageFrame = "relative aspect-[3/4] w-full overflow-hidden";

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
  linkClassName = "",
}: {
  href: string;
  src: string;
  title: string;
  category: string;
  sizes: string;
  imageWrapperClassName: string;
  /** Trio lg: gleiche Zeilenhöhe — `lg:flex lg:h-full lg:min-h-0 lg:flex-col` */
  linkClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={`${editorialFrameInteractive} group block ${linkClassName}`}
      aria-label={`${title} — ${category}`}
    >
      <div className={imageWrapperClassName}>
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full ${homeTileImageBase} ${homeTileImageHover}`}
          sizes={sizes}
          loading="eager"
          fetchPriority="high"
        />
        <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-zinc-950/65 via-zinc-950/14 to-transparent px-3 pb-3.5 pt-12 sm:px-4 sm:pb-4 sm:pt-14"
          aria-hidden
        >
          <p className={leadOverlayTitle}>{title}</p>
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
  stackedFill,
}: {
  href: string;
  src: string;
  title: string;
  category: string;
  sizes: string;
  imageWrapperClassName: string;
  /** Trio lg: Bildfläche flex-1 in gleich hoher rechter Spalte */
  stackedFill?: boolean;
}) {
  const linkLayout = stackedFill
    ? `${editorialFrameInteractive} group block max-lg:block lg:flex lg:h-full lg:min-h-0 lg:flex-col`
    : `${editorialFrameInteractive} group block`;

  return (
    <Link href={href} className={linkLayout} aria-label={`${title} — ${category}`}>
      <div
        className={`${imageWrapperClassName} ${stackedFill ? "lg:relative lg:min-h-0 lg:flex-1" : ""}`}
      >
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full ${homeTileImageBase} ${homeTileImageHover}`}
          sizes={sizes}
          loading="lazy"
        />
        <div className={`${editorialImageOverlay} z-[1]`} aria-hidden />
      </div>
      <div className={`${homeTileCaptionStack} max-w-[22ch]`}>
        <p className={homeTileTitle}>{title}</p>
      </div>
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
    <section
      className={`relative z-[11] ${className ?? ""}`}
      aria-labelledby="home-featured-work-heading"
    >
      <div className="mx-auto w-full max-w-7xl">
        <h2 id="home-featured-work-heading" className={homeSectionKicker}>
          Selected work
        </h2>

        {leadOnly ? (
          <div className="mt-7 md:mt-10 lg:mt-9">
            <FeaturedTileLead
              href={`/portfolio/${lead.slug}`}
              src={lead.image}
              title={lead.title}
              category={lead.category}
              sizes="(min-width: 1280px) 80rem, 100vw"
              imageWrapperClassName="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] md:aspect-[2/1] md:min-h-[min(62vh,46rem)] md:max-h-[min(78vh,48rem)]"
            />
          </div>
        ) : pairOnly ? (
          <div className="mt-7 grid grid-cols-1 gap-8 md:mt-10 md:gap-9 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(12.5rem,31%)] lg:items-start lg:gap-x-11 xl:gap-x-12">
            <div className="min-w-0">
              <FeaturedTileLead
                href={`/portfolio/${lead.slug}`}
                src={lead.image}
                title={lead.title}
                category={lead.category}
                sizes="(min-width: 1024px) 62vw, 92vw"
                imageWrapperClassName={leadImageLgPair}
              />
            </div>
            <div className="min-w-0 lg:max-w-none">
              <FeaturedTileSupport
                href={`/portfolio/${second!.slug}`}
                src={second!.secondarySrc?.trim() || second!.image}
                title={second!.title}
                category={second!.category}
                sizes="(min-width: 1024px) 28vw, 92vw"
                imageWrapperClassName={supportImageFrame}
              />
            </div>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:gap-7 md:gap-8 md:mt-10 lg:mt-10 lg:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.85fr)] lg:items-stretch">
            <div className="flex h-full min-h-0 min-w-0 flex-col">
              <FeaturedTileLead
                href={`/portfolio/${lead.slug}`}
                src={lead.image}
                title={lead.title}
                category={lead.category}
                sizes="(min-width: 1024px) 62vw, 92vw"
                linkClassName="lg:flex lg:h-full lg:min-h-0 lg:flex-col"
                imageWrapperClassName={leadImageTrioLgStretch}
              />
            </div>
            <aside className="flex h-full min-h-0 min-w-0 flex-col gap-6 sm:gap-7 md:gap-8 lg:max-w-none">
              <div className="flex min-h-0 min-w-0 flex-col max-lg:flex-none lg:flex-1 lg:basis-0">
                <FeaturedTileSupport
                  href={`/portfolio/${second!.slug}`}
                  src={second!.secondarySrc?.trim() || second!.image}
                  title={second!.title}
                  category={second!.category}
                  sizes="(min-width: 1024px) 28vw, 92vw"
                  stackedFill
                  imageWrapperClassName={supportImageTrioLgStretch}
                />
              </div>
              <div className="flex min-h-0 min-w-0 flex-col max-lg:flex-none lg:flex-1 lg:basis-0">
                <FeaturedTileSupport
                  href={`/portfolio/${third!.slug}`}
                  src={third!.secondarySrc?.trim() || third!.image}
                  title={third!.title}
                  category={third!.category}
                  sizes="(min-width: 1024px) 28vw, 92vw"
                  stackedFill
                  imageWrapperClassName={supportImageTrioLgStretch}
                />
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
