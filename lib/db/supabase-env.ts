/** Shared public Supabase config (safe for browser and server). */

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

/**
 * URL and anon key for user-scoped clients (RLS).
 * Throws if Supabase env is missing — call only where a configured client is required.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new SupabaseConfigError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}

/**
 * Project ref from `NEXT_PUBLIC_SUPABASE_URL` host (`<ref>.supabase.co`).
 * Safe to log for diagnostics — not a secret.
 */
export function getSupabaseProjectRefFromPublicUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    return null;
  }
  try {
    const host = new URL(url).hostname;
    const m = /^([^.]+)\.supabase\.co$/i.exec(host);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}
