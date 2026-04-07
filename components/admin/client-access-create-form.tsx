"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createClientAccessAction,
  type ClientAccessCreateState,
} from "@/lib/actions/admin-client-access-actions";

const labelClass = "mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500";
const inputClass =
  "w-full rounded-lg border border-zinc-700/90 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500/30 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2";

type ProjectOption = { id: string; title: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-600/55 bg-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-950 shadow-sm transition-colors hover:border-zinc-400 hover:bg-white disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create access"}
    </button>
  );
}

export function ClientAccessCreateForm({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createClientAccessAction, null as ClientAccessCreateState);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state?.ok, router]);

  const sorted = [...projects].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div>
        <label htmlFor="client_name" className={labelClass}>
          Client name
        </label>
        <input
          id="client_name"
          name="client_name"
          type="text"
          required
          autoComplete="off"
          className={inputClass}
          placeholder="e.g. Agency name or commission"
        />
      </div>

      <fieldset className="min-w-0">
        <legend className={`${labelClass} mb-2`}>Projects</legend>
        <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-zinc-800/90 bg-zinc-950/50 p-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-zinc-500">No projects in the database yet.</p>
          ) : (
            sorted.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name="project_ids"
                  value={p.id}
                  className="mt-0.5 rounded border-zinc-600 text-zinc-200 focus:ring-zinc-500"
                />
                <span>{p.title}</span>
              </label>
            ))
          )}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="expires_at" className={labelClass}>
            Expires (optional)
          </label>
          <input id="expires_at" name="expires_at" type="datetime-local" className={inputClass} />
        </div>
        <div className="flex flex-col justify-end">
          <label className={`${labelClass} flex items-center gap-2`}>
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked
              className="rounded border-zinc-600 text-zinc-200 focus:ring-zinc-500"
            />
            Active
          </label>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-red-400/95" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-400/90" role="status">
          Access created. It appears in the list below.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
