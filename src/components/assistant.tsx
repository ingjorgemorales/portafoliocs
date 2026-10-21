"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import type { AssistantSettings } from "@/lib/schema";
import { Button } from "./ui/button";
export function Assistant({
  settings,
  contactHref,
}: {
  settings: AssistantSettings;
  contactHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<
    { role: string; text: string; links?: { label: string; url: string }[] }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const hasOpened = useRef(false);
  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      inputRef.current?.focus();
    } else if (hasOpened.current) launcherRef.current?.focus();
  }, [open]);
  if (!settings.enabled) return null;
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const message = input;
    setInput("");
    setBusy(true);
    setMessages((v) => [...v, { role: "Tú", text: message }]);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await r.json();
      setMessages((v) => [
        ...v,
        { role: settings.name, text: data.message, links: data.links },
      ]);
    } catch {
      setMessages((v) => [
        ...v,
        {
          role: settings.name,
          text: "No puedo responder ahora. Puedes usar los canales de contacto del portafolio.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="assistant">
      {open ? (
        <section
          className="chat-panel"
          aria-label={settings.name}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="chat-heading">
            <Sparkles size={18} />
            <div>
              <strong>{settings.name}</strong>
              <small>Asistente virtual · IA</small>
            </div>
            <button
              aria-label="Cerrar asistente"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="chat-messages" aria-live="polite">
            <p>{settings.welcome}</p>
            {messages.map((m, i) => (
              <div
                className={m.role === "Tú" ? "chat-user" : "chat-answer"}
                key={i}
              >
                <small>{m.role}</small>
                <p>{m.text}</p>
                {m.links?.map((l) => (
                  <a
                    key={l.url}
                    className="text-link"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            ))}
            {busy && <p>Consultando el contenido publicado…</p>}
          </div>
          {contactHref && (
            <Link
              className="chat-contact"
              href={contactHref}
              onClick={() => setOpen(false)}
            >
              Prefiero contactar directamente ↗
            </Link>
          )}
          <form onSubmit={send}>
            <input
              ref={inputRef}
              aria-label="Pregunta al asistente"
              placeholder="¿Qué te gustaría conocer?"
              maxLength={1000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              size="icon"
              disabled={busy || !input.trim()}
              aria-label="Enviar pregunta"
            >
              <Send size={17} />
            </Button>
          </form>
          <small className="chat-disclaimer">
            No envíes datos sensibles. Las respuestas pueden contener errores.
          </small>
        </section>
      ) : (
        <button
          ref={launcherRef}
          className="chat-launcher"
          onClick={() => setOpen(true)}
        >
          <Sparkles size={18} />
          Explora con mi asistente
        </button>
      )}
    </aside>
  );
}
