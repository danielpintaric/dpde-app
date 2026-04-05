/**
 * One-shot seed: static `PORTFOLIO_PROJECTS` → Supabase `projects` + `images`.
 *
 * Requires:
 *   - Migrations applied (incl. portfolio_public_fields)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (server; bypasses RLS for insert)
 *
 * Usage:
 *   PORTFOLIO_IMPORT_FORCE=1 npm run portfolio:import
 *
 * PORTFOLIO_IMPORT_FORCE=1 clears existing rows (cover FK nulled first) then re-imports.
 */

import { createClient } from "@supabase/supabase-js";
import { PORTFOLIO_PROJECTS } from "../lib/portfolio-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the import.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

console.info("[import-debug] Script started (Supabase client created).");
console.info(
  "[import-debug] PORTFOLIO_PROJECTS.length =",
  PORTFOLIO_PROJECTS.length,
);
console.info(
  "[import-debug] Project slugs:",
  PORTFOLIO_PROJECTS.map((p) => p.slug).join(", ") || "(none)",
);

function filenameFromSrc(src: string, index: number): string {
  if (src.startsWith("/")) {
    const base = src.split("/").pop() ?? `local-${index}`;
    return base.replace(/[^a-zA-Z0-9._-]+/g, "-") || `frame-${index}.jpg`;
  }
  try {
    const u = new URL(src);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    if (seg) {
      return seg.split("?")[0] ?? `frame-${index}.jpg`;
    }
  } catch {
    /* ignore */
  }
  return `frame-${index}.jpg`;
}

async function assertEmptyOrForce() {
  const { count, error: countError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error(countError.message);
    process.exit(1);
  }

  const existingCount = count ?? 0;
  console.info("[import-debug] assertEmptyOrForce: existing project count =", existingCount);

  const hasRows = existingCount > 0;
  if (!hasRows) {
    console.info(
      "[import-debug] assertEmptyOrForce: no existing projects — proceeding with import.",
    );
    return;
  }

  if (process.env.PORTFOLIO_IMPORT_FORCE !== "1") {
    console.info(
      "[import-debug] assertEmptyOrForce: aborting — database already has projects (set PORTFOLIO_IMPORT_FORCE=1 to replace).",
    );
    console.error(
      "Database already has projects. Set PORTFOLIO_IMPORT_FORCE=1 to replace them.",
    );
    process.exit(1);
  }

  console.info(
    "[import-debug] assertEmptyOrForce: PORTFOLIO_IMPORT_FORCE=1 — clearing existing rows, then proceeding.",
  );

  const { error: u1 } = await supabase
    .from("projects")
    .update({ cover_image_id: null })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (u1) {
    console.error("Clear cover_image_id:", u1.message);
    process.exit(1);
  }

  const { error: d1 } = await supabase
    .from("images")
    .delete()
    .not("id", "is", null);
  if (d1) {
    console.error("Delete images:", d1.message);
    process.exit(1);
  }

  const { error: d2 } = await supabase
    .from("projects")
    .delete()
    .not("id", "is", null);
  if (d2) {
    console.error("Delete projects:", d2.message);
    process.exit(1);
  }

  console.warn("Existing portfolio rows removed (PORTFOLIO_IMPORT_FORCE=1).");
}

async function main() {
  console.info("[import-debug] main() entered.");
  await assertEmptyOrForce();

  for (let pi = 0; pi < PORTFOLIO_PROJECTS.length; pi++) {
    const p = PORTFOLIO_PROJECTS[pi]!;

    console.info(`[import-debug] Before project insert: slug="${p.slug}" (index ${pi}).`);

    const { data: insertedProject, error: pe } = await supabase
      .from("projects")
      .insert({
        slug: p.slug,
        title: p.title,
        subtitle: null,
        description: p.intro,
        visibility: "public",
        sort_order: pi,
        category: p.category,
        year: p.year,
        location: p.location,
        layout_type: p.layoutType,
      })
      .select("id")
      .single();

    if (pe || !insertedProject) {
      console.error(`Project insert failed (${p.slug}):`, pe?.message ?? pe);
      process.exit(1);
    }

    console.info(
      `[import-debug] After project insert OK: slug="${p.slug}" id=${insertedProject.id}.`,
    );

    const projectId = insertedProject.id as string;
    const imageIdBySort: string[] = [];

    for (let ii = 0; ii < p.images.length; ii++) {
      const img = p.images[ii]!;
      const storagePath = `legacy/${p.slug}/${ii}-${filenameFromSrc(img.src, ii)}`;
      const filename = filenameFromSrc(img.src, ii);
      const externalUrl = img.src;

      console.info(
        `[import-debug] Before image insert: project="${p.slug}" image index=${ii} file="${filename}".`,
      );

      const { data: insertedImage, error: ie } = await supabase
        .from("images")
        .insert({
          project_id: projectId,
          storage_path: storagePath,
          filename,
          alt_text: null,
          caption: img.caption ?? null,
          width: null,
          height: null,
          sort_order: ii,
          external_url: externalUrl,
          aspect_class: img.aspectClass,
          object_position: img.objectPosition ?? null,
        })
        .select("id")
        .single();

      if (ie || !insertedImage) {
        console.error(`Image insert failed (${p.slug} #${ii}):`, ie?.message ?? ie);
        process.exit(1);
      }

      console.info(
        `[import-debug] After image insert OK: project="${p.slug}" index=${ii} id=${insertedImage.id}.`,
      );

      imageIdBySort.push(insertedImage.id as string);
    }

    const coverIdx = p.images.findIndex((im) => im.src === p.coverImage);
    const coverId =
      coverIdx >= 0 ? imageIdBySort[coverIdx] : imageIdBySort[0];

    if (!coverId) {
      console.error(`No images for project ${p.slug}`);
      process.exit(1);
    }

    const { error: ue } = await supabase
      .from("projects")
      .update({ cover_image_id: coverId })
      .eq("id", projectId);

    if (ue) {
      console.error(`cover_image_id update failed (${p.slug}):`, ue.message);
      process.exit(1);
    }

    console.info(`Imported project "${p.slug}" (${p.images.length} images).`);
  }

  if (PORTFOLIO_PROJECTS.length === 0) {
    console.info(
      "[import-debug] No projects in PORTFOLIO_PROJECTS — loop did not run; 0 inserts.",
    );
  }

  console.info("Done. Set PORTFOLIO_DATA=supabase or use auto once env is configured.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
