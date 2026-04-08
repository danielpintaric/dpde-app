import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/db/supabase-env";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { getVercelDeploymentEnv, isProductionDeploy } from "@/lib/server-deployment";
import { logServerError } from "@/lib/server-log";

/**
 * Service-Role — zentrale Fehlertexte (nur diese Datei). Validierung nur in
 * `createSupabaseServiceRoleClient()`. Produktions-Env wurde gegenüber lokal / Vercel
 * abgeglichen; die Warnung `service-role-suspicious-length` bleibt für künftige
 * Konfigurationsfehler. Deploy-Checkliste: docs/supabase-service-role-deployment-verification.md
 */

const INVALID_SERVICE_ROLE_KEY =
  "SUPABASE_SERVICE_ROLE_KEY is not a valid service_role key for server-side storage operations";

/** Nur Diagnose: typische Supabase-`service_role`-JWTs sind deutlich länger (oft ~219 Zeichen). Kein Block — nur Log. */
const LEGACY_SUPABASE_SERVICE_ROLE_JWT_MIN_CHARS = 200;

/** Öffentliche Kurztexte für 503 — ohne Secrets; Downloads, Client-Area, Selection-API. */
export const SERVICE_ROLE_PUBLIC_MESSAGE_MISSING =
  "Service unavailable: SUPABASE_SERVICE_ROLE_KEY is not set for this deployment (e.g. Vercel Production env).";

export const SERVICE_ROLE_PUBLIC_MESSAGE_INVALID =
  "Service unavailable: SUPABASE_SERVICE_ROLE_KEY must be the service_role secret from Supabase Dashboard → API (not the anon key).";

export class SupabaseServiceRoleConfigurationError extends Error {
  readonly code: "missing" | "invalid";

  readonly publicMessage: string;

  constructor(code: "missing" | "invalid", message: string, publicMessage: string) {
    super(message);
    this.name = "SupabaseServiceRoleConfigurationError";
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export function isSupabaseServiceRoleConfigurationError(
  e: unknown,
): e is SupabaseServiceRoleConfigurationError {
  return e instanceof SupabaseServiceRoleConfigurationError;
}

/** Dekodiert nur den JWT-Payload (Mitte) lokal — keine Signaturprüfung, kein Secret-Log. */
function parseJwtPayloadFromKey(key: string): {
  role?: string;
  iss?: string;
  ref?: string;
} | null {
  const parts = key.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replaceAll("_", "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as Record<string, unknown>;
    const role = typeof json.role === "string" ? json.role : undefined;
    const iss = typeof json.iss === "string" ? json.iss : undefined;
    const refFromRef = typeof json.ref === "string" ? json.ref : undefined;
    const refFromProject =
      typeof json.project_ref === "string" ? json.project_ref : undefined;
    const ref = refFromRef ?? refFromProject;
    return { role, iss, ref };
  } catch {
    return null;
  }
}

function logInvalidServiceRoleDiagnostics(internalHint: string): void {
  const key = getOptionalSupabaseServiceRoleKey();
  const safe =
    `present=${Boolean(key)} length=${key?.length ?? 0} ` +
    `VERCEL_ENV=${getVercelDeploymentEnv() ?? "n/a"} NODE_ENV=${process.env.NODE_ENV ?? "n/a"}`;
  logServerError(
    "supabase-service-role",
    `Invalid or missing service role key (${internalHint}) · ${safe}`,
  );
}

export type SupabaseServiceRoleClientResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; status: 503; message: string };

/**
 * Einziger Einstieg für „vertrauenswürdige“ Server-Pfade, die einen gültigen Service-Role-Key brauchen.
 * Kein Fallback auf anon/session — bei fehlendem oder ungültigem Key: 503-Text.
 */
export function getSupabaseServiceRoleClientOr503(): SupabaseServiceRoleClientResult {
  try {
    return { ok: true, client: createSupabaseServiceRoleClient() };
  } catch (e) {
    if (isSupabaseServiceRoleConfigurationError(e)) {
      return { ok: false, status: 503, message: e.publicMessage };
    }
    return {
      ok: false,
      status: 503,
      message: "Service unavailable due to a server Supabase configuration error.",
    };
  }
}

/**
 * Nur für Storage-/ZIP-Download-Pfade: knappe Production-Diagnose (keine Secrets).
 */
export function logSupabaseServiceRoleProductionDiagnostics(scope: string): void {
  if (!isProductionDeploy()) {
    return;
  }
  const key = getOptionalSupabaseServiceRoleKey();
  console.warn(
    `[${scope}]`,
    `service_role key present: ${Boolean(key)} · service_role key length: ${key?.length ?? 0} · VERCEL_ENV=${getVercelDeploymentEnv() ?? "n/a"} · NODE_ENV=${process.env.NODE_ENV ?? "n/a"}`,
  );
}

/**
 * Supabase mit Service-Role — umgeht Storage- und DB-RLS.
 * Nur in vertrauenswürdigen Server-Pfaden nach App-seitiger Prüfung verwenden
 * (z. B. {@link uploadOriginalToProjectBucket}).
 *
 * Verwendet ausschließlich `process.env.SUPABASE_SERVICE_ROLE_KEY` (siehe {@link getOptionalSupabaseServiceRoleKey}).
 */
export function createSupabaseServiceRoleClient(): SupabaseClient {
  const { url } = getSupabasePublicConfig();
  const key = getOptionalSupabaseServiceRoleKey();

  if (key && key.length < LEGACY_SUPABASE_SERVICE_ROLE_JWT_MIN_CHARS) {
    console.warn(
      `[env-check] service-role-suspicious-length present=true length=${key.length} expected_legacy_jwt_min_chars=${LEGACY_SUPABASE_SERVICE_ROLE_JWT_MIN_CHARS} note=Too short for typical Supabase service_role JWT`,
    );
  }

  const parsed = key ? parseJwtPayloadFromKey(key) : null;

  if (!key) {
    logInvalidServiceRoleDiagnostics("missing");
    throw new SupabaseServiceRoleConfigurationError(
      "missing",
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for admin storage (set server-side, e.g. Vercel env).",
      SERVICE_ROLE_PUBLIC_MESSAGE_MISSING,
    );
  }

  const jwtRole = typeof parsed?.role === "string" ? parsed.role : undefined;

  if (jwtRole !== "service_role") {
    logInvalidServiceRoleDiagnostics(
      jwtRole === undefined ? "not a valid Supabase JWT (wrong format or not service_role)" : `JWT role=${jwtRole}`,
    );
    const hint =
      jwtRole === undefined
        ? " Copy the service_role secret from Supabase Dashboard → Project Settings → API (not anon/public)."
        : ` JWT payload has role "${jwtRole}"; required role is "service_role".`;
    throw new SupabaseServiceRoleConfigurationError(
      "invalid",
      `${INVALID_SERVICE_ROLE_KEY}.${hint}`,
      SERVICE_ROLE_PUBLIC_MESSAGE_INVALID,
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
