import "server-only";

/**
 * Nur `SUPABASE_SERVICE_ROLE_KEY` (Server-only, nie `NEXT_PUBLIC_*`).
 * Für Storage/Admin: immer {@link createSupabaseServiceRoleClient} — kein Ersatz durch anon.
 */
export function getOptionalSupabaseServiceRoleKey(): string | undefined {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || undefined;
}
