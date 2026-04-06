import Link from "next/link";
import { AdminProjectCompactCard } from "@/components/admin/admin-project-compact-card";
import { AdminProjectHeroCard } from "@/components/admin/admin-project-hero-card";
import { listAdminProjectsWithSummary } from "@/lib/services/admin-projects";

const FEATURED_COUNT = 3;

const sectionHeadingClass =
  "mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600";

export default async function AdminProjectsPage() {
  const entries = await listAdminProjectsWithSummary();
  const featuredEntries = entries.slice(0, FEATURED_COUNT);
  const restEntries = entries.slice(FEATURED_COUNT);

  const featuredGridClass =
    featuredEntries.length === 1
      ? "grid-cols-1"
      : featuredEntries.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="max-w-7xl">
      <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
            Portfolio
          </p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Projects
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Curated overview — open any project to edit details and gallery.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-600/55 bg-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-950 shadow-sm transition-colors hover:border-zinc-400 hover:bg-white"
        >
          New project
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/85 bg-zinc-950/40 px-6 py-16 text-center shadow-sm shadow-black/10">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500">
            No projects yet. Add one to start your catalog.
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-600/55 bg-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-950 transition-colors hover:border-zinc-400 hover:bg-white"
          >
            New project
          </Link>
        </div>
      ) : (
        <>
          <section aria-labelledby="admin-featured-heading" className="mb-12 md:mb-14">
            <h2 id="admin-featured-heading" className={`${sectionHeadingClass} mb-4`}>
              Featured
            </h2>
            <div className={`grid gap-5 md:gap-6 ${featuredGridClass}`}>
              {featuredEntries.map((entry) => (
                <AdminProjectHeroCard key={entry.project.id} entry={entry} />
              ))}
            </div>
          </section>

          {restEntries.length > 0 ? (
            <section aria-labelledby="admin-all-projects-heading">
              <h2 id="admin-all-projects-heading" className={`${sectionHeadingClass} mb-4`}>
                All projects
              </h2>
              <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 md:gap-5">
                {restEntries.map((entry) => (
                  <li key={entry.project.id} className="min-w-0">
                    <AdminProjectCompactCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
