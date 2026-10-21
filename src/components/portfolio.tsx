"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  X,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ContentRecord, Media, Profile } from "@/lib/schema";
export function Header({
  name,
  visibleSections,
}: {
  name: string;
  visibleSections: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        {name}
        <span>COMUNICACIÓN & NARRATIVAS</span>
      </Link>
      <button
        className="mobile-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav aria-label="Navegación principal" className={open ? "nav-open" : ""}>
        {visibleSections.includes("sobre-mi") && (
          <Link onClick={() => setOpen(false)} href="/#sobre-mi">
            Sobre mí
          </Link>
        )}
        {visibleSections.includes("portafolio") && (
          <Link onClick={() => setOpen(false)} href="/#portafolio">
            Portafolio
          </Link>
        )}
        {visibleSections.includes("servicios") && (
          <Link onClick={() => setOpen(false)} href="/#servicios">
            Servicios
          </Link>
        )}
        {visibleSections.includes("contacto") && (
          <Link
            onClick={() => setOpen(false)}
            href="/#contacto"
            className="nav-contact"
          >
            Conversemos <ArrowUpRight size={16} />
          </Link>
        )}
      </nav>
    </header>
  );
}
export function Hero({
  profile,
  portrait,
  demo,
  visibleSections,
}: {
  profile: Profile;
  portrait?: Media;
  demo: boolean;
  visibleSections: string[];
}) {
  const reduced = useReducedMotion();
  return (
    <section className="hero">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-copy"
      >
        <div className="eyebrow">
          <span className="dot" />
          {profile.specialty} · {profile.location}
        </div>
        <h1>
          {profile.headline.split(". ").map((s, i) => (
            <span key={i} className={i === 1 ? "italic-accent" : ""}>
              {s}
              {i === 0 && profile.headline.includes(". ") ? "." : ""}{" "}
            </span>
          ))}
        </h1>
        <p>{profile.introduction}</p>
        <div className="hero-actions">
          {visibleSections.includes("portafolio") && (
            <Link className="button button-primary" href="#portafolio">
              Explorar mi trabajo <ArrowUpRight size={18} />
            </Link>
          )}
          {visibleSections.includes("contacto") && (
            <Link className="text-link" href="#contacto">
              Hablemos <ArrowRight size={16} />
            </Link>
          )}
        </div>
        {visibleSections.includes("sobre-mi") && (
          <a href="#sobre-mi" className="discover">
            <ArrowDown size={16} /> UN POCO MÁS DE MÍ
          </a>
        )}
      </motion.div>
      <div className="hero-visual">
        {portrait ? (
          <Image
            src={portrait.url!}
            alt={portrait.alt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 45vw"
            unoptimized
          />
        ) : (
          <div className="editorial-art">
            <span className="art-top">
              EL ARTE DE
              <br />
              CONTAR HISTORIAS
            </span>
            <div className="art-circle" />
            <div className="art-arch" />
            <span className="art-serif">
              Voces.
              <br />
              <i>Ideas.</i>
              <br />
              Conexiones.
            </span>
            <span className="art-bottom">
              UNA MIRADA PROPIA — UN PROPÓSITO COMPARTIDO
            </span>
          </div>
        )}
        <div className="visual-note">
          <span>01 / UNA MIRADA PROPIA</span>
          <p>
            {portrait
              ? "Cada historia empieza con una forma de mirar."
              : "Aquí irá tu fotografía. Por ahora, una composición editorial."}
          </p>
          {demo && <small>Diseño de demostración</small>}
        </div>
      </div>
    </section>
  );
}
export function Projects({
  projects,
  categories,
  media,
  demo,
}: {
  projects: ContentRecord[];
  categories: ContentRecord[];
  media: Media[];
  demo: boolean;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? projects.filter((p) => p.category_id === filter)
    : projects;
  return (
    <>
      <div className="filters" aria-label="Filtrar proyectos">
        <button aria-pressed={!filter} onClick={() => setFilter("")}>
          Todos los proyectos <span>{projects.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id!)}
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {filtered.map((p, i) => {
          const cover = media.find(
            (m) => m.project_id === p.id && m.purpose === "cover",
          );
          return (
            <Link
              href={`/proyectos/${p.slug}`}
              className={`project-card ${p.featured && !filter ? "featured" : ""}`}
              key={p.id}
            >
              <div className={`project-image art-${i % 3}`}>
                {cover ? (
                  <Image
                    src={cover.url!}
                    alt={cover.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 760px) 100vw, 55vw"
                  />
                ) : (
                  <div className="project-art">
                    <span>
                      {demo ? "ESTUDIO DE DEMOSTRACIÓN" : "PROYECTO EDITORIAL"}
                    </span>
                    <strong>{p.title}</strong>
                    <div className="poster-lines" />
                    <small>COMUNICACIÓN / NARRATIVAS</small>
                  </div>
                )}
                <span className="project-open">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <div className="project-meta">
                <span>
                  {categories.find((c) => c.id === p.category_id)?.title ||
                    "Proyecto"}
                </span>
                <span>{p.data?.date || (demo ? "DEMO" : "")}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
            </Link>
          );
        })}
      </div>
      {!filtered.length && (
        <p className="empty">No hay proyectos publicados en esta categoría.</p>
      )}
    </>
  );
}
export function Services({ items }: { items: ContentRecord[] }) {
  return (
    <div className="services-list">
      {items.map((s, i) => (
        <details key={s.id}>
          <summary>
            <span className="service-number">0{i + 1}</span>
            <h3>{s.title}</h3>
            <Plus size={24} />
          </summary>
          <div className="service-content">
            <p>{s.summary}</p>
            {s.body && <p>{s.body.replace(/<[^>]*>/g, "")}</p>}
          </div>
        </details>
      ))}
    </div>
  );
}
