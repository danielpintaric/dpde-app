"use client";

import { getSiteSectionIntro } from "@/lib/admin/site-section-intro";

type Props = {
  activeSectionId: string | null;
  className?: string;
};

export function SiteSettingsSectionIntro({ activeSectionId, className = "" }: Props) {
  const resolvedId = activeSectionId?.trim() || "site";
  const intro = getSiteSectionIntro(resolvedId);

  return (
    <div className={`mb-8 max-w-[420px] space-y-2 sm:mb-10 sm:space-y-3 ${className}`.trim()}>
      <div key={resolvedId} className="site-settings-section-intro-inner space-y-2 sm:space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          {intro.label}
        </p>
        <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">{intro.title}</h2>
        <p className="text-sm leading-6 text-zinc-400">{intro.description}</p>
      </div>
    </div>
  );
}
