import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { records, media } from "@/lib/content";
import { ProjectDetail } from "@/components/project-detail";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = await requireAdmin();
  const { id } = await params;
  const p = (await records("projects", db)).find((p) => p.id === id);
  if (!p) notFound();
  return (
    <ProjectDetail
      project={p}
      files={(await media(db)).filter((m) => m.project_id === id)}
      preview
    />
  );
}
