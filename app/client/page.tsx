import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { PageMain } from "@/components/site-chrome";
import {
  focusRing,
  linkFocusVisible,
  pageContentShell,
  stackTitleToBody,
  tapSoft,
  typeBodyMuted,
  typeH1Page,
  typeMeta,
} from "@/lib/editorial";
import { resolveClientTokenArea } from "@/lib/services/client-token-area-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client area",
  description: "Private viewing — projects shared via a secure link.",
};

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

function tokenFromSearchParams(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function ClientTokenPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const token = tokenFromSearchParams(sp.token);
  const state = await resolveClientTokenArea(token);

  if (state.kind === "missing_token") {
    return (
      <PageMain>
        <div className={pageContentShell}>
          <div className="mx-auto max-w-7xl">
            <p className={typeMeta}>Private access</p>
            <h1 className={`mt-2 ${typeH1Page}`}>Client area</h1>
            <p className={`${stackTitleToBody} max-w-md ${typeBodyMuted}`}>Access restricted</p>
            <p className={`mt-6 max-w-md text-sm ${typeBodyMuted}`}>
              Open this page using the link you received. It includes an access key in the address bar.
            </p>
          </div>
        </div>
      </PageMain>
    );
  }

  if (state.kind === "expired") {
    return (
      <PageMain>
        <div className={pageContentShell}>
          <div className="mx-auto max-w-7xl">
            <p className={typeMeta}>Private access</p>
            <h1 className={`mt-2 ${typeH1Page}`}>Client area</h1>
            <p className={`${stackTitleToBody} max-w-md ${typeBodyMuted}`}>This access link has expired.</p>
            <p className={`mt-6 max-w-md text-sm ${typeBodyMuted}`}>
              Request a new link from the studio if you still need access.
            </p>
          </div>
        </div>
      </PageMain>
    );
  }

  if (state.kind === "invalid_link") {
    return (
      <PageMain>
        <div className={pageContentShell}>
          <div className="mx-auto max-w-7xl">
            <p className={typeMeta}>Private access</p>
            <h1 className={`mt-2 ${typeH1Page}`}>Client area</h1>
            <p className={`${stackTitleToBody} max-w-md ${typeBodyMuted}`}>Invalid or expired access link</p>
            <p className={`mt-6 max-w-md text-sm ${typeBodyMuted}`}>
              Check the link you were sent, or contact the studio for a new one.
            </p>
          </div>
        </div>
      </PageMain>
    );
  }

  const { clientName, projects, selectionCountTotal } = state;
  const shareToken = (token ?? "").trim();

  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Private access</p>
          <h1 className={`mt-2 ${typeH1Page}`}>Shared work</h1>
          {clientName ? (
            <p className={`${stackTitleToBody} max-w-xl text-zinc-400`}>{clientName}</p>
          ) : null}
          <p
            className={`${clientName ? "mt-5" : stackTitleToBody} max-w-xl ${typeBodyMuted}`}
          >
            A curated selection for you — not listed in the public index.
          </p>

          {selectionCountTotal > 0 ? (
            <p className={`mt-6 text-[11px] font-normal tracking-[0.06em] text-zinc-500`}>
              {selectionCountTotal === 1
                ? "1 image selected"
                : `${selectionCountTotal} images selected`}
            </p>
          ) : null}

          {projects.length === 0 ? (
            <p className={`mt-12 text-sm ${typeBodyMuted}`}>
              No projects are available on this link yet. If something is missing, contact the studio.
            </p>
          ) : (
            <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:mt-14 sm:grid-cols-2 lg:mt-20">
              {projects.map((p, i) => (
                <li key={p.slug} className={i % 2 === 1 ? "sm:mt-6 lg:mt-10" : ""}>
                  <Link
                    href={`/client/${encodeURIComponent(p.slug)}?token=${encodeURIComponent(shareToken)}`}
                    className={`group block cursor-pointer ${focusRing} ${linkFocusVisible} ${tapSoft}`}
                  >
                    <div className="relative overflow-hidden bg-zinc-900">
                      <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                        <NextImage
                          src={p.coverImage}
                          alt=""
                          fill
                          className="object-cover object-center brightness-[0.92] contrast-[1.04]"
                          sizes="(min-width: 1024px) 40vw, 50vw"
                          priority={i === 0}
                          unoptimized
                        />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1] bg-zinc-950/25"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-1 sm:mt-6 sm:flex-row sm:items-baseline sm:justify-between">
                      <h2 className="font-serif text-xl tracking-tight text-zinc-100 sm:text-2xl">
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
