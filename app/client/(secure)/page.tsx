import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { PageMain } from "@/components/site-chrome";
import {
  linkFocusVisible,
  pageContentShell,
  stackTitleToBody,
  tapSoft,
  typeBodyMuted,
  typeH1Page,
  typeMeta,
} from "@/lib/editorial";
import { loadClientWorkspaceProjects } from "@/lib/services/client-portfolio-data";

export const metadata: Metadata = {
  title: "Client area",
  description: "Private viewing — projects shared outside the public index.",
};

export default async function ClientWorkspacePage() {
  const projects = await loadClientWorkspaceProjects();

  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Private access</p>
          <h1 className={`mt-2 ${typeH1Page}`}>Your projects</h1>
          <p className={`${stackTitleToBody} mt-4 max-w-xl ${typeBodyMuted}`}>
            Private projects assigned to client access. Unlisted work uses a direct link on the public site
            instead. This area is not indexed for search.
          </p>

          {projects.length === 0 ? (
            <p className={`mt-12 text-sm ${typeBodyMuted}`}>
              No private projects are available for your account yet. If you expected to see work here,
              contact the studio.
            </p>
          ) : (
            <ul className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20">
              {projects.map((p, i) => (
                <li key={p.slug} className={i % 2 === 1 ? "sm:mt-6 lg:mt-10" : ""}>
                  <Link
                    href={`/client/${p.slug}`}
                    className={`group block cursor-pointer ${linkFocusVisible} ${tapSoft}`}
                  >
                    <div className="relative overflow-hidden bg-zinc-900">
                      <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                        <NextImage
                          src={p.coverImage}
                          alt=""
                          fill
                          className="object-cover object-center brightness-[0.92] contrast-[1.04]"
                          sizes="(min-width: 1024px) 40vw, 50vw"
                          loading="lazy"
                          unoptimized
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1] bg-zinc-950/25"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-1 sm:mt-6 sm:flex-row sm:items-baseline sm:justify-between">
                      <h2 className="font-serif text-xl tracking-tight text-zinc-100 transition-colors sm:text-2xl group-hover:text-zinc-100/90">
                        {p.title}
                      </h2>
                      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                        {p.category}
                        <span className="mx-2 text-zinc-700">·</span>
                        {p.year}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageMain>
  );
}
