import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { json, limitedJson, sameOrigin } from "@/lib/http";
import { allowedFiles, validSignature } from "@/lib/files";
const metaSchema = z.object({
  project_id: z.union([z.uuid(), z.literal("")]).transform((v) => v || null),
  alt: z.string().trim().max(400),
  purpose: z.enum(["gallery", "cover", "portrait", "cv", "social"]),
  sort_order: z.coerce.number().int().min(0).max(10000),
  published: z.boolean(),
});
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json("Origen no permitido.", 403);
  try {
    const db = await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 4_000_000)
      return json("El archivo debe pesar menos de 3 MB.", 413);
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size < 1 ||
      file.size > 3 * 1024 * 1024 ||
      !allowedFiles[file.type] ||
      file.name.length > 180 ||
      /[\\/]/.test(file.name) ||
      [...file.name].some((char) => char.charCodeAt(0) < 32)
    )
      return json(
        "Archivo no permitido. Usa JPG, PNG, WebP, PDF, MP3 o WAV de hasta 3 MB.",
        400,
      );
    const metadata = metaSchema.parse({
      project_id: form.get("project_id") || "",
      alt: form.get("alt") || "",
      purpose: form.get("purpose"),
      sort_order: form.get("sort_order") || 0,
      published: form.get("published") === "true",
    });
    if (file.type.startsWith("image/") && !metadata.alt)
      return json("Añade texto alternativo a la imagen.", 400);
    if (
      ["cover", "portrait", "social"].includes(metadata.purpose) &&
      !file.type.startsWith("image/")
    )
      return json("Selecciona una imagen para este uso.", 400);
    if (metadata.purpose === "cv" && file.type !== "application/pdf")
      return json("La hoja de vida debe ser PDF.", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validSignature(bytes, file.type))
      return json("El contenido del archivo no coincide con su tipo.", 400);
    const path = `uploads/${randomUUID()}.${allowedFiles[file.type]}`;
    const upload = await db.storage
      .from("portfolio")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (upload.error) return json("No se pudo almacenar el archivo.", 503);
    const saved = await db.from("media").insert({
      ...metadata,
      name: file.name,
      mime: file.type,
      size: file.size,
      object_path: path,
    });
    if (saved.error) {
      await db.storage.from("portfolio").remove([path]);
      return json("No se pudo registrar el archivo.", 503);
    }
    revalidatePath("/", "layout");
    return json("Archivo guardado en Supabase.", 201);
  } catch {
    return json("No se pudo subir: revisa los campos y tus permisos.", 400);
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return json("Origen no permitido.", 403);
  try {
    const db = await requireAdmin();
    const input = await limitedJson(request);
    const id = z.uuid().parse(input.id);
    const metadata = metaSchema.parse(input);
    const { data: existing } = await db
      .from("media")
      .select("mime")
      .eq("id", id)
      .single();
    if (!existing) return json("Archivo no encontrado.", 404);
    if (existing.mime.startsWith("image/") && !metadata.alt)
      return json("El texto alternativo es obligatorio.", 400);
    if (
      ["cover", "portrait", "social"].includes(metadata.purpose) &&
      !existing.mime.startsWith("image/")
    )
      return json("Este uso requiere una imagen.", 400);
    if (metadata.purpose === "cv" && existing.mime !== "application/pdf")
      return json("La hoja de vida debe ser PDF.", 400);
    const { error } = await db.from("media").update(metadata).eq("id", id);
    if (error) throw error;
    revalidatePath("/", "layout");
    return json("Archivo actualizado.");
  } catch {
    return json("No se pudo actualizar el archivo.", 400);
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json("Origen no permitido.", 403);
  try {
    const db = await requireAdmin();
    const input = await limitedJson(request);
    const id = z.uuid().parse(input.id);
    // Claim deletion atomically only while the object is unreferenced.
    // Concurrent reassignment cannot race with the subsequent Storage delete.
    const { data: m, error: claimError } = await db
      .from("media")
      .delete()
      .eq("id", id)
      .is("project_id", null)
      .eq("published", false)
      .eq("purpose", "gallery")
      .select("object_path")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!m)
      return json(
        "Para eliminarlo, desvincúlalo del proyecto, selecciona Galería y desactiva su publicación.",
        409,
      );
    const removed = await db.storage.from("portfolio").remove([m.object_path]);
    if (removed.error)
      return json(
        "El registro se retiró, pero el objeto privado requiere limpieza desde Supabase Storage.",
        503,
      );
    revalidatePath("/", "layout");
    return json("Archivo eliminado.");
  } catch {
    return json("No se pudo eliminar el archivo.", 400);
  }
}
