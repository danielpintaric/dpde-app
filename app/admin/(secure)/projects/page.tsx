import Link from "next/link";
import { AdminProjectHeroCard } from "@/components/admin/admin-project-hero-card";
import { AdminProjectListItem } from "@/components/admin/admin-project-list-item";
import { listAdminProjectsWithSummary } from "@/lib/services/admin-projects";

const HERO_PROJECT_COUNT = 2;

export default async function AdminProjectsPage() {
  const entries = await listAdminProjectsWithSummary();
  const heroEntries = entries.slice(0, HERO_PROJECT_COUNT);
  const listEntries = entries.slice(HERO_PROJECT_COUNT);

  return (
    <div className="max-w-6xl">
      <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800/90 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-zinc-100 sm:text-3xl">Projects</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Overview of all portfolio projects. Open a row to edit details and images.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-600/60 bg-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-950 shadow-sm transition-colors hover:border-zinc-400 hover:bg-white"
        >
          New project
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/90 bg-zinc-950/40 px-6 py-16 text-center shadow-sm shadow-black/10">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500">
            No projects yet. Create one to start building your portfolio catalog.
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-600/60 bg-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-white"
          >
            Create project
          </Link>
        </div>
      ) : (
        <>
          {heroEntries.length > 0 ? (
            <div
              className={`grid gap-4 md:gap-5 ${
                heroEntries.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {heroEntries.map((entry) => (
                <AdminProjectHeroCard key={entry.project.id} entry={entry} />
              ))}
            </div>
          ) : null}

          {listEntries.length > 0 ? (
            <section className="mt-8 md:mt-10" aria-labelledby="admin-more-projects-heading">
              <h2
                id="admin-more-projects-heading"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500"
              >
                Weitere Projekte
              </h2>
              <ul className="mt-4 flex list-none flex-col gap-2.5 sm:mt-5 sm:gap-3.5">
                {listEntries.map((entry) => (
                  <li key={entry.project.id}>
                    <AdminProjectListItem entry={entry} />
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
