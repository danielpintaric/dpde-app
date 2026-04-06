"use client";

import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/admin/login");
      }}
      className="cursor-pointer rounded-md border border-zinc-700/90 bg-zinc-900 px-3 py-2 text-[12px] font-medium text-zinc-300 outline-none transition-colors duration-200 hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      Sign out
    </button>
  );
}
