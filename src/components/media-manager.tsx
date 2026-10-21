"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ContentRecord, Media } from "@/lib/schema";
import { Button } from "./ui/button";
const purposes = [
  ["gallery", "Galería / archivo"],
  ["cover", "Portada de proyecto"],
  ["portrait", "Fotografía de perfil"],
  ["cv", "Hoja de vida"],
  ["social", "Imagen para compartir"],
];
export function MediaManager({
  files,
  projects,
  demo,
}: {
  files: Media[];
  projects: ContentRecord[];
  demo: boolean;
}) {
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <>
      <form
        className="panel media-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setPending(true);
          setNotice("");
          try {
            const r = await fetch("/api/admin/media", {
              method: "POST",
              body: new FormData(form),
            });
            const data = await r.json();
            setNotice(data.message);
            if (r.ok) {
              form.reset();
              router.refresh();
            }
          } catch {
            setNotice("No se pudo completar la carga.");
          } finally {
            setPending(false);
          }
        }}
      >
        <h2>Subir un archivo</h2>
        <p className="muted">
          JPG, PNG, WebP, PDF, MP3 o WAV · Hasta 3 MB por archivo. Para videos y
          archivos extensos, utiliza enlaces externos.
        </p>
        <fieldset disabled={demo || pending}>
          <div className="form-grid">
            <label>
              Archivo
              <input
                name="file"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/wav"
              />
            </label>
            <label>
              Texto alternativo / descripción
              <input name="alt" maxLength={400} />
            </label>
            <label>
              Proyecto
              <select name="project_id">
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Uso
              <select name="purpose">
                {purposes.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Orden
              <input type="number" name="sort_order" defaultValue={0} min={0} />
            </label>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" name="published" value="true" />
            Publicar archivo general (sin proyecto)
          </label>
          <p className="muted">
            Los archivos vinculados a proyectos heredan su estado de
            publicación.
          </p>
          <Button>{pending ? "Subiendo…" : "Subir a Supabase"}</Button>
        </fieldset>
        <p role="status">{notice}</p>
      </form>
      <div className="media-grid">
        {files.map((file) => (
          <MediaItem
            key={file.id}
            file={file}
            projects={projects}
            demo={demo}
          />
        ))}
      </div>
      {!files.length && (
        <p className="empty">
          No hay archivos. Puedes publicar proyectos con texto y enlaces sin
          subir multimedia.
        </p>
      )}
    </>
  );
}
function MediaItem({
  file,
  projects,
  demo,
}: {
  file: Media;
  projects: ContentRecord[];
  demo: boolean;
}) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function request(method: string, body: unknown) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/media", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      setNotice(result.message);
      if (r.ok) router.refresh();
    } catch {
      setNotice("La operación no se pudo completar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="media-item"
      onSubmit={(e) => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(e.currentTarget));
        void request("PATCH", {
          ...values,
          id: file.id,
          published: values.published === "on",
        });
      }}
    >
      {file.mime.startsWith("image/") ? (
        <Image
          src={file.url!}
          width={400}
          height={220}
          unoptimized
          alt={file.alt}
        />
      ) : (
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          Abrir archivo ↗
        </a>
      )}
      <h3>{file.name}</h3>
      <fieldset disabled={demo || busy}>
        <label>
          Texto alternativo
          <input name="alt" defaultValue={file.alt} />
        </label>
        <label>
          Proyecto
          <select name="project_id" defaultValue={file.project_id || ""}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Uso
          <select name="purpose" defaultValue={file.purpose}>
            {purposes.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Orden
          <input
            type="number"
            name="sort_order"
            defaultValue={file.sort_order}
            min={0}
          />
        </label>
        <label className="checkbox-label">
          <input
            name="published"
            type="checkbox"
            defaultChecked={"published" in file && !!file.published}
          />
          Publicar cuando no tenga proyecto
        </label>
        <div className="row-actions">
          <Button size="sm">Guardar</Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  "¿Eliminar definitivamente este archivo sin referencias?",
                )
              )
                void request("DELETE", { id: file.id });
            }}
          >
            Eliminar
          </Button>
        </div>
      </fieldset>
      <p role="status">{notice}</p>
    </form>
  );
}
