import Link from "next/link";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getResolvedSiteGlobal } from "@/lib/services/site-global";

const navLinkClass =
  "rounded-md px-2 py-1.5 text-[12px] font-medium tracking-wide text-zinc-400 outline-none transition-colors duration-200 hover:bg-white/5 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

/**
 * Opaker Admin-Header (secure): Brand links, nur Admin-Navigation.
 */
export async function AdminAppHeader() {
  const { brandName } = await getResolvedSiteGlobal();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/95 bg-zinc-950 pt-[env(safe-area-inset-top,0px)] shadow-[0_1px_0_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-8">
          <Link
            href="/admin/projects"
            className="group flex min-w-0 shrink-0 items-baseline gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <span className="truncate font-serif text-[1.05rem] font-normal tracking-[-0.02em] text-zinc-100 transition-opacity duration-200 group-hover:opacity-90 sm:text-[1.15rem]">
              {brandName}
            </span>
            <span className="hidden shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-600 sm:inline">
              Admin
            </span>
          </Link>

          <nav className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2" aria-label="Admin">
            <Link href="/admin/site" className={navLinkClass}>
              Site
            </Link>
            <Link href="/admin/client-access" className={navLinkClass}>
              Client access
            </Link>
            <Link href="/admin/projects" className={navLinkClass}>
              Projects
            </Link>
            <Link href="/admin/projects/new" className={navLinkClass}>
              New project
            </Link>
          </nav>
        </div>

        <div className="shrink-0">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
