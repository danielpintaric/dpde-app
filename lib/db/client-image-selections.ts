import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";

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

export function canPersistClientImageSelections(): boolean {
  return Boolean(getOptionalSupabaseServiceRoleKey());
}

export async function listSelectionImageIdsForAccess(accessId: string): Promise<string[]> {
  if (!canPersistClientImageSelections()) {
    return [];
  }
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
    console.error("client_image_selections list:", e);
    return [];
  }
}

export async function countSelectionsForAccess(accessId: string): Promise<number> {
  if (!canPersistClientImageSelections()) {
    return 0;
  }
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
    console.error("client_image_selections count:", e);
    return 0;
  }
}
