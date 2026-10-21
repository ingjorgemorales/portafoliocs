import type {
  AssistantSettings,
  ContentRecord,
  ContentTable,
  Profile,
  Section,
  Settings,
} from "./schema";
export const defaultProfile: Profile = {
  name: "Tu nombre",
  specialty: "Comunicadora social",
  headline: "Historias que conectan. Comunicación que transforma.",
  introduction:
    "Un espacio para compartir miradas, contar historias y dar sentido a las ideas. Conoce mi trabajo en comunicación, narrativa y contenido digital.",
  biography:
    "Aquí empieza tu historia. Presenta tu trayectoria, los temas que te mueven y la forma en que entiendes la comunicación.",
  approach: "Escuchar primero. Encontrar la historia. Comunicar con intención.",
  skills: "Narrativa editorial, Comunicación estratégica, Contenido digital",
  location: "Colombia",
  email: "",
  whatsapp: "",
  instagram: "",
  linkedin: "",
};
export const defaultSettings: Settings = {
  palette: "petroleo",
  typography: "editorial",
  seo_title: "Portafolio · Comunicación con propósito",
  seo_description: "Historias, ideas y proyectos de comunicación social.",
  privacy: "",
};
export const defaultAssistant: AssistantSettings = {
  enabled: true,
  name: "Asistente del portafolio",
  welcome:
    "Hola. Soy el asistente virtual de este portafolio. Puedo orientarte sobre proyectos y servicios publicados.",
  instructions: "Responde en español con claridad y brevedad.",
};
export const defaultSections: Section[] = [
  "sobre-mi",
  "portafolio",
  "servicios",
  "experiencia",
  "formacion",
  "testimonios",
  "contacto",
].map((id, i) => ({
  id,
  title: (
    {
      "sobre-mi": "Sobre mí",
      portafolio: "Trabajo seleccionado",
      servicios: "Lo que podemos crear",
      experiencia: "Experiencia",
      formacion: "Formación",
      testimonios: "Otras voces",
      contacto: "Hablemos de tu próxima historia",
    } as Record<string, string>
  )[id],
  visible: true,
  sort_order: i,
}));
export function demoRecords(table: ContentTable): ContentRecord[] {
  const titles: Partial<Record<ContentTable, string[]>> = {
    projects: [
      "Las voces que habitan la ciudad",
      "Una idea, muchas formas de contarla",
      "Conversaciones que dejan huella",
    ],
    services: [
      "Narrativas & contenido",
      "Comunicación estratégica",
      "Periodismo & entrevistas",
    ],
    categories: ["Periodismo", "Comunicación digital", "Audiovisual"],
  };
  return (titles[table] || []).map((title, i) => ({
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    title,
    slug: ["voces-de-la-ciudad", "ideas-que-conectan", "conversaciones"][i],
    summary:
      table === "projects"
        ? [
            "Una exploración editorial de las historias cotidianas que merecen ser escuchadas.",
            "Un ejercicio de narrativa digital: del concepto a una conversación compartida.",
            "Una propuesta de entrevistas para escuchar, comprender y acercar perspectivas.",
          ][i]
        : [
            "Historias claras, relevantes y pensadas para las personas.",
            "Ideas con dirección y mensajes con propósito.",
            "Preguntas que abren nuevas formas de mirar.",
          ][i],
    body: "<p>Contenido de demostración. Este proyecto ilustra cómo puedes presentar tu trabajo; no representa experiencia profesional real.</p>",
    published: true,
    featured: i === 0,
    sort_order: i,
    category_id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    data: {
      client: "",
      date: "",
      objective: "Ejemplo editable: explica qué buscaba lograr este proyecto.",
      role: "Ejemplo editable: describe tu participación específica.",
      results: "",
      credits: "",
      tags: "Demostración",
      seo_title: "",
      seo_description: "",
      organization: "",
      period: "",
      author: "",
      url: "",
    },
    links: [],
  }));
}
