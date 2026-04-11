"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { SignOutButton } from "@/components/admin/sign-out-button";

const navLinkClass =
  "rounded-md px-2 py-1.5 text-[12px] font-medium tracking-wide text-zinc-400 outline-none transition-colors duration-200 hover:bg-white/5 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const drawerLinkClass =
  "block rounded-md px-2 py-2 text-base text-zinc-300 outline-none transition-colors duration-150 hover:bg-zinc-900/40 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const drawerLinkNewProjectClass =
  "mt-6 block rounded-md border border-zinc-800/80 bg-zinc-900/50 px-3 py-2.5 text-base font-medium text-zinc-100 outline-none transition-colors duration-150 hover:border-zinc-700/75 hover:bg-zinc-900/60 hover:text-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const NAV = [
  { href: "/admin/site", label: "Site" },
  { href: "/admin/client-access", label: "Client access" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/projects/new", label: "New project" },
] as const;

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  brandName: string;
};

export function AdminAppHeaderClient({ brandName }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const drawer = !mounted ? null : (
    <div className="lg:hidden" aria-hidden={!open}>
      <div
        className={
          "fixed inset-0 z-[100] bg-zinc-950/90 transition-opacity duration-200 ease-out motion-reduce:transition-none " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden
        onClick={close}
      />
      <aside
        id={panelId}
        className={
          "fixed inset-y-0 right-0 z-[105] flex h-full min-h-0 w-[min(85vw,320px)] max-w-[100vw] flex-col border-l border-zinc-800 bg-zinc-950 shadow-[0_0_0_1px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out motion-reduce:transition-none " +
          "pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] " +
          "pb-[env(safe-area-inset-bottom,0px)] " +
          (open ? "translate-x-0" : "translate-x-full pointer-events-none")
        }
        aria-hidden={!open}
      >
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-6 py-6">
          <div>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Menu</p>

            <nav className="flex flex-col space-y-3" aria-label="Admin">
              {NAV.slice(0, 3).map((item) => (
                <Link key={item.href} href={item.href} className={drawerLinkClass} onClick={close}>
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin/projects/new"
                className={drawerLinkNewProjectClass}
                onClick={close}
              >
                New project
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-6">
            <SignOutButton className="!inline-flex !w-full !items-center !justify-center !rounded-md !border !border-zinc-800 !bg-zinc-900 !py-2.5 !text-zinc-300 hover:!border-zinc-700 hover:!bg-zinc-800 hover:!text-zinc-200" />
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <header
        className={
          "sticky top-0 border-b border-zinc-800/60 bg-zinc-950/90 pt-[env(safe-area-inset-top,0px)] shadow-[0_1px_0_rgba(0,0,0,0.35)] transition-[z-index] duration-200 " +
          (open ? "z-[110]" : "z-50")
        }
      >
        {/* Mobile */}
        <div className="mx-auto flex min-h-[3.75rem] max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:hidden">
          <Link
            href="/admin/projects"
            className="group flex min-w-0 shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <span className="truncate font-serif text-[1.05rem] font-normal tracking-[-0.02em] text-zinc-100 transition-opacity duration-200 group-hover:opacity-90">
              {brandName}
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 outline-none transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Desktop — unchanged structure */}
        <div className="mx-auto hidden h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:flex lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-8">
            <Link
              href="/admin/projects"
              className="group flex min-w-0 shrink-0 items-baseline gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <span className="truncate font-serif text-[1.05rem] font-normal tracking-[-0.02em] text-zinc-100 transition-opacity duration-200 group-hover:opacity-90 sm:text-[1.15rem]">
                {brandName}
              </span>
              <span className="hidden shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-600 sm:inline">
                Admin
              </span>
            </Link>

            <nav className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2" aria-label="Admin">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="shrink-0">
            <SignOutButton />
          </div>
        </div>
      </header>

      {mounted && typeof document !== "undefined" ? createPortal(drawer, document.body) : null}
    </>
  );
}
