import "server-only";

/**
 * Optional service role key for trusted server jobs (e.g. admin scripts, elevated writes).
 * Never import this from client code or expose in responses.
 */
export function getOptionalSupabaseServiceRoleKey(): string | undefined {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || undefined;
}
