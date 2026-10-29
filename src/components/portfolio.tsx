"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  ArrowDown,
  ArrowUpRight,
  Menu,
  X,
  Plus,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useMotionEnabled } from "./motion-system";
import type { ContentRecord, Media, Profile } from "@/lib/schema";
const MotionLink = motion.create(Link);
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
  visibleSections,
}: {
  profile: Profile;
  portrait?: Media;
  demo: boolean;
  visibleSections: string[];
}) {
  const enabled = useMotionEnabled();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -65]);
  return (
    <section className="hero" ref={heroRef}>
      <motion.div
        className="hero-visual"
        style={{ y: enabled ? visualY : 0 }}
        initial={false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {portrait ? (
          <Image
            src={portrait.url!}
            alt={portrait.alt || `Retrato de ${profile.name}`}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
            unoptimized
          />
        ) : (
          <div
            className="portrait-placeholder"
            role="img"
            aria-label="Espacio reservado para la fotografía de Leonela Garcia Padilla"
          >
            <span className="portrait-index">01 / LEONELA</span>
            <div className="portrait-frame">
              <Camera size={44} strokeWidth={1} aria-hidden="true" />
              <strong>
                Aquí va
                <br />
                su fotografía.
              </strong>
              <span>LEONELA GARCIA PADILLA</span>
            </div>
            <p>
              Un retrato suyo, en primer plano.
              <br />
              La primera mirada de este portafolio.
            </p>
          </div>
        )}
        <div className="portrait-caption">
          <span>{profile.name}</span>
          <span>{portrait ? profile.specialty : "Fotografía pendiente"}</span>
        </div>
      </motion.div>
      <motion.div
        initial={enabled ? { opacity: 0, y: 18 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-copy"
      >
        <div className="eyebrow">
          <span className="dot" />
          {profile.specialty} · {profile.location}
        </div>
        <motion.p
          className="hero-name"
          initial={enabled ? { opacity: 0, x: -20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.65 }}
        >
          Soy {profile.name}
        </motion.p>
        <h1>
          {profile.headline.split(". ").map((s, i) => (
            <motion.span
              key={i}
              className={i === 1 ? "italic-accent" : ""}
              initial={
                enabled ? { opacity: 0, y: 38, filter: "blur(7px)" } : false
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: enabled ? 0.9 : 0,
                delay: enabled ? 0.2 + i * 0.22 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {s}
              {i === 0 && profile.headline.includes(". ") ? "." : ""}{" "}
            </motion.span>
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
  const enabled = useMotionEnabled();
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
      <motion.div layout={enabled} className="project-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => {
            const cover = media.find(
              (m) => m.project_id === p.id && m.purpose === "cover",
            );
            return (
              <MotionLink
                href={`/proyectos/${p.slug}`}
                className={`project-card ${p.featured && !filter ? "featured" : ""}`}
                key={p.id}
                layout={enabled}
                initial={enabled ? { opacity: 0, y: 28, scale: 0.97 } : false}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                animate={!enabled ? { opacity: 1, y: 0, scale: 1 } : undefined}
                viewport={{
                  once: true,
                  amount: 0.12,
                  margin: "0px 0px -45px 0px",
                }}
                exit={enabled ? { opacity: 0, y: 12, scale: 0.96 } : undefined}
                whileHover={enabled ? { y: -6 } : undefined}
                transition={{
                  duration: enabled ? 0.42 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className={`project-image art-${p.sort_order % 6}`}>
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
                        {demo
                          ? "ESTUDIO DE DEMOSTRACIÓN"
                          : "PROYECTO EDITORIAL"}
                      </span>
                      <strong>{p.title}</strong>
                      <div className="poster-lines" />
                      <span className="poster-number" aria-hidden="true">
                        {String(p.sort_order + 1).padStart(2, "0")}
                      </span>
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
              </MotionLink>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {!filtered.length && (
        <p className="empty">No hay proyectos publicados en esta categoría.</p>
      )}
    </>
  );
}
export function Services({ items }: { items: ContentRecord[] }) {
  const [active, setActive] = useState<string | null>(null);
  const enabled = useMotionEnabled();
  return (
    <div className="services-list">
      {items.map((s, i) => (
        <motion.div
          className="service-accordion"
          key={s.id}
          initial={enabled ? { opacity: 0, x: 24 } : false}
          whileInView={{ opacity: 1, x: 0 }}
          animate={!enabled ? { opacity: 1, x: 0 } : undefined}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            delay: enabled ? i * 0.1 : 0,
            duration: enabled ? 0.55 : 0,
          }}
        >
          <h3>
            <button
              className="service-trigger"
              aria-expanded={active === s.id}
              aria-controls={`service-${s.id}`}
              onClick={() => setActive(active === s.id ? null : s.id!)}
            >
              <span className="service-number">0{i + 1}</span>
              <span className="service-title">{s.title}</span>
              <motion.span
                animate={{ rotate: active === s.id ? 45 : 0 }}
                transition={{ duration: enabled ? 0.3 : 0 }}
              >
                <Plus size={24} />
              </motion.span>
            </button>
          </h3>
          <motion.div
            id={`service-${s.id}`}
            initial={false}
            animate={{
              height: active === s.id ? "auto" : 0,
              opacity: active === s.id ? 1 : 0,
            }}
            transition={{
              duration: enabled ? 0.38 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="service-reveal"
            inert={active !== s.id}
            aria-hidden={active !== s.id}
          >
            <div className="service-content">
              <p>{s.summary}</p>
              {s.body && <p>{s.body.replace(/<[^>]*>/g, "")}</p>}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
