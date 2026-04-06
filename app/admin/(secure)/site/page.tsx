import { SiteHomeForm } from "@/components/admin/site-home-form";
import { listProjects } from "@/lib/db/projects";
import { getSiteLandingSettingsForAdmin } from "@/lib/db/site-landing-admin";
import { siteHomeRowToFormValues } from "@/lib/services/site-landing";

export const dynamic = "force-dynamic";

export default async function AdminSiteLandingPage() {
  let row = null;
  let loadError: string | null = null;
  try {
    row = await getSiteLandingSettingsForAdmin();
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load site settings. If the table is missing, apply the latest Supabase migration.";
  }

  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  try {
    projects = await listProjects();
  } catch {
    projects = [];
  }

  const initial = siteHomeRowToFormValues(row);

  return (
    <div className="min-w-0">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-100 sm:text-[1.5rem]">
          Site
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
          Manage hero and selected work for the landing page.
        </p>
      </div>

      {loadError ? (
        <p
          className="mb-8 max-w-2xl rounded-lg border border-amber-900/45 bg-amber-950/15 px-3 py-2 text-[13px] text-amber-200/95"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <SiteHomeForm
        initial={initial}
        projects={projects.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
      />
    </div>
  );
}
