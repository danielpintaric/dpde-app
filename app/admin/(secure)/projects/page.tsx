import Link from "next/link";
import { listAdminProjects } from "@/lib/services/admin-projects";

export default async function AdminProjectsPage() {
  const projects = await listAdminProjects();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl tracking-tight text-zinc-100">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-white"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No projects yet.{" "}
          <Link href="/admin/projects/new" className="text-zinc-400 underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 font-medium">Sort</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {projects.map((p) => (
                <tr key={p.id} className="text-zinc-300">
                  <td className="px-4 py-3 text-zinc-100">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{p.slug}</td>
                  <td className="px-4 py-3">{p.visibility}</td>
                  <td className="px-4 py-3 tabular-nums">{p.sortOrder}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.year ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/projects/${p.id}/edit`}
                      className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
