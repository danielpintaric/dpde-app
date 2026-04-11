"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { isSpecialHref } from "@/lib/href-utils";
import { navLinkIsActive } from "@/lib/nav-utils";
import { linkFocusVisible, transitionNav, transitionShell, tapSoft } from "@/lib/editorial";
import type { ResolvedNavItem, ResolvedSiteGlobal } from "@/types/site-global";

const navLinkClass = (active: boolean) =>
  `text-[12px] font-normal tracking-[0.07em] ${transitionNav} ${linkFocusVisible} ${tapSoft} ${
    active
      ? "text-zinc-400/95 underline decoration-zinc-500/25 underline-offset-[7px]"
      : "text-zinc-500/95 hover:text-zinc-400/90 hover:underline hover:decoration-zinc-600/28 hover:underline-offset-[8px]"
  }`;

function NavItemLink({
  item,
  pathname,
  onNavigate,
}: {
  item: ResolvedNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const { href, label } = item;
  const active = navLinkIsActive(pathname, href);
  const cls = navLinkClass(active);

  if (isSpecialHref(href)) {
    return (
      <a
        href={href}
        onClick={onNavigate}
        className={cls}
        {...(href.trim().startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} className={cls} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}

function HeaderCtaLink({
  label,
  href,
  pathname,
  onNavigate,
}: {
  label: string;
  href: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = navLinkIsActive(pathname, href);
  const cls = navLinkClass(active);

  if (isSpecialHref(href)) {
    return (
      <a
        href={href}
        onClick={onNavigate}
        className={cls}
        {...(href.trim().startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} className={cls} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}

type SiteHeaderProps = {
  site: ResolvedSiteGlobal;
};

export function SiteHeader({ site }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /** Small threshold so the bar firms up as soon as content begins to pass underneath. */
  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 8);
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
  const logoHomeHref = site.logoHomeHref.trim() || "/";

  const onLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (isHome && logoHomeHref === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const showHeaderCta =
    Boolean(site.headerCtaLabel?.trim()) && Boolean(site.headerCtaHref?.trim());
  const headerCtaLabel = site.headerCtaLabel?.trim() ?? "";
  const headerCtaHref = site.headerCtaHref?.trim() ?? "";

  const navItems = site.navigationItems;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] ${transitionShell} ${
        scrolled || menuOpen
          ? "border-b border-zinc-800/60 bg-zinc-950/90"
          : "border-b border-zinc-800/35 bg-zinc-950/90"
      }`}
    >
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between sm:h-20">
          <Link
            href={logoHomeHref}
            onClick={onLogoClick}
            className={`shrink-0 font-serif text-[1.125rem] font-normal leading-none tracking-[-0.03em] text-zinc-100 transition-opacity duration-[300ms] ease-out hover:opacity-[0.92] ${linkFocusVisible} sm:text-[1.25rem] ${
              showLogo ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            } ${site.logoImageUrl ? "inline-flex max-w-[min(200px,55vw)] items-center" : ""}`}
            tabIndex={showLogo ? undefined : -1}
          >
            {site.logoImageUrl ? (
              <img
                src={site.logoImageUrl}
                alt={site.wordmarkText}
                className="h-[1.35rem] w-auto max-h-[1.5rem] max-w-full object-contain object-left sm:h-[1.45rem] sm:max-h-[1.6rem]"
              />
            ) : (
              site.wordmarkText
            )}
          </Link>

          <div className="hidden items-center md:flex md:gap-x-11 lg:gap-x-14">
            <ul className="flex items-center gap-x-11 lg:gap-x-14">
              {navItems.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  <NavItemLink item={item} pathname={pathname} />
                </li>
              ))}
            </ul>
            {showHeaderCta ? (
              <HeaderCtaLink
                label={headerCtaLabel}
                href={headerCtaHref}
                pathname={pathname}
                onNavigate={() => setMenuOpen(false)}
              />
            ) : null}
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className={`-mr-1 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-end rounded-sm px-2 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400/95 ${transitionNav} hover:text-zinc-300/95 ${tapSoft} ${linkFocusVisible}`}
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
          className="border-b border-zinc-800/50 bg-zinc-950/90 px-6 pb-10 pt-6 sm:px-10 lg:px-16 md:hidden"
        >
          <nav className="mx-auto w-full max-w-7xl" aria-label="Main mobile">
            <ul className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <li key={`m-${item.href}-${i}`}>
                  <NavItemLink item={item} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
                </li>
              ))}
              {showHeaderCta ? (
                <li>
                  <HeaderCtaLink
                    label={headerCtaLabel}
                    href={headerCtaHref}
                    pathname={pathname}
                    onNavigate={() => setMenuOpen(false)}
                  />
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
