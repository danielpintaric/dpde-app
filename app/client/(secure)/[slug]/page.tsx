import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioProjectView } from "@/components/portfolio/portfolio-project-view";
import {
  loadClientAdjacentProjects,
  loadClientProjectBySlug,
} from "@/lib/services/client-portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadClientProjectBySlug(slug);
  if (!project) {
    return { title: "Project" };
  }
  return {
    title: `${project.title} — Client`,
    description: project.intro,
    robots: { index: false, follow: false },
  };
}

export default async function ClientProjectPage({ params }: PageProps) {
  const { slug } = await params;
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
