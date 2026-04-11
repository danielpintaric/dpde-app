import { GalleryFramePublic, type GalleryFramePublicProps } from "@/components/gallery/gallery-frame-public";

export type EditorialImageProps = GalleryFramePublicProps & {
  /**
   * Very subtle scale on hover (grid shell only). Respects `motion-reduce`.
   */
  subtleHover?: boolean;
};

const subtleHoverShell =
  "transition-[transform] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.006]";

/**
 * Public editorial tile — thin wrapper around `GalleryFramePublic` with optional hover polish.
 */
export function EditorialImage({
  subtleHover = false,
  gridMediaShellClassName = "",
  ...props
}: EditorialImageProps) {
  const hover = subtleHover ? subtleHoverShell : "";
  const merged = `${gridMediaShellClassName} ${hover}`.trim();
  return <GalleryFramePublic {...props} gridMediaShellClassName={merged || undefined} />;
}
