import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REAL_PROJECTS } from "@/data/realProjects";
import ProjectDetail from "./ProjectDetail";

export function generateStaticParams() {
  return REAL_PROJECTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = REAL_PROJECTS.find((p) => p.id === id);
  if (!project) notFound();
  const title = `${project.title} — ${project.location || "Dhaka"}`;
  const description =
    project.synopsis ||
    `${project.category.toLowerCase()} interior design project by Imagine Interiors in ${project.location || "Dhaka"}, Bangladesh.`;
  const ogImage = project.heroImage || "/projects/mrs-sen-banani/photo-01.jpg";

  return {
    title,
    description,
    alternates: { canonical: `/project/${project.id}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!REAL_PROJECTS.some((p) => p.id === id)) notFound();
  return <ProjectDetail params={params} />;
}
