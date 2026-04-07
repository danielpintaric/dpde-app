/**
 * Pragmatic email checks for admin validation and public mailto safety (not full RFC).
 */
export function isPlausibleEmailAddress(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 5 || s.length > 254) {
    return false;
  }
  return /^[^\s<>"'`]+@[^\s@]+\.[^\s@]{2,}$/i.test(s);
}

/** Strip characters that must not appear in a mailto local-part path segment. */
export function sanitizeEmailForMailto(raw: string): string {
  return raw.replace(/[\s<>]/g, "").trim();
}
