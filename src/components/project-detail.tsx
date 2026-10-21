import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cleanHtml } from "@/lib/sanitize";
import { videoEmbed, type ContentRecord, type Media } from "@/lib/schema";
export function ProjectDetail({
  project: p,
  files,
  preview = false,
}: {
  project: ContentRecord;
  files: Media[];
  preview?: boolean;
}) {
  return (
    <main id="contenido" className="document-page project-detail">
      {preview && (
        <div className="notice">
          Vista previa privada · {p.published ? "Publicado" : "Borrador"}
        </div>
      )}
      <Link href={preview ? "/admin/proyectos" : "/#portafolio"}>
        ← Volver a {preview ? "proyectos" : "portafolio"}
      </Link>
      <p className="eyebrow">{p.data.tags}</p>
      <h1>{p.title}</h1>
      <p className="large-copy">{p.summary}</p>
      <div className="project-facts">
        {p.data.client && (
          <div>
            <small>ORGANIZACIÓN</small>
            <p>{p.data.client}</p>
          </div>
        )}
        {p.data.date && (
          <div>
            <small>FECHA</small>
            <p>{p.data.date}</p>
          </div>
        )}
      </div>
      {files
        .filter((f) => f.mime.startsWith("image/"))
        .map((f) => (
          <figure key={f.id}>
            <Image
              src={f.url!}
              alt={f.alt}
              width={1400}
              height={900}
              unoptimized
              className="detail-image"
            />
            {f.alt && <figcaption>{f.alt}</figcaption>}
          </figure>
        ))}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: cleanHtml(p.body) }}
      />
      {(
        [
          ["El contexto", p.data.objective],
          ["Mi participación", p.data.role],
          ["Los resultados", p.data.results],
          ["Créditos", p.data.credits],
        ] as const
      )
        .filter(([, value]) => value)
        .map(([title, value]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p className="preserve-whitespace">{value}</p>
          </section>
        ))}
      <div className="project-links">
        {p.links.map((l, i) => (
          <div key={i}>
            <a
              className="button button-outline"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label}
              <ArrowUpRight size={18} />
            </a>
            {l.type === "video" && videoEmbed(l.url) && (
              <iframe
                src={videoEmbed(l.url)!}
                title={l.label}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            )}
          </div>
        ))}
      </div>
      {files
        .filter((f) => !f.mime.startsWith("image/"))
        .map((f) => (
          <div key={f.id}>
            {f.mime.startsWith("audio/") ? (
              <>
                <p>{f.name}</p>
                <audio controls preload="none" src={f.url} />
              </>
            ) : (
              <a className="text-link" href={f.url}>
                {f.name} ↓
              </a>
            )}
          </div>
        ))}
    </main>
  );
}
