"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, sessionClient } from "@/lib/supabase/server";
import {
  assistantSchema,
  profileSchema,
  recordSchema,
  settingsSchema,
  tables,
} from "@/lib/schema";
import { cleanHtml } from "@/lib/sanitize";
const errorMessage = (e: unknown) =>
  e instanceof z.ZodError
    ? "Revisa los campos: " +
      e.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")
    : e instanceof Error
      ? e.message
      : "No se pudo completar la operación.";
export async function saveRecord(table: string, input: unknown) {
  try {
    const db = await requireAdmin();
    const t = z.enum(tables).parse(table);
    const value = recordSchema.parse(input);
    value.body = cleanHtml(value.body);
    let error;
    if (t === "projects") {
      if (!value.slug) throw new Error("El slug es obligatorio.");
      ({ error } = await db.rpc("save_project", { payload: value }));
    } else {
      const { id, title, summary, body, data, published, sort_order } = value;
      ({ error } = await db.from(t).upsert({
        ...(id ? { id } : {}),
        title,
        summary,
        body,
        data,
        published,
        sort_order,
      }));
    }
    if (error)
      throw new Error(
        error.code === "23505"
          ? "Ya existe un proyecto con ese slug."
          : "No se pudo guardar. Revisa la configuración y tus permisos.",
      );
    revalidatePath("/", "layout");
    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
export async function deleteRecord(table: string, id: string) {
  try {
    const db = await requireAdmin();
    const t = z.enum(tables).parse(table);
    z.uuid().parse(id);
    const { error } = await db.from(t).delete().eq("id", id);
    if (error)
      throw new Error(
        "No se puede eliminar: desvincula primero sus archivos multimedia.",
      );
    revalidatePath("/", "layout");
    return { ok: true, message: "Registro eliminado." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
export async function saveConfig(id: string, input: unknown) {
  try {
    const db = await requireAdmin();
    const key = z.enum(["profile", "settings", "assistant"]).parse(id);
    const schema =
      key === "profile"
        ? profileSchema
        : key === "settings"
          ? settingsSchema
          : assistantSchema;
    const data = schema.parse(input);
    const { error } = await db.from("configuration").upsert({ id: key, data });
    if (error) throw new Error("No se pudo guardar la configuración.");
    revalidatePath("/", "layout");
    return { ok: true, message: "Configuración guardada." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
export async function saveSections(input: unknown) {
  try {
    const db = await requireAdmin();
    const values = z
      .array(
        z.object({
          id: z.enum([
            "sobre-mi",
            "portafolio",
            "servicios",
            "experiencia",
            "formacion",
            "testimonios",
            "contacto",
          ]),
          title: z.string().min(1).max(180),
          visible: z.boolean(),
          sort_order: z.number().int().min(0).max(100),
        }),
      )
      .max(7)
      .parse(input);
    const { error } = await db.from("sections").upsert(values);
    if (error) throw new Error("No se pudieron guardar las secciones.");
    revalidatePath("/", "layout");
    return { ok: true, message: "Secciones actualizadas." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
export async function updateContact(id: string, status: string) {
  try {
    const db = await requireAdmin();
    z.uuid().parse(id);
    const state = z.enum(["pending", "handled"]).parse(status);
    const { error } = await db
      .from("contacts")
      .update({ status: state })
      .eq("id", id);
    if (error) throw new Error("No se pudo actualizar.");
    revalidatePath("/admin/contactos");
    return { ok: true, message: "Solicitud actualizada." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
export async function authAction(
  mode: string,
  email: string,
  password: string,
) {
  try {
    const db = await sessionClient();
    if (mode === "logout") {
      const { error } = await db.auth.signOut();
      if (error) throw error;
      return { ok: true, message: "Sesión cerrada." };
    }
    if (mode === "recover") {
      z.email().parse(email);
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback`,
      });
      if (error) throw new Error("No se pudo solicitar la recuperación.");
      return {
        ok: true,
        message:
          "Si el correo está registrado, recibirás instrucciones de recuperación.",
      };
    }
    if (mode === "update") {
      z.string().min(12).max(128).parse(password);
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) throw new Error("El enlace de recuperación ha caducado.");
      const { error } = await db.auth.updateUser({ password });
      if (error) throw new Error("No se pudo actualizar la contraseña.");
      return {
        ok: true,
        message: "Contraseña actualizada. Ya puedes iniciar sesión.",
      };
    }
    z.email().parse(email);
    z.string().min(1).max(128).parse(password);
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Correo o contraseña incorrectos.");
    try {
      await requireAdmin();
    } catch {
      await db.auth.signOut();
      throw new Error("Esta cuenta no tiene permisos de administración.");
    }
    return { ok: true, message: "Sesión iniciada." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
