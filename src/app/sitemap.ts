import type { MetadataRoute } from "next";
import { records } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = process.env.APP_URL || "http://localhost:3000";
  return [
    { url: root },
    ...(await records("projects")).map((p) => ({
      url: `${root}/proyectos/${p.slug}`,
    })),
  ];
}
