import NextImage from "next/image";
import { deleteProjectImageAction, setProjectCoverImageAction } from "@/lib/actions/admin-image-actions";
import { ProjectImageDetailsForm } from "@/components/admin/project-image-details-form";
import { ProjectImagesSavedQueryStrip } from "@/components/admin/project-images-saved-query-strip";
import { ADMIN_IMAGE_ASPECT_PRESETS } from "@/lib/constants/admin-image-aspects";
import { ProjectImagesUploadForm } from "@/components/admin/project-images-upload-form";
import { DEFAULT_UPLOAD_ASPECT_CLASS } from "@/lib/db/image-mutations";
import { adminImagePreviewUrl } from "@/lib/services/admin-images";
import type { Image, Project } from "@/types/project";

type Props = {
  project: Project;
  images: Image[];
  savedImageId?: string | null;
};

function aspectSelectValue(img: Image): string {
  return img.aspectClass?.trim() || DEFAULT_UPLOAD_ASPECT_CLASS;
}

export function ProjectImagesSection({ project, images, savedImageId = null }: Props) {
  const presetValues = new Set(ADMIN_IMAGE_ASPECT_PRESETS.map((p) => p.value));

  return (
    <section className="mt-16 border-t border-zinc-800 pt-12">
      <ProjectImagesSavedQueryStrip savedImageId={savedImageId} />
      <h2 className="mb-2 font-serif text-xl tracking-tight text-zinc-100">Images</h2>
      <p className="mb-6 text-sm text-zinc-500">
        Upload, set cover, and edit caption, alt text, frame ratio, focal position, and sort. Legacy
        rows with external URLs stay editable; storage delete only runs for bucket paths.
      </p>

      <ProjectImagesUploadForm projectId={project.id} projectSlug={project.slug} />

      {images.length === 0 ? (
        <p className="text-sm text-zinc-600">No images yet for this project.</p>
      ) : (
        <ul className="space-y-6">
          {images.map((img) => {
            const preview = adminImagePreviewUrl(img);
            const isCover = project.coverImageId === img.id;
            const aspectValue = aspectSelectValue(img);
            const showCustomAspect = !presetValues.has(aspectValue);
            const identity = img.filename || img.storagePath || img.id.slice(0, 8);

            return (
              <li
                key={img.id}
                className="border border-zinc-800/80 p-4 sm:grid sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-5"
              >
                <div className="relative mb-4 h-32 w-full max-w-[200px] shrink-0 overflow-hidden bg-zinc-900 sm:mb-0">
                  <NextImage
                    src={preview}
                    alt=""
                    fill
                    sizes="200px"
                    unoptimized
                    className="object-cover object-center"
                  />
                </div>

                <div className="min-w-0 space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800/60 pb-2">
                    <span className="truncate font-mono text-xs text-zinc-300" title={identity}>
                      {identity}
                    </span>
                    {isCover ? (
                      <span className="shrink-0 rounded bg-amber-950/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200/90">
                        Cover
                      </span>
                    ) : null}
                    {img.externalUrl?.trim() ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-600">
                        External / legacy
                      </span>
                    ) : null}
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-zinc-600">
                      sort {img.sortOrder}
                    </span>
                  </div>

                  {img.storagePath ? (
                    <p className="truncate font-mono text-[11px] text-zinc-600" title={img.storagePath}>
                      {img.storagePath}
                    </p>
                  ) : null}

                  <ProjectImageDetailsForm
                    project={project}
                    image={img}
                    aspectValue={aspectValue}
                    showCustomAspect={showCustomAspect}
                    justSaved={savedImageId === img.id}
                  />
                  <div className="flex flex-wrap gap-2 border-t border-zinc-800/40 pt-3">
                    {!isCover ? (
                      <form action={setProjectCoverImageAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="imageId" value={img.id} />
                        <input type="hidden" name="projectSlug" value={project.slug} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:border-amber-900/50 hover:text-amber-200/90"
                        >
                          Set as cover
                        </button>
                      </form>
                    ) : null}

                    <form action={deleteProjectImageAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="projectSlug" value={project.slug} />
                      <button
                        type="submit"
                        className="cursor-pointer rounded border border-red-900/40 px-2 py-1 text-xs text-red-300/90 hover:border-red-800 hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
