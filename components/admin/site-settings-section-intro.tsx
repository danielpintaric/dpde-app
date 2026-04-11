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
    <div
      className={`mb-8 max-w-[520px] rounded-2xl border border-zinc-800/80 bg-zinc-950/90 px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ${className}`.trim()}
    >
      <div key={resolvedId} className="site-settings-section-intro-inner space-y-2">
        <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
          {intro.label}
        </p>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-100">
          {intro.title}
        </h2>
        <p className="max-w-[38ch] text-sm text-zinc-400">{intro.description}</p>
      </div>
    </div>
  );
}
