import Link from "next/link";
import { requireClientSessionUser } from "@/lib/auth/require-client-session";
import { ClientSignOutButton } from "@/components/client/client-sign-out-button";

export const dynamic = "force-dynamic";

export default async function ClientSecureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireClientSessionUser();

  return (
    <div className="min-h-[50vh] px-6 pb-20 pt-10 sm:px-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <Link href="/client" className="font-serif text-lg tracking-tight text-zinc-200 hover:text-zinc-100">
            Client area
          </Link>
          <nav className="flex gap-4 text-zinc-500">
            <Link href="/client" className="hover:text-zinc-300">
              Projects
            </Link>
            <Link href="/" className="hover:text-zinc-300">
              Site
            </Link>
          </nav>
        </div>
        <ClientSignOutButton />
      </header>
      {children}
    </div>
  );
}
