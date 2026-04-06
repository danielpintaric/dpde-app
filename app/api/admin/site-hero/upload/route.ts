import { NextResponse } from "next/server";
import { filterValidProjectImageFiles } from "@/lib/admin/project-image-upload-validate";
import { requireAdminUserForApi } from "@/lib/auth/admin-api-session";
import { logServerError } from "@/lib/server-log";
import { removeSiteHeroObjectIfPresent, uploadSiteHeroImage } from "@/lib/storage/site-hero-storage";
import { isSiteHeroStoragePath, type SiteHeroSlot } from "@/lib/storage/site-hero-paths";

function parseSlot(raw: string): SiteHeroSlot | null {
  const n = parseInt(raw, 10);
  if (n === 1 || n === 2 || n === 3 || n === 4) {
    return n;
  }
  return null;
}

export async function POST(request: Request) {
  const auth = await requireAdminUserForApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body (FormData expected)." },
      { status: 400 },
    );
  }

  const slot = parseSlot(String(formData.get("slot") ?? ""));
  if (slot == null) {
    return NextResponse.json({ error: "Invalid slot (use 1, 2, 3, or 4)." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file selected." }, { status: 400 });
  }

  const { accepted, rejectedReason } = filterValidProjectImageFiles([file]);
  if (rejectedReason || accepted.length === 0) {
    return NextResponse.json(
      { error: rejectedReason ?? "Invalid image file." },
      { status: 400 },
    );
  }

  const previousPath = String(formData.get("previousStoragePath") ?? "").trim();
  if (previousPath && !isSiteHeroStoragePath(previousPath)) {
    return NextResponse.json({ error: "Invalid previous storage path." }, { status: 400 });
  }

  try {
    const result = await uploadSiteHeroImage(slot, accepted[0]!);
    if (previousPath && previousPath !== result.storagePath) {
      try {
        await removeSiteHeroObjectIfPresent(previousPath);
      } catch (removeErr) {
        logServerError(
          "site-hero-upload-cleanup",
          removeErr instanceof Error ? removeErr.message : String(removeErr),
        );
      }
    }
    return NextResponse.json({
      ok: true as const,
      publicUrl: result.publicUrl,
      storagePath: result.storagePath,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    logServerError("site-hero-upload", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
