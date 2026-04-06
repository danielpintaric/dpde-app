import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/db/supabase-env";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { isProductionDeploy } from "@/lib/server-deployment";
import { logServerWarning } from "@/lib/server-log";

const INVALID_SERVICE_ROLE_KEY =
  "SUPABASE_SERVICE_ROLE_KEY is not a valid service_role key for server-side storage operations";

/** Liest `role` aus dem Supabase-JWT ohne Signaturprüfung. */
function jwtRoleFromSupabaseKey(key: string): string | undefined {
  const parts = key.trim().split(".");
  if (parts.length !== 3) return undefined;
  try {
    let b64 = parts[1].replace(/-/g, "+").replaceAll("_", "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as { role?: string };
    return typeof json.role === "string" ? json.role : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Supabase mit Service-Role — umgeht Storage- und DB-RLS.
 * Nur in vertrauenswürdigen Server-Pfaden nach App-seitiger Admin-Prüfung verwenden
 * (z. B. {@link uploadOriginalToProjectBucket}).
 */
export function createSupabaseServiceRoleClient(): SupabaseClient {
  const { url } = getSupabasePublicConfig();
  const key = getOptionalSupabaseServiceRoleKey();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for admin storage (set server-side, e.g. Vercel env).",
    );
  }

  const jwtRole = jwtRoleFromSupabaseKey(key);

  if (jwtRole !== "service_role") {
    if (process.env.NODE_ENV === "development" && !isProductionDeploy()) {
      logServerWarning(
        "supabase-service-role",
        `createSupabaseServiceRoleClient: rejected — JWT role=${jwtRole ?? "unparseable or missing (not a 3-part JWT)"}`,
      );
    }
    const hint =
      jwtRole === undefined
        ? " Copy the service_role secret from Supabase Dashboard → Project Settings → API (not anon/public)."
        : ` JWT payload has role "${jwtRole}"; required role is "service_role".`;
    throw new Error(`${INVALID_SERVICE_ROLE_KEY}.${hint}`);
  }

  if (process.env.NODE_ENV === "development" && !isProductionDeploy()) {
    logServerWarning("supabase-service-role", "createSupabaseServiceRoleClient: JWT role=service_role");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
