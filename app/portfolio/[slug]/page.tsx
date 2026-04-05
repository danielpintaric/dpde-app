import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioProjectView } from "@/components/portfolio/portfolio-project-view";
/** Data via `portfolio-view-data` → `project-catalog` → public DB helpers (no cookies). */
import {
  loadPortfolioAdjacentProjects,
  loadPortfolioProjectBySlug,
  loadWorkPortfolioProjects,
} from "@/lib/services/portfolio-view-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await loadWorkPortfolioProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadPortfolioProjectBySlug(slug);
  if (!project) {
    return { title: "Project" };
  }
  return {
    title: project.title,
    description: project.intro,
  };
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await loadPortfolioProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const { prev, next } = await loadPortfolioAdjacentProjects(slug);

  return (
    <PortfolioProjectView
      project={project}
      prev={prev}
      next={next}
      basePath="/portfolio"
      indexHref="/portfolio"
      indexLabel="All work"
    />
  );
}
