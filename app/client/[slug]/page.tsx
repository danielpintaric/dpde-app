import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientSelectionProvider } from "@/components/client/client-selection-context";
import { PageMain } from "@/components/site-chrome";
import { PortfolioProjectView } from "@/components/portfolio/portfolio-project-view";
import {
  pageContentShell,
  stackTitleToBody,
  typeBodyMuted,
  typeH1Page,
  typeMeta,
} from "@/lib/editorial";
import { requireClientSessionUser } from "@/lib/auth/require-client-session";
import {
  loadClientAdjacentProjects,
  loadClientProjectBySlug,
} from "@/lib/services/client-portfolio-data";
import { resolveClientTokenDetail } from "@/lib/services/client-token-area-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function tokenFromSearchParams(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const token = tokenFromSearchParams(sp.token)?.trim();

  if (token) {
    const detail = await resolveClientTokenDetail(slug, token);
    if (detail.kind === "ok") {
      return {
        title: `${detail.project.title} — Client`,
        description: detail.project.intro,
        robots: { index: false, follow: false },
      };
    }
    return { title: "Client area", robots: { index: false, follow: false } };
  }

  const project = await loadClientProjectBySlug(slug);
  if (!project) {
    return { title: "Project", robots: { index: false, follow: false } };
  }
  return {
    title: `${project.title} — Client`,
    description: project.intro,
    robots: { index: false, follow: false },
  };
}

function RestrictedBlock({
  title,
  body,
  extra,
}: {
  title: string;
  body: string;
  extra?: ReactNode;
}) {
  return (
    <PageMain>
      <div className={pageContentShell}>
        <div className="mx-auto max-w-7xl">
          <p className={typeMeta}>Private access</p>
          <h1 className={`mt-2 ${typeH1Page}`}>Client area</h1>
          <p className={`${stackTitleToBody} max-w-md ${typeBodyMuted}`}>{title}</p>
          <p className={`mt-6 max-w-md text-sm ${typeBodyMuted}`}>{body}</p>
          {extra}
        </div>
      </div>
    </PageMain>
  );
}

export default async function ClientProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const tokenRaw = tokenFromSearchParams(sp.token);
  const token = tokenRaw?.trim() ?? "";

  if (token.length > 0) {
    const detail = await resolveClientTokenDetail(slug, token);

    if (detail.kind === "missing_token") {
      return (
        <RestrictedBlock
          title="Access restricted"
          body="Open this page using the link you received, including the access key in the address bar."
        />
      );
    }

    if (detail.kind === "expired") {
      return (
        <RestrictedBlock
          title="This access link has expired."
          body="Request a new link from the studio if you still need access."
        />
      );
    }

    if (detail.kind === "invalid_link") {
      return (
        <RestrictedBlock
          title="Invalid or expired access link"
          body="Check the link you were sent, or contact the studio for a new one."
        />
      );
    }

    if (detail.kind === "not_found") {
      return (
        <RestrictedBlock
          title="Project not found"
          body="This address does not match a project. Check the link or return to your shared list."
          extra={
            <p className="mt-8 text-sm text-zinc-500">
              <Link
                href={`/client?token=${encodeURIComponent(token)}`}
                className="underline decoration-zinc-600/40 underline-offset-[6px] hover:text-zinc-400"
              >
                Back to shared work
              </Link>
            </p>
          }
        />
      );
    }

    if (detail.kind === "not_in_share") {
      return (
        <RestrictedBlock
          title="Not included in this link"
          body="This project is not part of your current access. Use the link you were given for the correct selection."
          extra={
            <p className="mt-8 text-sm text-zinc-500">
              <Link
                href={`/client?token=${encodeURIComponent(token)}`}
                className="underline decoration-zinc-600/40 underline-offset-[6px] hover:text-zinc-400"
              >
                Back to shared work
              </Link>
            </p>
          }
        />
      );
    }

    if (detail.kind === "incomplete") {
      return (
        <RestrictedBlock
          title="Project unavailable"
          body="This project cannot be shown right now (gallery data is incomplete). Contact the studio if you need help."
          extra={
            <p className="mt-8 text-sm text-zinc-500">
              <Link
                href={`/client?token=${encodeURIComponent(token)}`}
                className="underline decoration-zinc-600/40 underline-offset-[6px] hover:text-zinc-400"
              >
                Back to shared work
              </Link>
            </p>
          }
        />
      );
    }

    const { project, prev, next, selectedImageIds } = detail;
    return (
      <ClientSelectionProvider
        token={token}
        projectSlug={project.slug}
        initialSelectedIds={selectedImageIds}
      >
        <PortfolioProjectView
          project={project}
          prev={prev}
          next={next}
          basePath="/client"
          indexHref={`/client?token=${encodeURIComponent(token)}`}
          indexLabel="Shared work"
          accessToken={token}
          clientDownload={{ token }}
          clientSelectionMode
        />
      </ClientSelectionProvider>
    );
  }

  await requireClientSessionUser();
  const project = await loadClientProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const { prev, next } = await loadClientAdjacentProjects(slug);

  return (
    <PortfolioProjectView
      project={project}
      prev={prev}
      next={next}
      basePath="/client"
      indexHref="/client"
      indexLabel="Client projects"
    />
  );
}
