import { z } from "zod";
z.config(z.locales.es());

export const safeUrl = z
  .string()
  .max(2048)
  .refine((s) => {
    try {
      const u = new URL(s);
      return (
        ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
      );
    } catch {
      return false;
    }
  }, "Usa una URL completa http o https.");
const optionalUrl = z.union([z.literal(""), safeUrl]).default("");
const text = (max = 500) => z.string().trim().max(max).default("");
export const linkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: safeUrl,
  type: z.enum([
    "articulo",
    "video",
    "redes",
    "web",
    "podcast",
    "documento",
    "otro",
  ]),
  sort_order: z.number().int().min(0).max(1000),
});
export const recordSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1).max(180),
  summary: text(1000),
  body: text(40000),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(10000).default(0),
  slug: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Usa letras minúsculas, números y guiones.",
        )
        .max(180),
    ])
    .optional(),
  category_id: z.union([z.uuid(), z.literal("")]).optional(),
  featured: z.boolean().optional(),
  data: z
    .object({
      client: text(),
      date: text(40),
      objective: text(4000),
      role: text(4000),
      results: text(4000),
      credits: text(2000),
      tags: text(),
      seo_title: text(180),
      seo_description: text(300),
      organization: text(),
      period: text(100),
      author: text(150),
      url: optionalUrl,
    })
    .default({
      client: "",
      date: "",
      objective: "",
      role: "",
      results: "",
      credits: "",
      tags: "",
      seo_title: "",
      seo_description: "",
      organization: "",
      period: "",
      author: "",
      url: "",
    }),
  links: z.array(linkSchema).max(30).default([]),
});
export const profileSchema = z.object({
  name: text(100),
  specialty: text(160),
  headline: text(180),
  introduction: text(1000),
  biography: text(10000),
  approach: text(2000),
  skills: text(1000),
  location: text(100),
  email: z.union([z.literal(""), z.email()]).default(""),
  whatsapp: z
    .string()
    .regex(/^\d{7,15}$|^$/)
    .default(""),
  instagram: optionalUrl,
  linkedin: optionalUrl,
});
export const settingsSchema = z.object({
  palette: z.enum(["petroleo", "terracota", "tinta"]),
  typography: z.enum(["editorial", "clasica", "moderna"]),
  seo_title: text(160),
  seo_description: text(300),
  privacy: text(12000),
});
export const assistantSchema = z.object({
  enabled: z.boolean(),
  name: text(80),
  welcome: text(500),
  instructions: text(2000),
});
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
  website: z.string().max(0),
  startedAt: z.number().int(),
});
export const tables = [
  "projects",
  "categories",
  "services",
  "experience",
  "education",
  "testimonials",
  "faqs",
  "sources",
] as const;
export type ContentTable = (typeof tables)[number];
export type ContentRecord = z.infer<typeof recordSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type AssistantSettings = z.infer<typeof assistantSchema>;
export type Media = {
  id: string;
  project_id: string | null;
  object_path: string;
  name: string;
  alt: string;
  mime: string;
  purpose: "gallery" | "cover" | "portrait" | "cv" | "social";
  sort_order: number;
  url?: string;
};
export type Section = {
  id: string;
  title: string;
  visible: boolean;
  sort_order: number;
};
export function videoEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (["www.youtube.com", "youtube.com"].includes(u.hostname)) {
      const id = u.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    if (u.hostname === "youtu.be" && /^\/[\w-]{11}$/.test(u.pathname))
      return `https://www.youtube-nocookie.com/embed${u.pathname}`;
    if (
      ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
      /^\/\d+$/.test(u.pathname)
    )
      return `https://player.vimeo.com/video${u.pathname}`;
    return null;
  } catch {
    return null;
  }
}
