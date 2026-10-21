export const adminNavigation = [
  ["", "Resumen"],
  ["perfil", "Mi perfil"],
  ["proyectos", "Proyectos"],
  ["categorias", "Categorías"],
  ["servicios", "Servicios"],
  ["experiencia", "Experiencia"],
  ["formacion", "Formación"],
  ["testimonios", "Testimonios"],
  ["multimedia", "Multimedia"],
  ["contactos", "Contactos"],
  ["apariencia", "Apariencia"],
  ["asistente", "Asistente IA"],
  ["configuracion", "Configuración"],
] as const;
export const contentRoutes = {
  proyectos: "projects",
  categorias: "categories",
  servicios: "services",
  experiencia: "experience",
  formacion: "education",
  testimonios: "testimonials",
} as const;
