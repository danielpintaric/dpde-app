import { notFound } from "next/navigation";
import { updateProjectAction } from "@/lib/actions/admin-project-actions";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectImagesSection } from "@/components/admin/project-images-section";
import { listAdminProjectImages } from "@/lib/services/admin-images";
import { getAdminProjectById } from "@/lib/services/admin-projects";

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

  const images = await listAdminProjectImages(project.id);

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl tracking-tight text-zinc-100">Edit project</h1>
      <p className="mb-6 font-mono text-xs text-zinc-500">ID: {project.id}</p>
      <ProjectForm mode="edit" action={updateProjectAction} project={project} />
      <ProjectImagesSection project={project} images={images} savedImageId={savedImageId} />
    </div>
  );
}
