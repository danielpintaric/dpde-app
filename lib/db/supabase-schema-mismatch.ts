/**
 * Detects PostgREST / Postgres errors that usually mean the DB schema is behind
 * the app (migration not applied, or stale schema cache).
 */

export const SITE_LANDING_SCHEMA_MISSING_MESSAGE_DE =
  "Die Home-Content-Felder sind in der Datenbank noch nicht verfügbar. Bitte die aktuelle Supabase-Migration für site_landing_settings anwenden und die Seite neu laden.";

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
 */
export function isMissingDbSchemaColumnError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  if (code === "PGRST204") {
    return true;
  }
  if (m.includes("pgrst204")) {
    return true;
  }
  if (m.includes("schema cache") && (m.includes("column") || m.includes("field"))) {
    return true;
  }
  if (/\bcolumn\b[\s\S]*\bdoes not exist\b/i.test(message)) {
    return true;
  }
  if (/\brelation\b[\s\S]*\bdoes not exist\b/i.test(message)) {
    return true;
  }
  if (
    m.includes("could not find") &&
    m.includes("column") &&
    (m.includes("site_landing_settings") || m.includes("schema cache"))
  ) {
    return true;
  }
  return false;
}
