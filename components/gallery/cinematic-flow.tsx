import type { ProjectImage } from "@/lib/portfolio-data";
import { GalleryFrame } from "./gallery-frame";

type CinematicFlowProps = {
  images: ProjectImage[];
};

/** Full-bleed band — edge-to-edge within the viewport */
function FullBleed({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] ${className}`}
    >
      {children}
    </div>
  );
}

type Segment =
  | { type: "single"; variant: "fullBleed" | "narrow" | "fullTall" | "centerWide"; image: ProjectImage }
  | { type: "duo"; images: [ProjectImage, ProjectImage] };

function buildSegments(images: ProjectImage[]): Segment[] {
  const n = images.length;
  const out: Segment[] = [];
  let i = 0;
  const variants: Array<"fullBleed" | "narrow" | "fullTall" | "centerWide"> = [
    "fullBleed",
    "narrow",
    "fullTall",
    "centerWide",
  ];
  let v = 0;
  while (i < n) {
    if (n >= 4 && i === n - 2) {
      out.push({ type: "duo", images: [images[i]!, images[i + 1]!] });
      break;
    }
    out.push({
      type: "single",
      image: images[i]!,
      variant: variants[v % variants.length]!,
    });
    v++;
    i++;
  }
  return out;
}

const SECTION_MARGINS = [
  "",
  "mt-20 sm:mt-28 lg:mt-40",
  "mt-10 sm:mt-14 lg:mt-20",
  "mt-24 sm:mt-32 lg:mt-44",
  "mt-12 sm:mt-20 lg:mt-28",
  "mt-28 sm:mt-36 lg:mt-[10rem]",
];

export function CinematicFlow({ images }: CinematicFlowProps) {
  const segments = buildSegments(images);

  return (
    <div className="pb-8">
      {segments.map((segment, segIndex) => {
        const margin = SECTION_MARGINS[segIndex] ?? "mt-24 lg:mt-32";

        if (segment.type === "duo") {
          const [a, b] = segment.images;
          return (
            <div key={`duo-${segIndex}-${a.src}`} className={margin}>
              <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
                <div className="grid grid-cols-1 gap-8 border-t border-zinc-800/50 pt-16 sm:grid-cols-12 sm:gap-10 sm:pt-20 lg:gap-12 lg:pt-24">
                  <div className="sm:col-span-7">
                    <GalleryFrame image={a} aspectClass="aspect-[3/4] sm:aspect-[4/5]" />
                  </div>
                  <div className="sm:col-span-4 sm:col-start-9 sm:pt-10 lg:pt-16">
                    <GalleryFrame image={b} aspectClass="aspect-[16/9] sm:aspect-[3/4]" />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const { image, variant } = segment;

        if (variant === "fullBleed") {
          return (
            <div key={`full-${segIndex}-${image.src}`} className={margin}>
              <FullBleed>
                <GalleryFrame image={image} aspectClass="aspect-[16/9] sm:aspect-[21/9]" />
              </FullBleed>
            </div>
          );
        }

        if (variant === "fullTall") {
          return (
            <div key={`tall-${segIndex}-${image.src}`} className={margin}>
              <FullBleed>
                <GalleryFrame
                  image={image}
                  aspectClass="aspect-[3/4] sm:aspect-[2/3] max-h-[min(92vh,960px)] sm:max-h-[min(88vh,1024px)]"
                />
              </FullBleed>
            </div>
          );
        }

        if (variant === "narrow") {
          return (
            <div key={`narrow-${segIndex}-${image.src}`} className={margin}>
              <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-16">
                <GalleryFrame image={image} aspectClass="aspect-[3/4]" />
              </div>
            </div>
          );
        }

        /* centerWide */
        return (
          <div key={`wide-${segIndex}-${image.src}`} className={margin}>
            <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
              <GalleryFrame image={image} aspectClass="aspect-[16/9]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
