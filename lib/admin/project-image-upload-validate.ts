/** Erlaubte Content-Types für Projektbild-Uploads (Admin). */
export const ALLOWED_PROJECT_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function extensionFromName(name: string): string {
  const leaf = name.replace(/^\//, "").split(/[/\\]/).pop() || "";
  const dot = leaf.lastIndexOf(".");
  if (dot < 0) return "";
  return leaf.slice(dot).toLowerCase();
}

/** Max. Größe pro Datei (Bytes); schützt vor übergroßen Requests in Serverless-Umgebungen. */
export const MAX_PROJECT_IMAGE_BYTES = 12 * 1024 * 1024;

export function isAllowedProjectImageFile(file: File): boolean {
  const type = file.type.trim().toLowerCase();
  if (type && ALLOWED_PROJECT_IMAGE_MIME_TYPES.has(type)) {
    return true;
  }
  const ext = extensionFromName(file.name);
  const mapped = ext ? EXT_TO_MIME[ext] : undefined;
  return Boolean(mapped && ALLOWED_PROJECT_IMAGE_MIME_TYPES.has(mapped));
}

export function filterValidProjectImageFiles(files: File[]): {
  accepted: File[];
  rejectedReason?: string;
} {
  const accepted: File[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_PROJECT_IMAGE_BYTES) {
      return {
        accepted: [],
        rejectedReason: `Datei zu groß (max. ${Math.round(MAX_PROJECT_IMAGE_BYTES / (1024 * 1024))} MB pro Bild).`,
      };
    }
    if (!isAllowedProjectImageFile(file)) {
      return {
        accepted: [],
        rejectedReason:
          "Nur Bilder im Format JPEG, PNG, WebP, GIF oder AVIF sind erlaubt.",
      };
    }
    accepted.push(file);
  }
  return { accepted };
}
