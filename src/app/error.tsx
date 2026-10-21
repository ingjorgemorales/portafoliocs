"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="document-page">
      <h1>No pudimos cargar esta página.</h1>
      <p>Revisa la conexión y la configuración de Supabase.</p>
      <button className="button button-primary" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
