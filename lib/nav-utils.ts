/**
 * Active state for internal nav links (header / inline links).
 * External / mailto / tel never count as active.
 */
export function navLinkIsActive(pathname: string, href: string): boolean {
  const h = href.trim();
  if (!h || h.startsWith("#")) return false;
  if (/^mailto:/i.test(h) || /^tel:/i.test(h) || /^https?:\/\//i.test(h)) return false;
  if (h === "/") return pathname === "/";
  if (pathname === h) return true;
  return pathname.startsWith(`${h}/`);
}

/** Strip to digits and leading + for tel: href */
export function phoneToTelHref(raw: string): string | null {
  const t = raw.trim();
  if (t.length === 0) return null;
  const compact = t.replace(/[^\d+]/g, "");
  return compact.length > 0 ? `tel:${compact}` : null;
}
