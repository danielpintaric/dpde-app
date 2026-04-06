import { NextResponse } from "next/server";
import { revalidatePortfolioSync } from "@/lib/admin/revalidate-portfolio-sync";
import { filterValidProjectImageFiles } from "@/lib/admin/project-image-upload-validate";
import { requireAdminUserForApi } from "@/lib/auth/admin-api-session";
import { logServerError } from "@/lib/server-log";
import { uploadFilesToProject } from "@/lib/services/admin-images";

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

  const projectId = String(formData.get("projectId") ?? "").trim();
  const projectSlugRaw = String(formData.get("projectSlug") ?? "").trim();
  const projectSlug = projectSlugRaw || null;

  if (!projectId) {
    return NextResponse.json({ error: "Missing project id." }, { status: 400 });
  }

  const rawFiles = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (rawFiles.length === 0) {
    return NextResponse.json({ error: "No files selected." }, { status: 400 });
  }

  const { accepted, rejectedReason } = filterValidProjectImageFiles(rawFiles);
  if (rejectedReason) {
    return NextResponse.json({ error: rejectedReason }, { status: 400 });
  }
  if (accepted.length === 0) {
    return NextResponse.json(
      { error: "No valid image files (JPEG, PNG, WebP, GIF, AVIF)." },
      { status: 400 },
    );
  }

  try {
    await uploadFilesToProject(projectId, accepted);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    logServerError("admin-project-image-upload", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  revalidatePortfolioSync(projectId, projectSlug);

  return NextResponse.json({
    ok: true as const,
    uploadedCount: accepted.length,
  });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
