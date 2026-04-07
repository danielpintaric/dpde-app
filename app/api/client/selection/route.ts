import { NextRequest, NextResponse } from "next/server";
import { mutateClientImageSelection } from "@/lib/services/client-image-selection";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const project = typeof body.project === "string" ? body.project.trim() : "";
  const imageId = typeof body.imageId === "string" ? body.imageId.trim() : "";
  const actionRaw = typeof body.action === "string" ? body.action.trim().toLowerCase() : "toggle";

  const action =
    actionRaw === "select" || actionRaw === "unselect" || actionRaw === "toggle"
      ? actionRaw
      : null;

  if (!action) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  if (!token || !project || !imageId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await mutateClientImageSelection(token, project, imageId, action);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ selected: result.selected });
}
