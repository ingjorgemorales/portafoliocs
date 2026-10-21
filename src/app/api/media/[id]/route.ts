import { z } from "zod";
import { sessionClient } from "@/lib/supabase/server";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      return new Response(null, { status: 404 });
    const db = await sessionClient();
    const { data } = await db
      .from("media")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) return new Response(null, { status: 404 });
    const { data: file, error } = await db.storage
      .from("portfolio")
      .download(data.object_path);
    if (error || !file) return new Response(null, { status: 404 });
    return new Response(file, {
      headers: {
        "Content-Type": data.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `${data.mime.startsWith("image/") || data.mime.startsWith("audio/") ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(data.name)}`,
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
