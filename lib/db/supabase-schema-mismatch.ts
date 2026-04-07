/**
 * Detects PostgREST / Postgres errors that usually mean the DB schema is behind
 * the app (migration not applied, or stale schema cache).
 */

export const SITE_LANDING_SCHEMA_MISSING_MESSAGE_DE =
  "Die Home-Content-Felder sind in der Datenbank noch nicht verfügbar. Bitte die aktuelle Supabase-Migration für site_landing_settings anwenden und die Seite neu laden.";

/** Multi-site migration (`site_id` on global/landing settings) not applied yet. */
export const SITE_ID_SCHEMA_MISSING_MESSAGE_DE =
  "Die Multi-Site-Datenbankfelder sind noch nicht verfügbar. Bitte die aktuelle Supabase-Migration für site_id anwenden und die Seite neu laden.";

/** PostgREST codes are often embedded in wrapped Error messages, e.g. `[PGRST204]`. */
export function extractPostgrestCodeFromMessage(message: string): string | undefined {
  const bracket = message.match(/\[\s*(PGRST\d+)\s*\]/i);
  if (bracket?.[1]) {
    return bracket[1].toUpperCase();
  }
  const word = message.match(/\b(PGRST\d+)\b/i);
  return word?.[1]?.toUpperCase();
}

/**
 * Returns true for known “missing column / relation / schema cache” patterns.
 * Keep this conservative: unknown errors should not match.
 *
 * Do not treat arbitrary substrings (“schema cache” + “column”) as schema drift — that can
 * misclassify unrelated failures. Prefer PostgREST `PGRST204`, Postgres `42703`, and the
 * canonical “… in the schema cache” wording.
 */
export function isMissingDbSchemaColumnError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  const postgrestFromMessage = extractPostgrestCodeFromMessage(message);
  if (code === "PGRST204" || postgrestFromMessage === "PGRST204") {
    return true;
  }
  // PostgREST missing column, e.g. "Could not find the '…' column of '…' in the schema cache"
  if (
    m.includes("could not find") &&
    m.includes("in the schema cache") &&
    (m.includes("column") || m.includes("field"))
  ) {
    return true;
  }
  // SQLSTATE 42703 undefined_column (when exposed on the error object)
  if (code === "42703") {
    return true;
  }
  if (/\bcolumn\b[\s\S]*\bdoes not exist\b/i.test(message)) {
    return true;
  }
  // Undefined table: only when the missing relation is clearly `site_landing_settings` (avoid
  // matching unrelated "relation … does not exist" from FK/trigger chains).
  if (/\brelation\b[\s\S]*\bdoes not exist\b/i.test(message)) {
    return m.includes("site_landing_settings");
  }
  return false;
}

/**
 * Missing `site_id` on `site_global_settings` / `site_landing_settings` (STEP 8.9.1 migration).
 * Checked before {@link isMissingDbSchemaColumnError} so we don’t show the generic landing copy.
 */
export function isMissingSiteIdColumnError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  if (!m.includes("site_id")) {
    return false;
  }
  if (/\bcolumn\b[\s\S]*\bdoes not exist\b/i.test(message)) {
    return true;
  }
  if (code === "42703") {
    return true;
  }
  const postgrestFromMessage = extractPostgrestCodeFromMessage(message);
  if (postgrestFromMessage === "PGRST204" || m.includes("pgrst204")) {
    return true;
  }
  if (m.includes("could not find") && m.includes("in the schema cache")) {
    return true;
  }
  return false;
}

/**
 * Admin `/admin/site`: maps raw Supabase/Postgres errors to short German guidance when the DB is behind.
 * Falls back to `rawMessage` when unknown.
 */
export function friendlyAdminSiteDbError(rawMessage: string, code?: string): string {
  const resolvedCode = code ?? extractPostgrestCodeFromMessage(rawMessage);
  if (isMissingSiteIdColumnError(rawMessage, resolvedCode)) {
    return SITE_ID_SCHEMA_MISSING_MESSAGE_DE;
  }
  if (isMissingDbSchemaColumnError(rawMessage, resolvedCode)) {
    return SITE_LANDING_SCHEMA_MISSING_MESSAGE_DE;
  }
  return rawMessage;
}
