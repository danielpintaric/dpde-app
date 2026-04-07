import "server-only";

import { randomBytes } from "node:crypto";

import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { ClientAccessAdminRow } from "@/types/client-access";

function isUniqueViolation(message: string): boolean {
  return message.includes("23505") || /duplicate key|unique constraint/i.test(message);
}

export function parseProjectIdsColumn(raw: unknown): string[] {
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

export async function listClientAccessBySiteId(siteId: string): Promise<ClientAccessAdminRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("client_access")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw supabaseReadError("client_access list", error.message, error.code);
  }

  return (data ?? []) as ClientAccessAdminRow[];
}

const TOKEN_BYTES = 32;
const MAX_TOKEN_INSERT_ATTEMPTS = 10;

function generateAccessToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export type InsertClientAccessInput = {
  siteId: string;
  clientName: string;
  projectIds: string[];
  isActive: boolean;
  expiresAtIso: string | null;
};

export async function insertClientAccessRow(input: InsertClientAccessInput): Promise<ClientAccessAdminRow> {
  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < MAX_TOKEN_INSERT_ATTEMPTS; attempt++) {
    const token = generateAccessToken();
    const { data, error } = await supabase
      .from("client_access")
      .insert({
        site_id: input.siteId,
        token,
        client_name: input.clientName,
        project_ids: input.projectIds,
        is_active: input.isActive,
        expires_at: input.expiresAtIso,
        updated_at: now,
      })
      .select("*")
      .single();

    if (!error && data) {
      return data as ClientAccessAdminRow;
    }

    if (error && isUniqueViolation(error.message)) {
      continue;
    }

    if (error) {
      throw supabaseReadError("client_access insert", error.message, error.code);
    }
  }

  throw new Error("Could not generate a unique access token. Try again.");
}

export async function updateClientAccessActive(id: string, isActive: boolean): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("client_access")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw supabaseReadError("client_access update active", error.message, error.code);
  }
}

export async function updateClientAccessExpiresAt(id: string, expiresAtIso: string | null): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("client_access")
    .update({ expires_at: expiresAtIso, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw supabaseReadError("client_access update expires", error.message, error.code);
  }
}
