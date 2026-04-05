/**
 * Clientseitiger Upload zu `/api/admin/project-images/upload` (gleiche Logik wie zuvor im Formular).
 */

export type UploadProjectImagesOk = { ok: true; uploadedCount: number };
export type UploadProjectImagesErr = { ok: false; error: string };

export type UploadProjectImagesResult = UploadProjectImagesOk | UploadProjectImagesErr;

function isOkPayload(data: unknown): data is UploadProjectImagesOk {
  return (
    typeof data === "object" &&
    data !== null &&
    "ok" in data &&
    (data as UploadProjectImagesOk).ok === true &&
    typeof (data as UploadProjectImagesOk).uploadedCount === "number"
  );
}

function errorFromPayload(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "error" in data) {
    const err = (data as { error: unknown }).error;
    return typeof err === "string" ? err : null;
  }
  return null;
}

export async function uploadProjectImagesFiles(
  projectId: string,
  projectSlug: string,
  files: File[],
): Promise<UploadProjectImagesResult> {
  if (files.length === 0) {
    return { ok: false, error: "Keine Dateien ausgewählt." };
  }

  const body = new FormData();
  body.set("projectId", projectId);
  body.set("projectSlug", projectSlug);
  for (const file of files) {
    body.append("files", file);
  }

  try {
    const res = await fetch("/api/admin/project-images/upload", {
      method: "POST",
      body,
    });

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      return {
        ok: false,
        error: errorFromPayload(data) ?? `Upload fehlgeschlagen (${res.status}).`,
      };
    }

    if (isOkPayload(data)) {
      return { ok: true, uploadedCount: data.uploadedCount };
    }

    return { ok: false, error: errorFromPayload(data) ?? "Unerwartete Server-Antwort." };
  } catch {
    return {
      ok: false,
      error: "Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.",
    };
  }
}
