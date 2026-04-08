import type { ReactNode } from "react";

/**
 * Anchor offset: safe area + admin header + (max-lg) sticky pill nav + gap; lg+ matches prior sidebar layout.
 */
const sectionScrollClass =
  "max-lg:scroll-mt-[calc(env(safe-area-inset-top,0px)+3.5rem+2.875rem+0.5rem)] max-lg:sm:scroll-mt-[calc(env(safe-area-inset-top,0px)+4rem+2.875rem+0.5rem)] lg:scroll-mt-[calc(env(safe-area-inset-top,0px)+4rem+0.5rem)]";

type Props = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminSection({ id, title, description, children }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={`${sectionScrollClass} border-b border-zinc-800 py-10 last:border-b-0`}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-lg font-medium text-zinc-200">
        {title}
      </h2>
      {description ? <p className="mt-1 max-w-prose text-sm text-zinc-400">{description}</p> : null}
      <div className="mt-8 text-zinc-300">{children}</div>
    </section>
  );
}
