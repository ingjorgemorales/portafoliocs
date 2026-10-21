"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveConfig, saveSections } from "@/app/admin/actions";
import type {
  AssistantSettings,
  Profile,
  Section,
  Settings,
} from "@/lib/schema";
import { Button } from "./ui/button";
const labels: Record<string, string> = {
  name: "Nombre",
  specialty: "Especialidad",
  headline: "Titular de inicio",
  introduction: "Presentación",
  biography: "Biografía",
  approach: "Enfoque profesional",
  skills: "Habilidades (separadas por coma)",
  location: "Ubicación",
  email: "Correo de contacto",
  whatsapp: "WhatsApp (código de país y número, sin +)",
  instagram: "Instagram (URL)",
  linkedin: "LinkedIn (URL)",
  seo_title: "Título del sitio",
  seo_description: "Descripción para buscadores y redes",
  privacy:
    "Aviso de privacidad: responsable, finalidad, conservación y canal para ejercer derechos",
  welcome: "Mensaje de bienvenida",
  instructions: "Tono y alcance (no modifica restricciones de privacidad)",
  enabled: "Activar asistente virtual",
  palette: "Paleta de color",
  typography: "Combinación tipográfica",
};
export function SettingsEditor({
  id,
  initial,
  fields,
  demo,
}: {
  id: "profile" | "settings" | "assistant";
  initial: Profile | Settings | AssistantSettings;
  fields: string[];
  demo: boolean;
}) {
  const [values, setValues] = useState<Record<string, string | boolean>>({
    ...initial,
  });
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <form
      className="settings-form panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const r = await saveConfig(id, values);
        setNotice(r.message);
        setPending(false);
        if (r.ok) router.refresh();
      }}
    >
      <fieldset disabled={demo || pending}>
        <div className="form-grid">
          {fields.map((key) => (
            <label
              key={key}
              className={
                typeof values[key] === "boolean" ? "checkbox-label" : ""
              }
            >
              {labels[key] || key}
              {typeof values[key] === "boolean" ? (
                <input
                  type="checkbox"
                  checked={!!values[key]}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.checked })
                  }
                />
              ) : key === "palette" || key === "typography" ? (
                <select
                  value={String(values[key])}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                >
                  {(key === "palette"
                    ? [
                        ["petroleo", "Marfil y verde petróleo"],
                        ["terracota", "Marfil y terracota"],
                        ["tinta", "Marfil y azul tinta"],
                      ]
                    : [
                        ["editorial", "Cormorant Garamond + DM Sans"],
                        ["clasica", "Libre Baskerville + DM Sans"],
                        ["moderna", "Manrope"],
                      ]
                  ).map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ) : [
                  "biography",
                  "introduction",
                  "approach",
                  "privacy",
                  "instructions",
                  "welcome",
                  "seo_description",
                ].includes(key) ? (
                <textarea
                  rows={key === "privacy" ? 9 : 4}
                  value={String(values[key] || "")}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                />
              ) : (
                <input
                  value={String(values[key] || "")}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
        </div>
        <Button>{pending ? "Guardando…" : "Guardar configuración"}</Button>
      </fieldset>
      <p role="status" style={{ marginTop: 15 }}>
        {notice}
      </p>
    </form>
  );
}
export function SectionEditor({
  initial,
  demo,
}: {
  initial: Section[];
  demo: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const r = await saveSections(items);
        setNotice(r.message);
        setPending(false);
        if (r.ok) router.refresh();
      }}
    >
      <h2>Secciones del sitio</h2>
      <p className="muted">
        El número menor aparece primero. Las secciones sin contenido se ocultan
        automáticamente.
      </p>
      <fieldset disabled={demo || pending}>
        {items.map((s, i) => (
          <div className="section-row" key={s.id}>
            <input
              type="checkbox"
              aria-label={`Mostrar ${s.title}`}
              checked={s.visible}
              onChange={(e) =>
                setItems(
                  items.map((v, j) =>
                    j === i ? { ...v, visible: e.target.checked } : v,
                  ),
                )
              }
            />
            <label>
              Título
              <input
                value={s.title}
                onChange={(e) =>
                  setItems(
                    items.map((v, j) =>
                      j === i ? { ...v, title: e.target.value } : v,
                    ),
                  )
                }
              />
            </label>
            <label>
              Orden
              <input
                type="number"
                min={0}
                max={100}
                value={s.sort_order}
                onChange={(e) =>
                  setItems(
                    items.map((v, j) =>
                      j === i
                        ? { ...v, sort_order: Number(e.target.value) }
                        : v,
                    ),
                  )
                }
              />
            </label>
          </div>
        ))}
        <Button>Guardar secciones</Button>
      </fieldset>
      <p role="status">{notice}</p>
    </form>
  );
}
