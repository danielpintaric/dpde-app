import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-20">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
              © 2026 Daniel Pintarić
            </p>
            <p className="mt-3 max-w-sm text-[12px] font-light leading-[1.65] tracking-[0.02em] text-zinc-500">
              Portrait and editorial — Berlin. Selected commissions by arrangement.
            </p>
            <p className="mt-4">
              <a
                href="mailto:hello@danielpintaric.com"
                className="text-[11px] font-normal tracking-[0.05em] text-zinc-600 underline decoration-zinc-700/35 underline-offset-[6px] transition duration-300 ease-out hover:text-zinc-500 hover:decoration-zinc-600/45"
              >
                hello@danielpintaric.com
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 sm:gap-x-12">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/50"
            >
              Instagram
            </a>
            <Link
              href="/contact"
              className="text-[11px] font-normal tracking-[0.06em] text-zinc-500 underline decoration-zinc-600/40 underline-offset-[7px] transition duration-300 ease-out hover:text-zinc-400 hover:decoration-zinc-500/50"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Wraps inner page content; global header and footer live in root layout. */
export function PageMain({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex-1">{children}</div>;
}
