import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AdminSecureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminSession();

  return (
    <div className="min-h-[50vh] px-6 pb-20 pt-10 sm:px-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-serif text-lg tracking-tight text-zinc-200">Admin</span>
          <nav className="flex gap-4 text-zinc-500">
            <Link href="/admin/projects" className="hover:text-zinc-300">
              Projects
            </Link>
            <Link href="/admin/projects/new" className="hover:text-zinc-300">
              New project
            </Link>
          </nav>
        </div>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
