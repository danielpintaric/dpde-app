import { editorSaveButtonPrimaryClass } from "@/components/admin/editor-save-button-styles";

type Props = {
  visible: boolean;
  dirty: boolean;
  pending: boolean;
  errorMessage: string | null | undefined;
  saveLabel: string;
  saveDisabled: boolean;
  onReset: () => void;
};

const ghostBtnClass =
  "cursor-pointer rounded border border-zinc-700/90 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-45";

export function AdminSaveBar({
  visible,
  dirty,
  pending,
  errorMessage,
  saveLabel,
  saveDisabled,
  onReset,
}: Props) {
  if (!visible) {
    return null;
  }

  const saveButtonClass = `${editorSaveButtonPrimaryClass} min-w-[10.5rem] justify-center px-5 py-2.5 text-sm ${
    saveDisabled && !pending ? "opacity-60" : ""
  }`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/80 bg-zinc-900/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/75 sm:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1" role={errorMessage ? "alert" : "status"}>
          {pending ? (
            <p className="text-[13px] font-medium leading-snug text-zinc-400">Saving…</p>
          ) : errorMessage ? (
            <div className="rounded-md border border-red-900/40 bg-red-950/50 px-2.5 py-2 ring-1 ring-inset ring-red-500/10">
              <p className="max-h-[4.75rem] overflow-y-auto text-[13px] font-medium leading-snug text-red-100/95 [overflow-wrap:anywhere] [scrollbar-width:thin]">
                {errorMessage}
              </p>
            </div>
          ) : dirty ? (
            <p className="text-[13px] font-medium leading-snug text-zinc-300">Unsaved changes</p>
          ) : (
            <p className="min-h-[1.25rem] text-[13px] text-transparent" aria-hidden>
              {"\u00a0"}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button type="button" className={ghostBtnClass} onClick={onReset} disabled={pending}>
            Reset
          </button>
          <button type="submit" className={saveButtonClass} disabled={saveDisabled} aria-busy={pending}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
