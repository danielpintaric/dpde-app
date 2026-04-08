import "server-only";

import {
  createSupabaseServiceRoleClient,
  getSupabaseServiceRoleClientOr503,
  isSupabaseServiceRoleConfigurationError,
} from "@/lib/db/supabase-service-role";

/** PostgREST: relation not exposed / not in schema cache (migration not applied). */
function isMissingClientImageSelectionsRelation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205") {
    return true;
  }
  const m = error.message ?? "";
  return m.includes("client_image_selections") && m.includes("schema cache");
}

let warnedMissingClientImageSelectionsTable = false;

function warnMissingTableOnce(): void {
  if (warnedMissingClientImageSelectionsTable || process.env.NODE_ENV !== "development") {
    return;
  }
  warnedMissingClientImageSelectionsTable = true;
  console.warn(
    "[dpde] Tabelle client_image_selections fehlt in der DB — Migration anwenden: supabase/migrations/20260420120000_client_image_selections.sql",
  );
}

/** True only if a valid service_role key is configured (kein bloßes Trim-String). */
export function canPersistClientImageSelections(): boolean {
  return getSupabaseServiceRoleClientOr503().ok;
}

export async function listSelectionImageIdsForAccess(accessId: string): Promise<string[]> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("client_image_selections")
      .select("image_id")
      .eq("client_access_id", accessId);

    if (error) {
      if (isMissingClientImageSelectionsRelation(error)) {
        warnMissingTableOnce();
        return [];
      }
      console.error("client_image_selections list:", error.message);
      return [];
    }
    const out: string[] = [];
    for (const row of data ?? []) {
      const id = (row as { image_id?: string }).image_id?.trim();
      if (id) {
        out.push(id);
      }
    }
    return out;
  } catch (e) {
    if (isSupabaseServiceRoleConfigurationError(e)) {
      throw e;
    }
    console.error("client_image_selections list:", e);
    return [];
  }
}

export async function countSelectionsForAccess(accessId: string): Promise<number> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { count, error } = await supabase
      .from("client_image_selections")
      .select("*", { count: "exact", head: true })
      .eq("client_access_id", accessId);

    if (error) {
      if (isMissingClientImageSelectionsRelation(error)) {
        warnMissingTableOnce();
        return 0;
      }
      console.error("client_image_selections count:", error.message);
      return 0;
    }
    return typeof count === "number" ? count : 0;
  } catch (e) {
    if (isSupabaseServiceRoleConfigurationError(e)) {
      throw e;
    }
    console.error("client_image_selections count:", e);
    return 0;
  }
}
