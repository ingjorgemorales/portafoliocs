import { notFound } from "next/navigation";
import { media, records } from "@/lib/content";
import { ProjectDetail } from "@/components/project-detail";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await records("projects")).find((p) => p.slug === slug);
  const cover = p
    ? (await media()).find(
        (m) => m.project_id === p.id && m.purpose === "cover",
      )
    : undefined;
  return {
    title: p?.data.seo_title || p?.title || "Proyecto",
    description: p?.data.seo_description || p?.summary,
    openGraph: {
      title: p?.data.seo_title || p?.title,
      description: p?.data.seo_description || p?.summary,
      ...(cover ? { images: [{ url: cover.url!, alt: cover.alt }] } : {}),
    },
  };
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = (await records("projects")).find((p) => p.slug === slug);
  if (!project) notFound();
  const files = (await media()).filter((m) => m.project_id === project.id);
  return <ProjectDetail project={project} files={files} />;
}
