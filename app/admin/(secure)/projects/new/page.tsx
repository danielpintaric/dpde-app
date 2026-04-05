import { createProjectAction } from "@/lib/actions/admin-project-actions";
import { ProjectForm } from "@/components/admin/project-form";

export default function AdminNewProjectPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl tracking-tight text-zinc-100">New project</h1>
      <ProjectForm mode="create" action={createProjectAction} />
    </div>
  );
}
