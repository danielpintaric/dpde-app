import Link from "next/link";
import { getPublicConfig } from "@/lib/public-config";

/**
 * Opaker Header für Admin-Gast-Routen (z. B. Login): Brand, kein Public-Menü.
 */
export function AdminGuestHeader() {
  const { brandName } = getPublicConfig();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/95 bg-zinc-950 pt-[env(safe-area-inset-top,0px)] shadow-[0_1px_0_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
        <Link
          href="/admin/login"
          className="group flex min-w-0 items-baseline gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <span className="truncate font-serif text-[1.05rem] font-normal tracking-[-0.02em] text-zinc-100 transition-opacity duration-200 group-hover:opacity-90 sm:text-[1.15rem]">
            {brandName}
          </span>
          <span className="shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            Admin
          </span>
        </Link>

        <Link
          href="/"
          className="shrink-0 rounded-md px-2 py-1.5 text-[12px] font-medium tracking-wide text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-zinc-200"
        >
          Back to site
        </Link>
      </div>
    </header>
  );
}
