import { ProjectImagesGridPanel } from "@/components/admin/project-images-grid-panel";
import { ProjectImagesSavedQueryStrip } from "@/components/admin/project-images-saved-query-strip";
import { ProjectImagesUploadDropzone } from "@/components/admin/project-images-upload-dropzone";
import type { Image, Project } from "@/types/project";

type Props = {
  project: Project;
  images: Image[];
  savedImageId?: string | null;
  /** Rechte Spalte im Projekt-Edit-Split: keine harte obere Trennlinie, engerer Rhythmus. */
  embedded?: boolean;
  /**
   * Nur für `embedded`: Intro (Strip, Text, Dropzone) und Raster getrennt,
   * damit Zeile 2 der Edit-Seite nur Raster+Inspector enthält.
   */
  embeddedParts?: "all" | "intro" | "grid";
};

export function ProjectImagesSection({
  project,
  images,
  savedImageId = null,
  embedded = false,
  embeddedParts = "all",
}: Props) {
  const intro = (
    <>
      <ProjectImagesSavedQueryStrip savedImageId={savedImageId} />
      <h2 className="mb-2 font-serif text-xl tracking-tight text-zinc-100">Images</h2>
      <p className={embedded ? "mb-5 text-sm leading-relaxed text-zinc-500" : "mb-6 text-sm text-zinc-500"}>
        Arrange the shoot like a contact sheet: drag to reorder, star the cover, set focal points on
        the tiles, and open details when you need copy or framing.
      </p>

      <ProjectImagesUploadDropzone projectId={project.id} projectSlug={project.slug} />
    </>
  );

  const grid = (
    <ProjectImagesGridPanel
      key={`${project.id}-${savedImageId ?? "no-saved"}`}
      project={project}
      images={images}
      savedImageId={savedImageId}
    />
  );

  if (embedded && embeddedParts === "intro") {
    return (
      <section className="min-w-0 border-t border-zinc-800/45 pt-10 lg:mt-0 lg:border-t-0 lg:pt-0">
        {intro}
      </section>
    );
  }

  if (embedded && embeddedParts === "grid") {
    return <section className="flex min-h-0 min-w-0 flex-col">{grid}</section>;
  }

  return (
    <section
      className={
        embedded
          ? "min-w-0 border-t border-zinc-800/45 pt-10 lg:mt-0 lg:border-t-0 lg:pt-0"
          : "mt-16 border-t border-zinc-800 pt-12"
      }
    >
      {intro}
      {grid}
    </section>
  );
}
