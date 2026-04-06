"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-chrome";
import { SiteHeader } from "@/components/site-header";
import type { ResolvedSiteGlobal } from "@/types/site-global";

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Öffentliches Site-Chrome nur außerhalb von `/admin/*`.
 * Admin nutzt eigene Header in den Admin-Layouts (kein Public-Header/Footer).
 */
export function RootPublicShell({
  children,
  siteGlobal,
}: Readonly<{ children: React.ReactNode; siteGlobal: ResolvedSiteGlobal }>) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }
  return (
    <>
      <SiteHeader site={siteGlobal} />
      {children}
      <SiteFooter site={siteGlobal} />
    </>
  );
}
