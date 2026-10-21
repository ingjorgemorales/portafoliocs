"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContact } from "@/app/admin/actions";
import { Button } from "./ui/button";
export type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};
export function Contacts({ items }: { items: Contact[] }) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <>
      {!items.length && (
        <div className="empty">No hay solicitudes recibidas.</div>
      )}
      {items.map((c) => (
        <article className="contact-item" key={c.id}>
          <span className="status-badge">
            {c.status === "pending" ? "Pendiente" : "Atendido"}
          </span>
          <h2>{c.subject}</h2>
          <small>
            {c.name} · <a href={`mailto:${c.email}`}>{c.email}</a> ·{" "}
            {new Date(c.created_at).toLocaleDateString("es-CO", {
              timeZone: "America/Bogota",
            })}
          </small>
          <p>{c.message}</p>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const r = await updateContact(
                c.id,
                c.status === "pending" ? "handled" : "pending",
              );
              setNotice(r.message);
              setBusy(false);
              if (r.ok) router.refresh();
            }}
          >
            Marcar como {c.status === "pending" ? "atendido" : "pendiente"}
          </Button>
        </article>
      ))}
      <p role="status">{notice}</p>
    </>
  );
}
