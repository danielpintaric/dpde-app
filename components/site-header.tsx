"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV = [
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/client", label: "Client area" },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/portfolio") return pathname === "/portfolio" || pathname.startsWith("/portfolio/");
  if (href === "/client") return pathname === "/client" || pathname.startsWith("/client/");
  return pathname === href;
}

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {NAV.map(({ href, label }) => {
        const active = linkActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={`text-[12px] font-normal tracking-[0.07em] transition duration-300 ease-out ${
                active
                  ? "text-zinc-300 underline decoration-zinc-500/25 underline-offset-[7px]"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 12);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const pathname = usePathname();
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const showLogo = !isHome || scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ease-out ${
        scrolled || menuOpen
          ? "border-b border-zinc-800/60 bg-zinc-950/88 backdrop-blur-xl"
          : "border-b border-transparent bg-zinc-950/25 backdrop-blur-[2px]"
      }`}
    >
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between sm:h-20">
          <Link
            href="/"
            className={`shrink-0 font-serif text-[1.125rem] font-normal leading-none tracking-[-0.03em] text-zinc-100 transition-[opacity,transform] duration-500 ease-out hover:opacity-[0.88] sm:text-[1.25rem] ${
              showLogo ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-0.5 opacity-0"
            }`}
            tabIndex={showLogo ? undefined : -1}
          >
            Daniel Pintarić
          </Link>

          <nav className="hidden items-center md:flex" aria-label="Main">
            <NavLinks className="flex items-center gap-x-11 lg:gap-x-14" />
          </nav>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-500 transition duration-300 ease-out hover:text-zinc-400"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-b border-zinc-800/50 bg-zinc-950/94 px-6 py-10 backdrop-blur-xl sm:px-10 lg:px-16 md:hidden"
        >
          <nav className="mx-auto w-full max-w-7xl" aria-label="Main mobile">
            <NavLinks
              onNavigate={() => setMenuOpen(false)}
              className="flex flex-col gap-8"
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
