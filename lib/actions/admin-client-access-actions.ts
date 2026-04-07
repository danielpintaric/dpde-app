"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import {
  insertClientAccessRow,
  updateClientAccessActive,
  updateClientAccessExpiresAt,
} from "@/lib/db/client-access-admin";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";

export type ClientAccessCreateState = {
  ok?: boolean;
  error?: string;
} | null;

function parseExpiresAt(formData: FormData): { ok: true; iso: string | null } | { ok: false; error: string } {
  const raw = String(formData.get("expires_at") ?? "").trim();
  if (raw === "") {
    return { ok: true, iso: null };
  }
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) {
    return { ok: false, error: "Enter a valid expiry date or leave it empty." };
  }
  return { ok: true, iso: d.toISOString() };
}

export async function createClientAccessAction(
  _prev: ClientAccessCreateState,
  formData: FormData,
): Promise<ClientAccessCreateState> {
  await requireAdminSession();

  if (!getOptionalSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not set. Required to manage client access." };
  }

  const clientName = String(formData.get("client_name") ?? "").trim();
  if (clientName.length === 0) {
    return { error: "Enter a client name." };
  }

  const projectIds = formData.getAll("project_ids").map((x) => String(x).trim()).filter(Boolean);
  if (projectIds.length === 0) {
    return { error: "Select at least one project." };
  }

  const expires = parseExpiresAt(formData);
  if (!expires.ok) {
    return { error: expires.error };
  }

  const isActive = formData.get("is_active") === "true";

  try {
    await insertClientAccessRow({
      siteId: DEFAULT_SITE_ID,
      clientName,
      projectIds,
      isActive,
      expiresAtIso: expires.iso,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create access.";
    return { error: msg };
  }

  revalidatePath("/admin/client-access");
  return { ok: true };
}

export async function setClientAccessActiveAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  if (!getOptionalSupabaseServiceRoleKey()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }
  const active = String(formData.get("active") ?? "") === "true";

  await updateClientAccessActive(id, active);
  revalidatePath("/admin/client-access");
}

export type ClientAccessExpiryState = { error?: string } | null;

export async function updateClientAccessExpiryAction(
  _prev: ClientAccessExpiryState,
  formData: FormData,
): Promise<ClientAccessExpiryState> {
  await requireAdminSession();
  if (!getOptionalSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Missing row." };
  }

  const expires = parseExpiresAt(formData);
  if (!expires.ok) {
    return { error: expires.error };
  }

  try {
    await updateClientAccessExpiresAt(id, expires.iso);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update expiry.";
    return { error: msg };
  }

  revalidatePath("/admin/client-access");
  return null;
}
