import "server-only";
import { configured, isDemo, publicClient } from "./supabase/server";
import {
  defaultAssistant,
  defaultProfile,
  defaultSections,
  defaultSettings,
  demoRecords,
} from "./demo";
import type {
  AssistantSettings,
  ContentRecord,
  ContentTable,
  Media,
  Profile,
  Section,
  Settings,
} from "./schema";
import type { SupabaseClient } from "@supabase/supabase-js";
export async function records(
  table: ContentTable,
  db?: SupabaseClient,
): Promise<ContentRecord[]> {
  if (!configured()) return isDemo() ? demoRecords(table) : [];
  const client = db || publicClient();
  let query = client
    .from(table)
    .select(table === "projects" ? "*, links:project_links(*)" : "*")
    .order("sort_order");
  if (!db) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw new Error("No fue posible cargar el contenido.");
  const rows = data as unknown as ContentRecord[];
  return (rows || []).map((r) => ({
    ...r,
    links: (r.links || []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}
export async function configuration(db?: SupabaseClient) {
  if (!configured())
    return {
      profile: defaultProfile,
      settings: defaultSettings,
      assistant: defaultAssistant,
      sections: defaultSections,
    };
  const client = db || publicClient();
  const [config, sections] = await Promise.all([
    client.from("configuration").select("id,data"),
    client.from("sections").select("*").order("sort_order"),
  ]);
  if (config.error || sections.error)
    throw new Error("No fue posible cargar la configuración.");
  const byId = Object.fromEntries(
    (config.data || []).map((x) => [x.id, x.data]),
  );
  return {
    profile: { ...defaultProfile, ...byId.profile } as Profile,
    settings: { ...defaultSettings, ...byId.settings } as Settings,
    assistant: { ...defaultAssistant, ...byId.assistant } as AssistantSettings,
    sections: (sections.data?.length
      ? sections.data
      : defaultSections) as Section[],
  };
}
export async function media(db?: SupabaseClient): Promise<Media[]> {
  if (!configured()) return [];
  const { data, error } = await (db || publicClient())
    .from("media")
    .select("*")
    .order("sort_order");
  if (error) throw new Error("No fue posible cargar los archivos.");
  return (data || []).map((m) => ({ ...m, url: `/api/media/${m.id}` }));
}
