const DEFAULT_BRAND = "Daniel Pintarić";
const DEV_SITE_FALLBACK = "http://localhost:3000";

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed || DEV_SITE_FALLBACK;
}

/**
 * Zentrale Basis-URL aus NEXT_PUBLIC_SITE_URL (ohne trailing slash).
 * Fehlt die Variable → http://localhost:3000 für lokale Entwicklung.
 */
export function getBaseUrl(): string {
  const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  return normalizeBaseUrl(siteUrlRaw || DEV_SITE_FALLBACK);
}

/**
 * Browser-sichere, öffentliche Konfiguration (nur NEXT_PUBLIC_*).
 * Darf in Client-Komponenten und in Metadaten importiert werden.
 */
export function getPublicConfig() {
  const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const siteUrl = siteUrlRaw ? normalizeBaseUrl(siteUrlRaw) : normalizeBaseUrl(DEV_SITE_FALLBACK);
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || DEFAULT_BRAND;

  return {
    /** Gleiche Basis wie getBaseUrl(); canonical ohne trailing slash */
    siteUrl,
    /** True, wenn NEXT_PUBLIC_SITE_URL in der Umgebung gesetzt ist */
    siteUrlConfigured: Boolean(siteUrlRaw),
    brandName,
  } as const;
}

export function getMetadataBaseUrl(): URL {
  try {
    return new URL(getBaseUrl());
  } catch {
    return new URL(DEV_SITE_FALLBACK);
  }
}

/** Optional Turnstile (Site Key ist öffentlich; Verifikation später serverseitig mit Secret). */
export function getOptionalTurnstileSiteKey(): string | undefined {
  const s = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return s || undefined;
}
