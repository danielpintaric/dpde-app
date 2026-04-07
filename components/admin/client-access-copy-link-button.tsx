"use client";

import { useState } from "react";

type Props = {
  url: string;
  label?: string;
};

export function ClientAccessCopyLinkButton({ url, label = "Copy link" }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-600/55 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/80"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
