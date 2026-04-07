import { SiteHomeForm } from "@/components/admin/site-home-form";
import { listProjects } from "@/lib/db/projects";
import { getSupabaseProjectRefFromPublicUrl } from "@/lib/db/supabase-env";
import { getSiteGlobalSettingsForAdmin } from "@/lib/db/site-global-admin";
import { getSiteLandingSettingsForAdmin } from "@/lib/db/site-landing-admin";
import { siteGlobalRowToFormValues } from "@/lib/services/site-global";
import { siteHomeRowToFormValues } from "@/lib/services/site-landing";
import type { AdminSiteFormValues } from "@/types/site-global";

export const dynamic = "force-dynamic";

export default async function AdminSiteLandingPage() {
  if (process.env.NODE_ENV === "development") {
    const ref = getSupabaseProjectRefFromPublicUrl();
    if (ref) {
      console.info("[admin/site] Active Supabase project ref (from NEXT_PUBLIC_SUPABASE_URL):", ref);
    }
  }
  let row = null;
  let globalRow = null;
  let loadError: string | null = null;
  try {
    row = await getSiteLandingSettingsForAdmin();
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load site settings. If the table is missing, apply the latest Supabase migration.";
  }
  try {
    globalRow = await getSiteGlobalSettingsForAdmin();
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Could not load global site settings. If the table is missing, apply the latest Supabase migration.";
    loadError = loadError ?? msg;
  }

  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  try {
    projects = await listProjects();
  } catch {
    projects = [];
  }

  const initial: AdminSiteFormValues = {
    ...siteHomeRowToFormValues(row),
    ...siteGlobalRowToFormValues(globalRow),
  };

  return (
    <div className="min-w-0">
      <div className="mx-auto mb-10 max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-100 sm:text-[1.5rem]">
            Site
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
            Control panel for brand, navigation, homepage hero, and landing content.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="mx-auto mb-8 max-w-5xl px-4 sm:px-6">
          <p
            className="max-w-2xl rounded-lg border border-amber-900/45 bg-amber-950/15 px-3 py-2 text-[13px] text-amber-200/95"
            role="alert"
          >
            {loadError}
          </p>
        </div>
      ) : null}

      <SiteHomeForm
        initial={initial}
        projects={projects.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
      />
    </div>
  );
}
