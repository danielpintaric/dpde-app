"use client";

import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";
import { useRouter } from "next/navigation";

export function ClientSignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/client/login");
      }}
      className="cursor-pointer rounded border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
    >
      Sign out
    </button>
  );
}
