import { createHash } from "node:crypto";
import { configuration } from "@/lib/content";
import { contactSchema } from "@/lib/schema";
import { configured, serviceClient } from "@/lib/supabase/server";
import { clientKey, json, limitedJson, quota, sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json("Origen no permitido.", 403);
  if (!configured()) return json("El formulario aún no está configurado.", 503);
  try {
    const value = contactSchema.safeParse(await limitedJson(request));
    if (!value.success)
      return json("Revisa los campos y el consentimiento.", 400);
    if (
      Date.now() - value.data.startedAt < 3000 ||
      Date.now() - value.data.startedAt > 86400000
    )
      return json(
        "Actualiza la página y completa el formulario con calma.",
        400,
      );
    if (
      !(await quota(`contact:${clientKey(request)}`, 5, 3600)) ||
      !(await quota("contact:global", 300, 86400))
    )
      return json(
        "Has alcanzado el límite de envíos. Inténtalo más tarde.",
        429,
      );
    const { settings } = await configuration();
    if (!settings.privacy)
      return json(
        "El aviso de privacidad está pendiente de configuración.",
        503,
      );
    const { name, email, subject, message } = value.data;
    const { error } = await serviceClient()
      .from("contacts")
      .insert({
        name,
        email,
        subject,
        message,
        privacy_version: createHash("sha256")
          .update(settings.privacy)
          .digest("hex"),
      });
    if (error)
      return json("No pudimos guardar tu mensaje. Inténtalo más tarde.", 503);
    return json(
      "Tu mensaje fue recibido. Gracias por iniciar esta conversación.",
      201,
    );
  } catch {
    return json(
      "El servicio no está disponible. Utiliza los canales de contacto directo.",
      503,
    );
  }
}
