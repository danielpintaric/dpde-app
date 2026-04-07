import { ClientAccessCopyLinkButton } from "@/components/admin/client-access-copy-link-button";
import { ClientAccessExpiryForm } from "@/components/admin/client-access-expiry-form";
import { setClientAccessActiveAction } from "@/lib/actions/admin-client-access-actions";
import { parseProjectIdsColumn } from "@/lib/db/client-access-admin";
import { isoToDatetimeLocalValue } from "@/lib/format-datetime-local";
import { buildClientAccessAbsoluteUrl } from "@/lib/services/client-access-url";
import type { ClientAccessAdminRow } from "@/types/client-access";

function formatDisplayDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return "—";
  }
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ClientAccessRows({ rows }: { rows: ClientAccessAdminRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800/85 bg-zinc-950/40 px-6 py-14 text-center">
        <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500">
          No client access links yet. Create one above.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {rows.map((row) => {
        const ids = parseProjectIdsColumn(row.project_ids);
        const count = ids.length;
        const url = buildClientAccessAbsoluteUrl(row.token);
        const expiryLocal = isoToDatetimeLocalValue(row.expires_at);

        return (
          <li
            key={row.id}
            className="rounded-2xl border border-zinc-800/85 bg-zinc-950/35 p-5 shadow-sm shadow-black/10 sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="font-serif text-lg font-medium tracking-tight text-zinc-100">
                    {row.client_name?.trim() || "Untitled"}
                  </h2>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${
                      row.is_active
                        ? "bg-emerald-950/80 text-emerald-300/95"
                        : "bg-zinc-800/90 text-zinc-400"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <dl className="grid gap-1 text-[12px] text-zinc-500 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">Projects</dt>
                    <dd className="text-zinc-400">{count}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">Expires</dt>
                    <dd className="text-zinc-400">{formatDisplayDate(row.expires_at)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">Created</dt>
                    <dd className="text-zinc-400">{formatDisplayDate(row.created_at)}</dd>
                  </div>
                </dl>
                <div className="pt-1">
                  <p className="break-all font-mono text-[11px] leading-relaxed text-zinc-500">{url}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start lg:flex-col">
                <ClientAccessCopyLinkButton url={url} />
                <form action={setClientAccessActiveAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="active" value={row.is_active ? "false" : "true"} />
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-zinc-700/90 bg-transparent px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900/80 sm:w-auto"
                  >
                    {row.is_active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-800/80 pt-4">
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                Change expiry
              </p>
              <ClientAccessExpiryForm id={row.id} defaultDatetimeLocal={expiryLocal} />
              <p className="mt-2 text-[11px] text-zinc-600">Clear the date and save to remove the expiry.</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
