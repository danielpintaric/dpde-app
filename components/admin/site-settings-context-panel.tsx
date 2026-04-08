"use client";

import { getSiteSectionContext } from "@/lib/admin/site-section-context";

type Props = {
  activeSectionId: string | null;
  className?: string;
};

const headerEyebrowClass =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500";
const cardEyebrowClass =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500";
const sectionLabelClass = "text-xs font-medium uppercase tracking-[0.12em] text-zinc-500";

export function SiteSettingsContextPanel({ activeSectionId, className = "" }: Props) {
  const resolvedId = activeSectionId?.trim() || "site";
  const ctx = getSiteSectionContext(resolvedId);

  return (
    <aside
      className={`hidden min-h-0 xl:block xl:min-w-0 ${className}`.trim()}
      aria-label="Editing guidance for the selected section"
    >
      <div className="sticky top-24 space-y-5">
        <header className="space-y-2 border-b border-zinc-800/60 pb-5">
          <p className={headerEyebrowClass}>Context</p>
          <h2 className="font-serif text-lg font-normal tracking-[-0.02em] text-zinc-200">
            Editing guidance
          </h2>
          <p className="text-[13px] leading-relaxed text-zinc-500">
            Short notes for the section you are editing—orientation, not rules.
          </p>
        </header>

        <div
          key={resolvedId}
          className="site-settings-context-panel-body rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-sm shadow-black/20 backdrop-blur-sm sm:p-6"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <p className={cardEyebrowClass}>{ctx.eyebrow}</p>
              <h3 className="text-base font-medium leading-snug text-zinc-100">{ctx.title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{ctx.description}</p>
            </div>

            {ctx.tips && ctx.tips.length > 0 ? (
              <div className="space-y-2.5">
                <p className={sectionLabelClass}>Tips</p>
                <ul className="list-inside list-disc space-y-1.5 text-sm leading-6 text-zinc-300 marker:text-zinc-600">
                  {ctx.tips.map((t, i) => (
                    <li key={`tip-${resolvedId}-${i}`}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {ctx.notes && ctx.notes.length > 0 ? (
              <div className="space-y-2.5">
                <p className={sectionLabelClass}>Notes</p>
                <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                  {ctx.notes.map((n, i) => (
                    <li key={`note-${resolvedId}-${i}`} className="border-l border-zinc-800/90 pl-3">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {ctx.checklist && ctx.checklist.length > 0 ? (
              <div className="space-y-2.5">
                <p className={sectionLabelClass}>Checklist</p>
                <ul className="space-y-2 text-sm leading-6 text-zinc-300">
                  {ctx.checklist.map((c, i) => (
                    <li key={`check-${resolvedId}-${i}`} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" aria-hidden />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
