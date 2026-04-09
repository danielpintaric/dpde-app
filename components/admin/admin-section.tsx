"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminSectionScrollMarginClass } from "@/lib/admin/admin-mobile-layout";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type AccordionContextValue = {
  openSectionId: string | null;
  toggleSection: (id: string) => void;
};

const AdminSectionAccordionContext = createContext<AccordionContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  /** Section id that starts expanded; default matches first Site settings block. */
  defaultOpenId?: string | null;
};

export function AdminSectionAccordionProvider({
  children,
  defaultOpenId = "site",
}: ProviderProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(defaultOpenId);

  const toggleSection = useCallback((id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  }, []);

  const value = useMemo(
    () => ({ openSectionId, toggleSection }),
    [openSectionId, toggleSection],
  );

  return (
    <AdminSectionAccordionContext.Provider value={value}>{children}</AdminSectionAccordionContext.Provider>
  );
}

type Props = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminSection({ id, title, description, children }: Props) {
  const accordion = useContext(AdminSectionAccordionContext);
  const isOpen = accordion ? accordion.openSectionId === id : true;
  const isActive = isOpen;
  const toggle = () => accordion?.toggleSection(id);

  const headingId = `${id}-heading`;
  const panelId = `${id}-content`;

  return (
    <section
      id={id}
      className={cn(
        adminSectionScrollMarginClass,
        "mb-10 rounded-2xl border px-6 py-6 transition-all duration-200",
        isActive ? "border-zinc-700 bg-zinc-950/50" : "border-zinc-800/60 bg-zinc-950/30",
        "hover:border-zinc-700/80",
      )}
      aria-labelledby={headingId}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <header className="min-w-0 flex-1 space-y-2">
          <h2
            id={headingId}
            className={cn("text-lg font-semibold", isActive ? "text-zinc-100" : "text-zinc-300")}
          >
            {title}
          </h2>
          {description ? <p className="max-w-[50ch] text-sm text-zinc-400">{description}</p> : null}
        </header>
        <span className="shrink-0 text-base leading-none text-zinc-500 tabular-nums" aria-hidden>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div id={panelId} className="mt-6 space-y-6 text-zinc-300 transition-all duration-200">
          {children}
        </div>
      ) : null}
    </section>
  );
}
