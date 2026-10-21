import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="document-page">
      <span className="eyebrow">404 / PÁGINA NO ENCONTRADA</span>
      <h1>Esta historia aún no está aquí.</h1>
      <Link className="button button-primary" href="/">
        Volver al portafolio
      </Link>
    </main>
  );
}
