import Link from "next/link";
import { configuration } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Privacy() {
  const { settings } = await configuration();
  return (
    <main id="contenido" className="document-page">
      <Link href="/">← Volver al portafolio</Link>
      <h1>Aviso de privacidad</h1>
      <p className="preserve-whitespace">
        {settings.privacy ||
          "El responsable del portafolio aún no ha publicado su aviso de privacidad. El formulario de contacto permanece deshabilitado hasta completar esta información."}
      </p>
      <h2>Asistente virtual</h2>
      <p>
        Si decides utilizarlo, tu pregunta se envía al proveedor OpenAI para
        generar una respuesta. Esta aplicación no conserva conversaciones
        completas. Evita incluir información sensible. Se registran contadores
        temporales con identificadores seudonimizados para prevenir abusos.
      </p>
    </main>
  );
}
