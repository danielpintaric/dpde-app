import "server-only";

import { createSupabasePublicClient } from "@/lib/db/supabase-public";

export type ClientAccessTokenRpcStatus =
  | "ok"
  | "invalid"
  | "not_found"
  | "inactive"
  | "expired";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseUuid(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const s = raw.trim();
  return UUID_RE.test(s) ? s : null;
}

export type ClientAccessTokenLookup =
  | {
      status: "ok";
      /** Present when `fetch_client_access_by_token` returns `access_id` (after migrations). */
      accessId?: string;
      siteId: string;
      clientName: string | null;
      projectIds: string[];
    }
  | { status: Exclude<ClientAccessTokenRpcStatus, "ok"> };

function parseProjectIdsJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === "string" && x.trim().length > 0) {
      out.push(x.trim());
    }
  }
  return out;
}

/**
 * Validates a share token via `fetch_client_access_by_token` (anon RPC; row is not exposed to clients).
 */
export async function lookupClientAccessByToken(token: string): Promise<ClientAccessTokenLookup> {
  const trimmed = token.trim();
  if (trimmed.length === 0) {
    return { status: "invalid" };
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("fetch_client_access_by_token", {
    p_token: trimmed,
  });

  if (error) {
    console.error("fetch_client_access_by_token:", error.message);
    return { status: "not_found" };
  }

  const row = data as Record<string, unknown> | null;
  if (!row || typeof row !== "object") {
    return { status: "not_found" };
  }

  const status = row.status;
  if (status === "ok") {
    const accessId = parseUuid(row.access_id) ?? undefined;
    const siteRaw = row.site_id;
    const siteId =
      typeof siteRaw === "string" && siteRaw.trim().length > 0 ? siteRaw.trim() : "default";
    const clientNameRaw = row.client_name;
    const clientName =
      typeof clientNameRaw === "string" && clientNameRaw.trim().length > 0
        ? clientNameRaw.trim()
        : null;
    const projectIds = parseProjectIdsJson(row.project_ids);
    return { status: "ok", accessId, siteId, clientName, projectIds };
  }

  if (
    status === "invalid" ||
    status === "not_found" ||
    status === "inactive" ||
    status === "expired"
  ) {
    return { status };
  }

  return { status: "not_found" };
}
