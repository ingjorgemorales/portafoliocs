import Link from "next/link";
import { notFound } from "next/navigation";
import { adminNavigation, contentRoutes } from "@/lib/admin-navigation";
import { configuration, media, records } from "@/lib/content";
import { configured, isDemo, requireAdmin } from "@/lib/supabase/server";
import { RecordManager } from "@/components/record-manager";
import { SettingsEditor, SectionEditor } from "@/components/settings-editor";
import { MediaManager } from "@/components/media-manager";
import { Contacts } from "@/components/contacts";
export default async function Admin({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const slug = section?.[0] || "";
  if ((section?.length || 0) > 1 || !adminNavigation.some(([s]) => s === slug))
    notFound();
  const demo = isDemo();
  const db = demo ? undefined : await requireAdmin();
  const config = await configuration(db);
  const title = adminNavigation.find(([s]) => s === slug)![1];
  let content: React.ReactNode;
  if (slug in contentRoutes) {
    const table = contentRoutes[slug as keyof typeof contentRoutes];
    content = (
      <RecordManager
        table={table}
        items={await records(table, db)}
        categories={table === "projects" ? await records("categories", db) : []}
        demo={demo}
      />
    );
  } else if (slug === "perfil")
    content = (
      <>
        <SettingsEditor
          id="profile"
          initial={config.profile}
          fields={Object.keys(config.profile)}
          demo={demo}
        />
        <p className="muted">
          Tu fotografía y hoja de vida se administran desde{" "}
          <Link href="/admin/multimedia">
            <u>Multimedia</u>
          </Link>
          .
        </p>
      </>
    );
  else if (slug === "apariencia")
    content = (
      <>
        <SettingsEditor
          id="settings"
          initial={config.settings}
          fields={["palette", "typography"]}
          demo={demo}
        />
        <SectionEditor initial={config.sections} demo={demo} />
      </>
    );
  else if (slug === "asistente")
    content = (
      <>
        <SettingsEditor
          id="assistant"
          initial={config.assistant}
          fields={Object.keys(config.assistant)}
          demo={demo}
        />
        <div className="panel">
          <h2>Preguntas frecuentes</h2>
          <RecordManager
            table="faqs"
            items={await records("faqs", db)}
            demo={demo}
          />
        </div>
        <div className="panel">
          <h2>Fuentes públicas autorizadas</h2>
          <p className="muted">
            Añade una URL y un resumen autorizado. El asistente utiliza ese
            resumen; no descarga páginas externas.
          </p>
          <RecordManager
            table="sources"
            items={await records("sources", db)}
            demo={demo}
          />
        </div>
      </>
    );
  else if (slug === "multimedia")
    content = (
      <MediaManager
        files={await media(db)}
        projects={await records("projects", db)}
        demo={demo}
      />
    );
  else if (slug === "contactos") {
    const result = db
      ? await db
          .from("contacts")
          .select("*")
          .order("created_at", { ascending: false })
      : { data: [], error: null };
    if (result.error) throw new Error("No fue posible cargar los mensajes.");
    content = <Contacts items={result.data || []} />;
  } else if (slug === "configuracion")
    content = (
      <>
        <SettingsEditor
          id="settings"
          initial={config.settings}
          fields={["seo_title", "seo_description", "privacy"]}
          demo={demo}
        />
        <div className="panel">
          <h2>Conexión y puesta en marcha</h2>
          <p>
            Supabase:{" "}
            <strong>{configured() ? "Configurado" : "Pendiente"}</strong> ·
            OpenAI:{" "}
            <strong>
              {process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL
                ? "Configurado"
                : "Pendiente"}
            </strong>
          </p>
          <ol className="prose">
            <li>Copia .env.example a .env.local y completa las variables.</li>
            <li>
              Aplica la migración SQL en tu proyecto Supabase de desarrollo.
            </li>
            <li>
              Desactiva el registro público y crea un usuario desde Supabase
              Auth.
            </li>
            <li>Añade su UUID a administrators desde el editor SQL.</li>
            <li>Reinicia el servidor y accede a /admin/login.</li>
          </ol>
          <p className="muted">
            El README incluye los comandos, la alternativa local con Docker y
            los pasos de despliegue. Las credenciales se gestionan en el entorno
            del servidor.
          </p>
        </div>
      </>
    );
  else {
    const projects = await records("projects", db);
    const files = await media(db);
    content = (
      <>
        <div className="stats">
          <div className="stat">
            <strong>{projects.length}</strong>
            <span>Proyectos</span>
          </div>
          <div className="stat">
            <strong>{projects.filter((p) => p.published).length}</strong>
            <span>Publicados</span>
          </div>
          <div className="stat">
            <strong>{files.length}</strong>
            <span>Archivos multimedia</span>
          </div>
        </div>
        <section className="panel">
          <span className="eyebrow">TODO EMPIEZA CON UNA HISTORIA</span>
          <h2 style={{ fontSize: 40, marginTop: 18 }}>
            Haz que tu trabajo hable por ti.
          </h2>
          <p>
            Este es tu espacio para dar forma al portafolio. Completa tu perfil,
            añade un proyecto y compártelo cuando esté listo.
          </p>
          <div className="admin-links">
            <Link className="button button-primary" href="/admin/proyectos">
              Gestionar proyectos ↗
            </Link>
            <Link className="button button-outline" href="/admin/perfil">
              Completar mi perfil
            </Link>
          </div>
        </section>
        <section className="panel">
          <h2>Tu lista editorial</h2>
          <p>01 · Presenta tu enfoque en Mi perfil.</p>
          <p>02 · Organiza categorías, servicios y trayectoria.</p>
          <p>03 · Añade fotografía, portadas y hoja de vida.</p>
          <p>04 · Revisa el aviso de privacidad y los canales de contacto.</p>
          <p>05 · Previsualiza tus borradores antes de publicarlos.</p>
        </section>
      </>
    );
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>{slug ? title : "Tu espacio, tus historias."}</h1>
          <p>
            {slug
              ? "Edita, organiza y publica a tu ritmo."
              : "Una mirada a tu portafolio."}
          </p>
        </div>
      </div>
      {content}
    </>
  );
}
