"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/schema";
import { z } from "zod";
import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
export function ContactForm({ available }: { available: boolean }) {
  const [notice, setNotice] = useState("");
  const [startedAt] = useState(() => Date.now());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { startedAt, website: "" },
  });
  const submit = handleSubmit(async (values) => {
    setNotice("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await r.json();
      setNotice(data.message);
      if (r.ok)
        reset({
          name: "",
          email: "",
          subject: "",
          message: "",
          website: "",
          startedAt,
        });
    } catch {
      setNotice("No se pudo enviar. Inténtalo de nuevo más tarde.");
    }
  });
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        {(
          [
            ["name", "Tu nombre"],
            ["email", "Correo electrónico"],
            ["subject", "¿De qué hablamos?"],
          ] as const
        ).map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              {...register(name)}
              type={name === "email" ? "email" : "text"}
              aria-invalid={!!errors[name]}
              placeholder={
                name === "name"
                  ? "Cómo te llamas"
                  : name === "email"
                    ? "tu@correo.com"
                    : "Cuéntame la idea"
              }
            />
            {errors[name] && (
              <small role="alert">
                {name === "email"
                  ? "Escribe un correo válido."
                  : "Completa este campo."}
              </small>
            )}
          </label>
        ))}
      </div>
      <label>
        Tu mensaje
        <textarea
          rows={4}
          {...register("message")}
          placeholder="Un poco de contexto es un buen comienzo…"
        />
        {errors.message && (
          <small role="alert">Escribe entre 10 y 4000 caracteres.</small>
        )}
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Sitio web
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <label className="checkbox-label">
        <input type="checkbox" {...register("consent")} />
        Autorizo el uso de mis datos para responder a esta solicitud, según el{" "}
        <a href="/privacidad">aviso de privacidad</a>.
      </label>
      {errors.consent && (
        <small role="alert">Debes aceptar el tratamiento de tus datos.</small>
      )}
      <Button disabled={!available || isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
        <ArrowUpRight size={17} />
      </Button>
      {!available && (
        <p className="muted">
          El formulario estará disponible al configurar Supabase y el aviso de
          privacidad.
        </p>
      )}
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </form>
  );
}
