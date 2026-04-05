"use server";

/** Server-side trace for local debugging of admin sign-in failures (no auth change). */
export async function logAdminLoginAuthError(payload: {
  kind: "supabase" | "exception";
  message: string;
  status?: number;
  name?: string;
}) {
  console.error("[admin login] Auth error (temporary debug log)", payload);
}
