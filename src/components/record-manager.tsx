"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  recordSchema,
  type ContentRecord,
  type ContentTable,
} from "@/lib/schema";
import { saveRecord, deleteRecord } from "@/app/admin/actions";
import { Button } from "./ui/button";
import { RichEditor } from "./rich-editor";
const dataLabels = {
  client: "Cliente u organización",
  date: "Fecha",
  objective: "Objetivo y contexto",
  role: "Participación específica",
  results: "Resultados (opcional)",
  credits: "Créditos de colaboradores",
  tags: "Etiquetas (separadas por coma)",
  seo_title: "Título para buscadores",
  seo_description: "Descripción para buscadores",
  organization: "Organización o institución",
  period: "Periodo",
  author: "Autor o cargo",
  url: "URL pública autorizada",
};
export function RecordManager({
  table,
  items,
  categories = [],
  demo = false,
}: {
  table: ContentTable;
  items: ContentRecord[];
  categories?: ContentRecord[];
  demo?: boolean;
}) {
  const [editing, setEditing] = useState<ContentRecord | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function remove(item: ContentRecord) {
    if (
      !confirm(`¿Eliminar «${item.title}»? Esta acción no se puede deshacer.`)
    )
      return;
    setPending(true);
    const r = await deleteRecord(table, item.id!);
    setNotice(r.message);
    setPending(false);
    if (r.ok) router.refresh();
  }
  if (editing)
    return (
      <RecordEditor
        key={editing === "new" ? "new" : editing.id}
        table={table}
        item={editing === "new" ? undefined : editing}
        categories={categories}
        demo={demo}
        onClose={() => setEditing(null)}
        onSave={() => {
          setEditing(null);
          setNotice("Cambios guardados.");
          router.refresh();
        }}
      />
    );
  return (
    <>
      <div className="admin-links">
        <Button disabled={demo} onClick={() => setEditing("new")}>
          <Plus size={16} />
          Crear registro
        </Button>
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <div className="panel" style={{ marginTop: 24 }}>
        {!items.length ? (
          <p className="empty">
            Aún no hay registros. Crea el primero y publícalo cuando esté listo.
          </p>
        ) : (
          items.map((item) => (
            <article className="record-row" key={item.id}>
              <div>
                <span
                  className={`status-badge ${item.published ? "" : "draft"}`}
                >
                  {item.published ? "Publicado" : "Borrador"}
                </span>
                <h3>{item.title}</h3>
                <small>
                  Orden {item.sort_order} {item.featured ? "· Destacado" : ""}
                </small>
              </div>
              <div className="row-actions">
                {table === "projects" && (
                  <Link
                    className="button button-outline button-sm"
                    href={
                      demo
                        ? `/proyectos/${item.slug}`
                        : `/admin/vista-previa/${item.id}`
                    }
                  >
                    <Eye size={15} />
                    Vista previa
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(item)}
                >
                  <Pencil size={15} />
                  {demo ? "Inspeccionar" : "Editar"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={demo || pending}
                  aria-label={`Eliminar ${item.title}`}
                  onClick={() => remove(item)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
function RecordEditor({
  table,
  item,
  categories,
  demo,
  onClose,
  onSave,
}: {
  table: ContentTable;
  item?: ContentRecord;
  categories: ContentRecord[];
  demo: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [notice, setNotice] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof recordSchema>, unknown, ContentRecord>({
    resolver: zodResolver(recordSchema),
    defaultValues: item || {
      title: "",
      summary: "",
      body: "",
      sort_order: 0,
      published: false,
      slug: "",
      category_id: "",
      featured: false,
      links: [],
    },
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "links",
  });
  const project = table === "projects";
  const keys: (keyof typeof dataLabels)[] = project
    ? [
        "client",
        "date",
        "objective",
        "role",
        "results",
        "credits",
        "tags",
        "seo_title",
        "seo_description",
      ]
    : table === "experience" || table === "education"
      ? ["organization", "period"]
      : table === "testimonials"
        ? ["author"]
        : table === "sources"
          ? ["url"]
          : [];
  const submit = handleSubmit(async (value) => {
    if (demo) return;
    const r = await saveRecord(table, {
      ...value,
      ...(!project ? { slug: undefined } : {}),
      links: value.links.map((l, i) => ({ ...l, sort_order: i })),
    });
    setNotice(r.message);
    if (r.ok) onSave();
  });
  return (
    <form className="editor-form" onSubmit={submit}>
      <h2>{item ? "Editar contenido" : "Una nueva historia"}</h2>
      <fieldset disabled={demo}>
        <div className="form-grid">
          <label>
            Título
            <input {...register("title")} />
            {errors.title && (
              <small role="alert">El título es obligatorio.</small>
            )}
          </label>
          {project && (
            <label>
              Slug único
              <input {...register("slug")} placeholder="mi-proyecto" />
              {errors.slug && (
                <small role="alert">
                  Usa letras minúsculas, números y guiones.
                </small>
              )}
            </label>
          )}
          <label>
            Orden de presentación
            <input
              type="number"
              min={0}
              {...register("sort_order", { valueAsNumber: true })}
            />
          </label>
          {project && (
            <label>
              Categoría
              <select {...register("category_id")}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <label>
          Resumen
          <textarea rows={3} {...register("summary")} />
        </label>
        <h3>Descripción</h3>
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <RichEditor
              value={field.value || ""}
              onChange={field.onChange}
              disabled={demo}
            />
          )}
        />
        <div className="form-grid" style={{ marginTop: 24 }}>
          {keys.map((key) => (
            <label key={key}>
              {dataLabels[key]}
              {[
                "objective",
                "role",
                "results",
                "credits",
                "seo_description",
              ].includes(key) ? (
                <textarea rows={3} {...register(`data.${key}`)} />
              ) : (
                <input
                  {...register(`data.${key}`)}
                  type={key === "date" ? "date" : "text"}
                />
              )}
            </label>
          ))}
        </div>
        {project && (
          <>
            <h3>Hipervínculos</h3>
            <p className="muted">
              Puedes publicar solo texto y enlaces. Los videos de YouTube y
              Vimeo admiten reproducción incrustada.
            </p>
            {fields.map((field, i) => (
              <div className="link-row" key={field.id}>
                <div className="form-grid">
                  <label>
                    Texto del botón
                    <input {...register(`links.${i}.label`)} />
                  </label>
                  <label>
                    URL
                    <input
                      {...register(`links.${i}.url`)}
                      placeholder="https://…"
                    />
                  </label>
                  <label>
                    Tipo
                    <select {...register(`links.${i}.type`)}>
                      {[
                        "articulo",
                        "video",
                        "redes",
                        "web",
                        "podcast",
                        "documento",
                        "otro",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="row-actions">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={i === 0}
                    aria-label="Subir enlace"
                    onClick={() => move(i, i - 1)}
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={i === fields.length - 1}
                    aria-label="Bajar enlace"
                    onClick={() => move(i, i + 1)}
                  >
                    <ArrowDown size={14} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(i)}
                  >
                    Quitar enlace
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  label: "",
                  url: "",
                  type: "web",
                  sort_order: fields.length,
                })
              }
            >
              <Plus size={14} />
              Añadir enlace
            </Button>
            <p className="muted" style={{ marginTop: 15 }}>
              Portada, galería, documentos y audio: guarda el proyecto y
              asígnalos desde Multimedia.
            </p>
            <label className="checkbox-label">
              <input type="checkbox" {...register("featured")} />
              Proyecto destacado
            </label>
          </>
        )}
        <label className="checkbox-label">
          <input type="checkbox" {...register("published")} />
          Publicar este contenido
        </label>
      </fieldset>
      {Object.keys(errors).length > 0 && (
        <p role="alert">
          Revisa los campos. Verifica las URL, los límites de texto y el orden.
        </p>
      )}
      <div className="editor-actions">
        <Button disabled={demo || isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Volver
        </Button>
        <p role="status">{notice}</p>
      </div>
    </form>
  );
}
