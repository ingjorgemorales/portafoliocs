import type {
  AssistantSettings,
  ContentRecord,
  ContentTable,
  Profile,
  Section,
  Settings,
} from "./schema";
export const defaultProfile: Profile = {
  name: "Leonela Garcia Padilla",
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
  palette: "tinta",
  typography: "editorial",
  seo_title: "Leonela Garcia Padilla · Comunicadora social",
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

// Editorial sample copy, used exclusively by the local demonstration.
export const demoProfile: Profile = {
  ...defaultProfile,
  introduction:
    "Soy Leonela Garcia Padilla, comunicadora social. Me interesan las historias que nos acercan, las ideas que movilizan y las palabras que dejan algo en quien las escucha.",
  biography:
    "Creo en una comunicación que empieza escuchando. En mirar más allá de lo evidente y encontrar esa historia que merece ser contada: la de una comunidad, una marca o una idea que está naciendo.",
  approach:
    "Mi propuesta combina sensibilidad narrativa, curiosidad y una mirada estratégica. Del primer café al último detalle, busco que cada mensaje tenga intención, claridad y una voz propia. Texto de presentación de ejemplo, pendiente de personalizar.",
  skills:
    "Escritura creativa, Entrevistas, Estrategia de contenidos, Narrativa audiovisual, Comunicación digital, Escucha activa",
};

type Sample = {
  title: string;
  summary: string;
  slug?: string;
  body?: string;
  category?: number;
  data?: Partial<ContentRecord["data"]>;
};
const samples: Partial<Record<ContentTable, Sample[]>> = {
  projects: [
    {
      title: "Las voces que habitan la ciudad",
      slug: "voces-de-la-ciudad",
      category: 0,
      summary:
        "Una serie de crónicas sobre los pequeños oficios, encuentros y lugares que le dan identidad a un barrio.",
      body: "<h2>Una ciudad también se cuenta en voz baja</h2><p>En esta propuesta editorial de ejemplo, la cámara y la libreta se detienen en lo cotidiano: una panadería que abre temprano, un parque donde se encuentran generaciones y una tienda que conoce a sus vecinos por su nombre.</p><blockquote>Las historias más cercanas suelen estar en los lugares por los que pasamos todos los días.</blockquote><h2>La propuesta</h2><p>Tres crónicas breves, una selección fotográfica y pequeñas piezas para redes que invitan a descubrir el relato completo. El hilo conductor es la memoria compartida y el sentido de pertenencia.</p><ul><li>Investigación y mapa de posibles fuentes.</li><li>Guion de entrevista y estructura narrativa.</li><li>Adaptación del relato a formatos digitales.</li></ul>",
      data: {
        objective:
          "Explorar cómo los relatos cotidianos pueden acercar una comunidad a su territorio.",
        role: "Rol ilustrativo: investigación, entrevistas, escritura de crónicas y propuesta editorial.",
        results:
          "Entregables propuestos: una serie de tres crónicas y seis piezas de divulgación. No son resultados de un encargo real.",
        tags: "Crónica, Ciudad, Memoria",
        credits:
          "Ejercicio ficticio de portafolio. No se utilizaron entrevistas reales.",
      },
    },
    {
      title: "Una idea, muchas formas de contarla",
      slug: "ideas-que-conectan",
      category: 1,
      summary:
        "Una campaña conceptual para convertir una iniciativa de consumo consciente en una conversación cotidiana.",
      body: "<h2>De un mensaje a una conversación</h2><p>Esta campaña de demostración propone hablar de pequeños hábitos sin recurrir a grandes promesas. El concepto creativo, «Empieza por lo cercano», conecta publicaciones educativas, historias y preguntas a la comunidad.</p><h2>Un sistema de contenido</h2><ul><li>Carruseles con ideas prácticas.</li><li>Guiones para videos cortos.</li><li>Un calendario editorial con temas y objetivos.</li></ul>",
      data: {
        objective:
          "Mostrar cómo una misma idea puede mantener su identidad en diferentes canales y formatos.",
        role: "Rol ilustrativo: concepto creativo, tono de voz, copywriting y planeación de contenidos.",
        results:
          "Muestra conceptual: calendario de cuatro semanas y tres rutas de contenido. Sin métricas comerciales inventadas.",
        tags: "Estrategia, Copywriting, Redes",
      },
    },
    {
      title: "Conversaciones que dejan huella",
      slug: "conversaciones",
      category: 2,
      summary:
        "Un concepto de podcast para descubrir las decisiones, preguntas y aprendizajes que hay detrás de cada historia.",
      body: "<h2>Escuchar también es una forma de crear</h2><p>Un formato de entrevista pausado, cercano y curioso. Esta muestra incluye la idea de un episodio piloto, su estructura narrativa y una propuesta de distribución.</p><h2>Guion del episodio piloto</h2><p>Apertura sonora, presentación del tema, conversación en tres momentos y una pregunta final: «¿Qué te gustaría que alguien entendiera mejor de tu historia?».</p><blockquote>Una buena pregunta no busca impresionar: abre un espacio para escuchar.</blockquote>",
      data: {
        objective:
          "Diseñar una experiencia sonora que priorice la conversación y el contexto.",
        role: "Rol ilustrativo: desarrollo del formato, investigación de temas y guion de entrevista.",
        results:
          "Propuesta de piloto y escaleta. No hay grabaciones ni invitados reales asociados a esta muestra.",
        tags: "Podcast, Guion, Entrevistas",
      },
    },
    {
      title: "Lo que un territorio nos cuenta",
      slug: "territorio-que-cuenta",
      category: 2,
      summary:
        "Una propuesta de microdocumental que combina observación, sonido ambiente y relatos de pertenencia.",
      body: "<h2>Mirar antes de explicar</h2><p>Una pieza audiovisual conceptual de tres minutos, organizada alrededor de tres momentos: el lugar, las personas y aquello que quieren preservar.</p><h2>Tratamiento visual</h2><p>Planos de detalle, luz natural y pausas para que el entorno también tenga voz. El ejemplo muestra cómo presentar un tratamiento narrativo antes de una producción.</p>",
      data: {
        objective:
          "Traducir una idea social en un relato audiovisual breve y comprensible.",
        role: "Rol ilustrativo: sinopsis, tratamiento narrativo, guion y plan de entrevistas.",
        results:
          "Dossier conceptual. Este microdocumental no ha sido producido.",
        tags: "Documental, Territorio, Narrativa",
      },
    },
    {
      title: "Una marca con voz propia",
      slug: "voz-propia",
      category: 1,
      summary:
        "Una guía editorial de ejemplo para una iniciativa cultural: personalidad, mensajes clave y formas de conversar.",
      body: "<h2>Antes de publicar, definir la voz</h2><p>El ejercicio parte de una organización cultural ficticia y plantea una voz cálida, clara y curiosa. La guía muestra cómo adaptar esa personalidad a una invitación, una noticia o una respuesta en redes.</p><h2>Mensajes que se reconocen</h2><ul><li>Territorios narrativos y palabras clave.</li><li>Ejemplos de tono para distintos momentos.</li><li>Criterios para mantener coherencia editorial.</li></ul>",
      data: {
        objective:
          "Dar consistencia a la comunicación de una iniciativa sin perder cercanía.",
        role: "Rol ilustrativo: diagnóstico conceptual, definición de tono y redacción de mensajes.",
        results:
          "Guía de voz de muestra y una selección de textos de aplicación.",
        tags: "Identidad verbal, Cultura, Contenido",
      },
    },
    {
      title: "Historias que merecen otra mirada",
      slug: "otra-mirada",
      category: 0,
      summary:
        "Un especial editorial conceptual sobre las preguntas que cambian nuestra forma de entender lo cotidiano.",
      body: "<h2>El valor de una segunda pregunta</h2><p>Este especial propone combinar un artículo de contexto, una entrevista y una pieza visual. Cada formato aporta una perspectiva distinta sobre un mismo tema.</p><h2>Una estructura para comprender</h2><p>Partir de una escena, ampliar el contexto, contrastar voces y cerrar con preguntas abiertas. Un ejemplo de cómo organizar información sin perder el hilo humano de una historia.</p>",
      data: {
        objective:
          "Mostrar una estructura editorial que combine sensibilidad y claridad informativa.",
        role: "Rol ilustrativo: propuesta de enfoque, estructura del especial y edición de textos.",
        results:
          "Maqueta narrativa de ejemplo; no corresponde a una publicación real.",
        tags: "Periodismo, Edición, Contexto",
      },
    },
  ],
  categories: [
    {
      title: "Periodismo",
      summary: "Historias, entrevistas y mirada editorial.",
    },
    {
      title: "Comunicación digital",
      summary: "Estrategia, voz y contenido para conectar.",
    },
    {
      title: "Audiovisual",
      summary: "Ideas que toman forma en imagen y sonido.",
    },
  ],
  services: [
    {
      title: "Narrativas & contenido",
      summary:
        "Encontrar las palabras para contar lo que hace única a una idea.",
      body: "Servicio de ejemplo: artículos, perfiles, crónicas, textos web y contenido editorial. Desde la búsqueda del enfoque hasta la edición final, con una voz cercana y coherente.",
    },
    {
      title: "Comunicación estratégica",
      summary: "Una dirección clara para que cada mensaje tenga un propósito.",
      body: "Servicio de ejemplo: definición de mensajes, públicos, tono de voz y calendario editorial. Una ruta de comunicación alineada con lo que la organización necesita contar.",
    },
    {
      title: "Periodismo & entrevistas",
      summary: "Preguntas que abren conversaciones y relatos que dan contexto.",
      body: "Servicio de ejemplo: investigación temática, preparación de entrevistas, desarrollo de crónicas y edición de historias. Escuchar, contrastar y encontrar el hilo narrativo.",
    },
    {
      title: "Guion & narrativa audiovisual",
      summary:
        "Transformar una idea en una historia que se pueda ver y escuchar.",
      body: "Servicio de ejemplo: sinopsis, guiones para videos cortos, escaletas de podcast y tratamientos documentales. Estructura, ritmo y una intención detrás de cada escena.",
    },
  ],
  experience: [
    {
      title: "Comunicación de proyectos culturales",
      summary:
        "Ejemplo de cómo presentar un rol: construcción de mensajes, cobertura de actividades y organización de contenidos para una iniciativa cultural ficticia.",
      data: {
        period: "ETAPA 03 · EJEMPLO",
        organization: "Proyecto cultural ficticio",
      },
    },
    {
      title: "Creación de contenido digital",
      summary:
        "Ejemplo de responsabilidades: proponer temas, redactar piezas para redes y dar continuidad a una línea editorial. No representa un empleo real.",
      data: {
        period: "ETAPA 02 · EJEMPLO",
        organization: "Equipo editorial de muestra",
      },
    },
    {
      title: "Investigación y narrativa",
      summary:
        "Ejemplo de experiencia formativa: explorar fuentes, preparar entrevistas y transformar hallazgos en una historia clara y cercana.",
      data: {
        period: "ETAPA 01 · EJEMPLO",
        organization: "Ejercicio académico ficticio",
      },
    },
  ],
  education: [
    {
      title: "Comunicación social",
      summary:
        "Área profesional confirmada. Aquí se podrá indicar la institución, el título exacto y el año cuando Leonela comparta esos datos.",
      data: {
        period: "FORMACIÓN PROFESIONAL",
        organization: "Institución y fechas por completar",
      },
    },
    {
      title: "Narrativas digitales y creación de contenido",
      summary:
        "Ejemplo de cómo presentar formación complementaria. Este curso es ilustrativo; sustituir por estudios o certificaciones reales.",
      data: {
        period: "FORMACIÓN COMPLEMENTARIA · EJEMPLO",
        organization: "Curso de demostración",
      },
    },
  ],
  testimonials: [
    {
      title: "Una mirada sensible, una historia clara.",
      summary:
        "«El proceso ayudó a encontrar el corazón de la idea y a convertirla en un relato cercano, con una intención clara en cada detalle». Texto ilustrativo, no es una recomendación real.",
      data: { author: "Voz de ejemplo · proyecto ficticio" },
    },
    {
      title: "Escuchar hace toda la diferencia.",
      summary:
        "«La conversación fue el punto de partida. A partir de ahí, el mensaje encontró su tono y una forma de conectar con las personas». Testimonio de demostración.",
      data: { author: "Voz de ejemplo · colaboración ficticia" },
    },
  ],
  faqs: [
    {
      title: "¿Qué tipo de proyectos se pueden presentar aquí?",
      summary:
        "Ejemplos de periodismo, comunicación digital, campañas, guiones y formatos audiovisuales. Los trabajos actuales son demostraciones, no encargos reales.",
    },
  ],
};
export function demoRecords(table: ContentTable): ContentRecord[] {
  return (samples[table] || []).map((sample, i) => ({
    id: "00000000-0000-4000-8000-" + String(i + 1).padStart(12, "0"),
    title: sample.title,
    slug: sample.slug || "ejemplo-" + (i + 1),
    summary: sample.summary,
    body:
      sample.body ||
      "<p>Muestra editorial de demostración. Sustituir por contenido profesional real antes de publicar.</p>",
    published: true,
    featured: table === "projects" && i === 0,
    sort_order: i,
    category_id:
      "00000000-0000-4000-8000-" +
      String((sample.category || 0) + 1).padStart(12, "0"),
    data: {
      client: "",
      date: "",
      objective: "",
      role: "",
      results: "",
      credits: "",
      tags: "Demostración",
      seo_title: "",
      seo_description: "",
      organization: "",
      period: "",
      author: "",
      url: "",
      ...sample.data,
    },
    links: [],
  }));
}
