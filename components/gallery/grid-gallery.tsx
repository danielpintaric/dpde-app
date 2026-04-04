import type { ProjectImage } from "@/lib/portfolio-data";
import { GalleryFrame } from "./gallery-frame";

type GridGalleryProps = {
  images: ProjectImage[];
};

export function GridGallery({ images }: GridGalleryProps) {
  const [lead, second, third, ...rest] = images;

  if (!lead) {
    return null;
  }

  return (
    <div className="pb-6">
      {/* Opening frame — contained, editorial */}
      <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-16">
        <GalleryFrame image={lead} aspectClass="aspect-[3/4]" />
      </div>

      {second && third ? (
        <div className="mx-auto mt-20 max-w-7xl px-6 sm:mt-28 lg:mt-32 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 border-t border-zinc-800/50 pt-16 sm:grid-cols-12 sm:gap-x-10 sm:pt-20 lg:gap-x-12 lg:pt-24">
            <div className="sm:col-span-7">
              <GalleryFrame image={second} aspectClass="aspect-[3/4] sm:aspect-[4/5]" />
            </div>
            <div className="mt-10 sm:col-span-4 sm:col-start-9 sm:mt-16 lg:mt-24">
              <GalleryFrame image={third} aspectClass="aspect-[16/9] sm:aspect-[3/4]" />
            </div>
          </div>
        </div>
      ) : second ? (
        <div className="mx-auto mt-16 max-w-5xl px-6 sm:mt-24 sm:px-10 lg:px-16">
          <GalleryFrame image={second} aspectClass="aspect-[16/9]" />
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="mx-auto mt-20 max-w-7xl px-6 sm:mt-28 lg:mt-36 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-y-16 border-t border-zinc-800/50 pt-16 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-24 sm:pt-20 lg:gap-x-12 lg:pt-28">
            {rest.map((image, i) => (
              <div
                key={`${image.src}-rest-${i}`}
                className={i % 2 === 1 ? "sm:mt-10 lg:mt-16" : ""}
              >
                <GalleryFrame
                  image={image}
                  aspectClass={i % 3 === 0 ? "aspect-[16/9]" : "aspect-[3/4]"}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
