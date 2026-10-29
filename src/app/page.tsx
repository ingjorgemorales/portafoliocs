import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { configuration, media, records } from "@/lib/content";
import { configured, isDemo } from "@/lib/supabase/server";
import { Header, Hero, Projects, Services } from "@/components/portfolio";
import { ContactForm } from "@/components/contact-form";
import { Assistant } from "@/components/assistant";
import {
  MotionStage,
  Reveal,
  RevealBlock,
  Manifesto,
  StaggerItem,
} from "@/components/motion-system";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { settings } = await configuration();
  const social = (await media()).find(
    (m) => m.purpose === "social" && !m.project_id,
  );
  return {
    title: settings.seo_title,
    description: settings.seo_description,
    openGraph: {
      title: settings.seo_title,
      description: settings.seo_description,
      ...(social ? { images: [{ url: social.url!, alt: social.alt }] } : {}),
    },
  };
}
export default async function Home() {
  const [
    { profile, settings, sections, assistant },
    projects,
    categories,
    services,
    experience,
    education,
    testimonials,
    files,
  ] = await Promise.all([
    configuration(),
    records("projects"),
    records("categories"),
    records("services"),
    records("experience"),
    records("education"),
    records("testimonials"),
    media(),
  ]);
  const demo = isDemo();
  const cv = files.find((m) => m.purpose === "cv" && !m.project_id);
  const hasContent: Record<string, boolean> = {
    "sobre-mi": !!profile.biography,
    portafolio: projects.length > 0,
    servicios: services.length > 0,
    experiencia: experience.length > 0,
    formacion: education.length > 0,
    testimonios: testimonials.length > 0,
    contacto: true,
  };
  const visibleSections = sections.filter((s) => s.visible && hasContent[s.id]);
  return (
    <MotionStage>
      <div
        className="paper-portfolio"
        data-palette={settings.palette}
        data-typography={settings.typography}
      >
        {demo && (
          <div className="demo-banner">
            DEMONSTRACIÓN LOCAL{" "}
            <span>
              Contenido ilustrativo · Personaliza tu historia desde el panel
            </span>
            <Link href="/admin">Ver administración ↗</Link>
          </div>
        )}
        {!configured() && !demo && (
          <div className="demo-banner">
            Sitio pendiente de configuración de contenido.
          </div>
        )}
        <div className="site-wrap">
          <Header
            name={profile.name}
            visibleSections={visibleSections.map((s) => s.id)}
          />
          <main id="contenido">
            <Hero
              profile={profile}
              portrait={
                files.find(
                  (m) => m.purpose === "portrait" && !m.project_id,
                ) ?? {
                  id: "leonela-local-portrait",
                  project_id: null,
                  object_path: "leonela-garcia-padilla.png",
                  name: "Leonela Garcia Padilla",
                  alt: "Retrato de Leonela Garcia Padilla, comunicadora social",
                  mime: "image/png",
                  purpose: "portrait",
                  sort_order: 0,
                  url: "/leonela-garcia-padilla.png",
                }
              }
              demo={demo}
              visibleSections={visibleSections.map((s) => s.id)}
            />
            <Manifesto />
            {visibleSections.map((s, index) => {
              const heading = (
                <div className="section-heading">
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {s.id === "portafolio"
                      ? "EL PORTAFOLIO"
                      : s.id.replaceAll("-", " ")}
                  </span>
                  <h2>{s.title}</h2>
                </div>
              );
              if (s.id === "sobre-mi" && profile.biography)
                return (
                  <Reveal
                    id={s.id}
                    className="about-section section"
                    key={s.id}
                  >
                    {heading}
                    <div>
                      <RevealBlock>
                        <p className="large-copy">{profile.biography}</p>
                      </RevealBlock>
                      <RevealBlock delay={0.12}>
                        <p>{profile.approach}</p>
                      </RevealBlock>
                      <div className="skill-tags">
                        {profile.skills
                          .split(",")
                          .filter(Boolean)
                          .map((t) => (
                            <span key={t}>{t.trim()}</span>
                          ))}
                      </div>
                      {cv && (
                        <a
                          className="text-link"
                          href={cv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Descargar hoja de vida <Download size={18} />
                        </a>
                      )}
                    </div>
                  </Reveal>
                );
              if (s.id === "portafolio" && projects.length)
                return (
                  <Reveal id={s.id} className="section" key={s.id}>
                    {heading}
                    <Projects
                      projects={projects}
                      categories={categories}
                      media={files}
                      demo={demo}
                    />
                  </Reveal>
                );
              if (s.id === "servicios" && services.length)
                return (
                  <Reveal
                    id={s.id}
                    className="section services-section"
                    key={s.id}
                  >
                    {heading}
                    <Services items={services} />
                  </Reveal>
                );
              const list =
                s.id === "experiencia"
                  ? experience
                  : s.id === "formacion"
                    ? education
                    : s.id === "testimonios"
                      ? testimonials
                      : [];
              if (list.length)
                return (
                  <Reveal
                    id={s.id}
                    className={`section ${s.id === "testimonios" ? "testimonials-section" : ""}`}
                    key={s.id}
                  >
                    {heading}
                    {demo && (
                      <p className="demo-section-note">
                        {s.id === "formacion"
                          ? "Datos académicos por completar; la formación complementaria es ilustrativa."
                          : "Contenido de ejemplo para visualizar esta sección. No representa antecedentes ni recomendaciones reales."}
                      </p>
                    )}
                    <div className="timeline">
                      {list.map((r, i) => (
                        <StaggerItem key={r.id} index={i}>
                          <span>
                            {r.data.period ||
                              r.data.organization ||
                              r.data.author}
                          </span>
                          <h3>{r.title}</h3>
                          <p>{r.summary}</p>
                        </StaggerItem>
                      ))}
                    </div>
                  </Reveal>
                );
              if (s.id === "contacto")
                return (
                  <Reveal
                    id={s.id}
                    className="section contact-section"
                    key={s.id}
                  >
                    <div>
                      {heading}
                      <p>
                        Las buenas conversaciones son el comienzo
                        <br />
                        de los mejores proyectos.
                      </p>
                      <div className="contact-links">
                        {profile.email && (
                          <a href={`mailto:${profile.email}`}>
                            {profile.email}
                            <ArrowUpRight size={18} />
                          </a>
                        )}
                        {profile.whatsapp && (
                          <a
                            href={`https://wa.me/${profile.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp <ArrowUpRight size={18} />
                          </a>
                        )}
                        {(
                          [
                            ["Instagram", profile.instagram],
                            ["LinkedIn", profile.linkedin],
                          ] as const
                        )
                          .filter(([, url]) => url)
                          .map(([label, url]) => (
                            <a
                              key={label}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {label}
                              <ArrowUpRight size={18} />
                            </a>
                          ))}
                      </div>
                    </div>
                    <ContactForm
                      available={configured() && !!settings.privacy}
                    />
                  </Reveal>
                );
              return null;
            })}
          </main>
          <footer>
            <Link href="/" className="wordmark">
              {profile.name}
            </Link>
            <span>Comunicar es conectar.</span>
            <div>
              <Link href="/privacidad">Privacidad</Link>
              <Link href="/admin">Administración ↗</Link>
            </div>
          </footer>
        </div>
        <Assistant
          settings={assistant}
          contactHref={
            visibleSections.some((s) => s.id === "contacto")
              ? "/#contacto"
              : profile.email
                ? `mailto:${profile.email}`
                : undefined
          }
        />
      </div>
    </MotionStage>
  );
}
