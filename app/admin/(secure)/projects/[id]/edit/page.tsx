import { notFound } from "next/navigation";
import { updateProjectAction } from "@/lib/actions/admin-project-actions";
import { ProjectEditorGlobalStatus } from "@/components/admin/project-editor-global-status";
import { ProjectEditorMetaLine } from "@/components/admin/project-editor-meta-line";
import { ProjectEditorPageWrapper } from "@/components/admin/project-editor-page-wrapper";
import { ProjectEditorWorkflowNav } from "@/components/admin/project-editor-workflow-nav";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectImagesSection } from "@/components/admin/project-images-section";
import { listAdminProjectImages } from "@/lib/services/admin-images";
import { getAdminProjectById, listAdminProjects } from "@/lib/services/admin-projects";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminEditProjectPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const savedImageId = typeof saved === "string" && saved.trim() !== "" ? saved.trim() : null;
  const project = await getAdminProjectById(id);
  if (!project) {
    notFound();
  }

  const [images, orderedProjects] = await Promise.all([
    listAdminProjectImages(project.id),
    listAdminProjects(),
  ]);
  const orderIndex = orderedProjects.findIndex((p) => p.id === project.id);
  const inList = orderIndex >= 0;
  const position = inList ? orderIndex + 1 : 1;
  const total = orderedProjects.length;
  const prevId = inList && orderIndex > 0 ? orderedProjects[orderIndex - 1]!.id : null;
  const nextId =
    inList && orderIndex < orderedProjects.length - 1 ? orderedProjects[orderIndex + 1]!.id : null;

  return (
    <ProjectEditorPageWrapper>
      <div>
        <ProjectEditorWorkflowNav
          project={project}
          prevId={prevId}
          nextId={nextId}
          position={position}
          total={total}
          positionUnknown={!inList}
        />
        <ProjectEditorGlobalStatus />

        <div className="mt-3 flex min-w-0 flex-col gap-6 lg:mt-3 lg:grid lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)] lg:items-start lg:gap-x-10 lg:gap-y-0 xl:gap-x-12">
          <aside className="flex min-w-0 flex-col gap-4 pb-4 lg:sticky lg:top-24 lg:z-0 lg:self-start">
            <div>
              <ProjectEditorMetaLine project={project} />
              <p className="mb-2 font-mono text-[10px] text-zinc-600">ID: {project.id}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/35 p-4 shadow-sm shadow-black/10 sm:p-5 lg:border-zinc-800/40 lg:bg-zinc-950/25">
              <ProjectForm mode="edit" action={updateProjectAction} project={project} compact />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-8 xl:gap-10">
            <ProjectImagesSection
              project={project}
              images={images}
              savedImageId={savedImageId}
              embedded
              embeddedParts="intro"
            />
            <ProjectImagesSection
              project={project}
              images={images}
              savedImageId={savedImageId}
              embedded
              embeddedParts="grid"
            />
          </div>
        </div>
      </div>
    </ProjectEditorPageWrapper>
  );
}
