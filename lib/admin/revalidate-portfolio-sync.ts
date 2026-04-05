import { revalidatePath } from "next/cache";

/** Revalidiert Admin- und öffentliche Pfade nach Änderungen an Projektbildern. */
export function revalidatePortfolioSync(
  projectId: string,
  projectSlug: string | null,
): void {
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/portfolio");
  revalidatePath("/");
  if (projectSlug) {
    revalidatePath(`/portfolio/${projectSlug}`);
    revalidatePath(`/client/${projectSlug}`);
  }
}
