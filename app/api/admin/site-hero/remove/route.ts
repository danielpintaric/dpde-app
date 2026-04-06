import { NextResponse } from "next/server";
import { requireAdminUserForApi } from "@/lib/auth/admin-api-session";
import { logServerError } from "@/lib/server-log";
import { removeSiteHeroObjectIfPresent } from "@/lib/storage/site-hero-storage";
import { isSiteHeroStoragePath } from "@/lib/storage/site-hero-paths";

export async function POST(request: Request) {
  const auth = await requireAdminUserForApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON body expected." }, { status: 400 });
  }
  const storagePath =
    typeof body === "object" && body !== null && "storagePath" in body
      ? String((body as { storagePath: unknown }).storagePath ?? "").trim()
      : "";

  if (!storagePath || !isSiteHeroStoragePath(storagePath)) {
    return NextResponse.json({ error: "Invalid or missing storage path." }, { status: 400 });
  }

  try {
    await removeSiteHeroObjectIfPresent(storagePath);
    return NextResponse.json({ ok: true as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed.";
    logServerError("site-hero-remove", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
