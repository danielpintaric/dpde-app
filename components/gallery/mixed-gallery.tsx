import type { ProjectImage } from "@/lib/portfolio-data";
import { GalleryFrame } from "./gallery-frame";

type MixedGalleryProps = {
  images: ProjectImage[];
};

/** Full-bleed band */
function FullBleed({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] ${className}`}
    >
      {children}
    </div>
  );
}

export function MixedGallery({ images }: MixedGalleryProps) {
  const [lead, second, ...rest] = images;

  if (!lead) {
    return null;
  }

  return (
    <div className="pb-8">
      {/* Dominant opening */}
      <div className="mt-2">
        <FullBleed>
          <GalleryFrame image={lead} aspectClass="aspect-[16/9] sm:aspect-[2/1] max-h-[min(85vh,900px)]" />
        </FullBleed>
      </div>

      {second ? (
        <div className="mt-16 px-6 sm:mt-24 lg:mt-32 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-3xl sm:ml-auto sm:mr-[4%] lg:mr-[8%] lg:max-w-4xl">
            <GalleryFrame image={second} aspectClass="aspect-[3/4] sm:aspect-[4/5]" />
          </div>
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="mt-24 px-6 sm:mt-32 lg:mt-44 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl border-t border-zinc-800/50 pt-20 sm:pt-24 lg:pt-28">
            <div className="grid grid-cols-1 gap-y-16 gap-x-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-24 lg:gap-y-28">
              {rest.map((image, i) => (
                <div
                  key={`${image.src}-mixed-${i}`}
                  className={
                    i === 1
                      ? "sm:-translate-y-6 lg:-translate-y-10"
                      : i === 3
                        ? "sm:col-span-2 sm:mx-auto sm:max-w-4xl"
                        : ""
                  }
                >
                  <GalleryFrame
                    image={image}
                    aspectClass={i % 2 === 0 ? "aspect-[3/4]" : "aspect-[16/9]"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
