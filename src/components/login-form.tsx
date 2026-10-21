"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAction } from "@/app/admin/actions";
import { Button } from "./ui/button";
export function LoginForm({
  available,
  initialMode = "login",
}: {
  available: boolean;
  initialMode?: string;
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <div className="login-card">
      <Link href="/" className="wordmark">
        Mi portafolio<span>ESPACIO EDITORIAL</span>
      </Link>
      <h1>
        {mode === "recover"
          ? "Recuperar acceso"
          : mode === "update"
            ? "Nueva contraseña"
            : "Bienvenida a tu espacio."}
      </h1>
      <p>Administra tus historias, proyectos y conexiones.</p>
      {!available && (
        <div className="notice">
          Configura Supabase para habilitar el inicio de sesión. No hay cuentas
          de prueba ni acceso administrativo público.
        </div>
      )}
      <form
        className="login-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const r = await authAction(mode, email, password);
          setNotice(r.message);
          setBusy(false);
          if (r.ok && mode === "login") {
            router.push("/admin");
            router.refresh();
          }
          if (r.ok && mode === "update") {
            setMode("login");
            setPassword("");
          }
        }}
      >
        {mode !== "update" && (
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {mode !== "recover" && (
          <label>
            Contraseña
            <input
              type="password"
              autoComplete={
                mode === "update" ? "new-password" : "current-password"
              }
              minLength={mode === "update" ? 12 : 1}
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        <Button disabled={!available || busy}>
          {busy
            ? "Procesando…"
            : mode === "recover"
              ? "Enviar instrucciones"
              : mode === "update"
                ? "Actualizar contraseña"
                : "Entrar al panel"}
        </Button>
        <p role="status">{notice}</p>
      </form>
      <div className="login-options">
        <Link href="/">← Volver al sitio</Link>
        <button
          onClick={() => {
            setMode(mode === "login" ? "recover" : "login");
            setNotice("");
          }}
        >
          {mode === "login" ? "Olvidé mi contraseña" : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
