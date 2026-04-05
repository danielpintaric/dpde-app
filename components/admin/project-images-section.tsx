import { ProjectImagesGridPanel } from "@/components/admin/project-images-grid-panel";
import { ProjectImagesSavedQueryStrip } from "@/components/admin/project-images-saved-query-strip";
import { ProjectImagesUploadDropzone } from "@/components/admin/project-images-upload-dropzone";
import type { Image, Project } from "@/types/project";

type Props = {
  project: Project;
  images: Image[];
  savedImageId?: string | null;
};

export function ProjectImagesSection({ project, images, savedImageId = null }: Props) {
  return (
    <section className="mt-16 border-t border-zinc-800 pt-12">
      <ProjectImagesSavedQueryStrip savedImageId={savedImageId} />
      <h2 className="mb-2 font-serif text-xl tracking-tight text-zinc-100">Images</h2>
      <p className="mb-6 text-sm text-zinc-500">
        Upload, set cover, and edit caption, alt text, frame ratio, focal position, and sort. Legacy
        rows with external URLs stay editable; storage delete only runs for bucket paths.
      </p>

      <ProjectImagesUploadDropzone projectId={project.id} projectSlug={project.slug} />

      <ProjectImagesGridPanel
        key={`${project.id}-${savedImageId ?? "no-saved"}`}
        project={project}
        images={images}
        savedImageId={savedImageId}
      />
    </section>
  );
}
