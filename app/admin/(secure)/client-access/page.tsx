import { ClientAccessCreateForm } from "@/components/admin/client-access-create-form";
import { ClientAccessRows } from "@/components/admin/client-access-rows";
import { listClientAccessBySiteId } from "@/lib/db/client-access-admin";
import { listProjects } from "@/lib/db/projects";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";
import type { ClientAccessAdminRow } from "@/types/client-access";

export const dynamic = "force-dynamic";

const sectionHeadingClass =
  "mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600";

export default async function AdminClientAccessPage() {
  const hasServiceRole = Boolean(getOptionalSupabaseServiceRoleKey());

  const projects = await listProjects().catch(() => []);
  const projectOptions = projects.map((p) => ({ id: p.id, title: p.title }));

  let rows: ClientAccessAdminRow[] = [];
  let loadError: string | null = null;

  if (hasServiceRole) {
    try {
      rows = await listClientAccessBySiteId(DEFAULT_SITE_ID);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load client access.";
      loadError = msg;
    }
  } else {
    loadError =
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to the server environment to manage client access links.";
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
            Client area
          </p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Client access
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Create share links with a token. Clients open{" "}
            <code className="rounded bg-zinc-900/80 px-1 py-0.5 font-mono text-[11px] text-zinc-400">
              /client?token=…
            </code>{" "}
            without logging in.
          </p>
        </div>
      </div>

      {loadError ? (
        <div
          className="mb-8 rounded-xl border border-amber-900/50 bg-amber-950/25 px-4 py-3 text-sm text-amber-200/95"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}

      <section aria-labelledby="client-access-create-heading" className="mb-14">
        <h2 id="client-access-create-heading" className={`${sectionHeadingClass} mb-4`}>
          New access
        </h2>
        <div className="rounded-2xl border border-zinc-800/85 bg-zinc-950/35 p-5 shadow-sm shadow-black/10 sm:p-6">
          {hasServiceRole ? (
            <ClientAccessCreateForm projects={projectOptions} />
          ) : (
            <p className="text-sm text-zinc-500">
              Configure the service role key to enable creating links.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="client-access-list-heading">
        <h2 id="client-access-list-heading" className={`${sectionHeadingClass} mb-4`}>
          Existing links
        </h2>
        {!hasServiceRole ? (
          <p className="text-sm text-zinc-500">Configure the service role key to list saved links.</p>
        ) : loadError ? (
          <p className="text-sm text-zinc-500">Fix the error above to see existing links.</p>
        ) : (
          <ClientAccessRows rows={rows} />
        )}
      </section>
    </div>
  );
}
