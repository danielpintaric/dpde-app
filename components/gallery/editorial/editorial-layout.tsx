import type { ReactNode } from "react";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Desktop two-column shell (optional / legacy). Public gallery uses lead + uniform series (STEP 26A).
 */
export function EditorialGallery({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("hidden w-full md:grid md:grid-cols-2 md:items-start md:gap-6 lg:gap-8", className)}>
      {children}
    </div>
  );
}

/** Left column — large lead (legacy / optional compositions). */
export function EditorialLead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("min-w-0 md:pt-0.5 lg:pt-1", className)}>
      <div className="mx-auto w-full max-w-[92%] md:mx-0 md:max-w-none">{children}</div>
    </div>
  );
}

/** Right column — vertical stack (legacy / optional compositions). */
export function EditorialStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "flex w-full min-w-0 flex-col items-stretch gap-4 sm:gap-5 lg:gap-6 md:border-l md:border-zinc-800/12 md:pl-6 lg:pl-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Space between full editorial rows (chunks of 4). */
export const editorialRowVerticalSpacing = "mt-8 sm:mt-10 lg:mt-12";

/** Shared list reset for gallery `<ul>` rows (spacing only via grid gap constants). */
export const editorialListResetClass = "m-0 list-none p-0";

/** Mobile / small: 2-column (legacy; public series grid lives in `public-gallery-layout`). */
export const editorialMobileGridClass = "grid w-full grid-cols-2 gap-5 sm:gap-6";

/** Incomplete chunk: same 2-column rhythm as the public series grid. */
export const editorialIncompleteChunkGridClass =
  "grid w-full grid-cols-2 gap-5 sm:gap-6 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12";
