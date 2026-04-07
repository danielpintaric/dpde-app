"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateClientAccessExpiryAction,
  type ClientAccessExpiryState,
} from "@/lib/actions/admin-client-access-actions";

function SubmitExpiry() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-zinc-700/90 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:border-zinc-500 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Update expiry"}
    </button>
  );
}

type Props = {
  id: string;
  defaultDatetimeLocal: string;
};

export function ClientAccessExpiryForm({ id, defaultDatetimeLocal }: Props) {
  const [state, formAction] = useActionState(updateClientAccessExpiryAction, null as ClientAccessExpiryState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="min-w-0 flex-1 sm:max-w-[14rem]">
        <label htmlFor={`expiry-${id}`} className="sr-only">
          Expiry
        </label>
        <input
          id={`expiry-${id}`}
          name="expires_at"
          type="datetime-local"
          defaultValue={defaultDatetimeLocal}
          className="w-full rounded-lg border border-zinc-700/90 bg-zinc-950 px-2 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
        />
      </div>
      <SubmitExpiry />
      {state?.error ? (
        <span className="w-full text-[11px] text-red-400/95" role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
