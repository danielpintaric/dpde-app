import "server-only";

import type { ClientAccessTokenLookup } from "@/lib/db/client-access-token";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";

type OkLookup = Extract<ClientAccessTokenLookup, { status: "ok" }>;

/**
 * When the anon RPC does not return `access_id` (older DB function), resolve the row
 * with the service role so selections and counts still work.
 */
export async function resolveClientAccessForSelections(
  token: string,
  lookup: OkLookup,
): Promise<{ accessId: string; siteId: string } | null> {
  if (lookup.accessId) {
    return { accessId: lookup.accessId, siteId: lookup.siteId };
  }
  if (!getOptionalSupabaseServiceRoleKey()) {
    return null;
  }
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("client_access")
      .select("id, site_id")
      .eq("token", token.trim())
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    const row = data as { id?: string; site_id?: string | null };
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (!id) {
      return null;
    }
    const siteRaw = row.site_id;
    const siteId =
      typeof siteRaw === "string" && siteRaw.trim().length > 0 ? siteRaw.trim() : "default";
    return { accessId: id, siteId };
  } catch (e) {
    console.error("resolveClientAccessForSelections:", e);
    return null;
  }
}
