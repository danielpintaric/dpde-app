"use client";

import { useEffect, useRef } from "react";
import { scrollbarHiddenHorizontal } from "@/lib/editorial";
import type { SiteSectionId } from "@/lib/admin/site-sections";

export type SiteSettingsSectionItem = { id: SiteSectionId; label: string };

const pillBaseClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-3.5 text-[13px] font-medium outline-none transition-[color,background-color,border-color,box-shadow] duration-200 sm:h-10 sm:px-4";

const pillInactiveClass = `${pillBaseClass} border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-200`;
const pillActiveClass = `${pillBaseClass} border-zinc-600 bg-zinc-800/90 text-zinc-100 shadow-sm shadow-black/20 ring-1 ring-white/5`;

type Props = {
  sections: readonly SiteSettingsSectionItem[];
  activeSectionId: string | null;
};

export function SiteSettingsMobileNav({ sections, activeSectionId }: Props) {
  const skipInitialScrollRef = useRef(true);
  const prevActiveRef = useRef<string | null>(activeSectionId);

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false;
      prevActiveRef.current = activeSectionId;
      return;
    }
    if (activeSectionId === prevActiveRef.current) {
      return;
    }
    prevActiveRef.current = activeSectionId;

    const el = document.querySelector<HTMLElement>(
      `[data-site-settings-pill="${activeSectionId ?? ""}"]`,
    );
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeSectionId]);

  return (
    <nav className="px-4 pb-3" aria-label="Site settings sections">
      {/*
        Horizontal scroll on an inner strip only — avoids overflow-x-auto forcing overflow-y
        to clip active pill rings / tops against the sticky wrapper edge.
      */}
      <div className={`overflow-x-auto py-0.5 ${scrollbarHiddenHorizontal}`}>
        <div className="flex min-w-max gap-2">
          {sections.map(({ id, label }) => {
            const isActive = activeSectionId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                data-site-settings-pill={id}
                className={isActive ? pillActiveClass : pillInactiveClass}
                aria-current={isActive ? "location" : undefined}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
