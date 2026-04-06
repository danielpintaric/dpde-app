/** True when href should use a plain `<a>` (external / mailto / tel), not Next `<Link>`. */
export function isSpecialHref(href: string): boolean {
  const t = href.trim();
  return /^https?:\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t);
}
