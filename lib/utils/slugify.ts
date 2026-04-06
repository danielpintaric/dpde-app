/**
 * Wandelt Freitext in einen gültigen Projektslug um (lowercase, Ziffern, Bindestriche).
 * Leerer oder nur-Sonderzeichen-Input → "".
 */
export function slugify(raw: string): string {
  return raw
    .trim()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
