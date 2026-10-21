import "server-only";
import { createHmac } from "node:crypto";
import { serviceClient } from "./supabase/server";
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (
    !!origin &&
    origin === new URL(process.env.APP_URL || "http://localhost:3000").origin
  );
}
export async function limitedJson(request: Request, max = 20000) {
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new Error("Solicitud demasiado grande.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Solicitud vacía.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new Error("Solicitud demasiado grande.");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export async function quota(key: string, max: number, seconds: number) {
  const { data, error } = await serviceClient().rpc("consume_quota", {
    quota_key: key,
    max_hits: max,
    window_seconds: seconds,
  });
  if (error) throw new Error("Control de frecuencia no disponible.");
  return data === true;
}
export function clientKey(request: Request) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Protección de solicitudes no configurada.");
  let ip = "localhost";
  if (process.env.NODE_ENV === "production") {
    if (process.env.TRUSTED_PROXY !== "vercel" || !process.env.VERCEL)
      throw new Error("Proxy no configurado.");
    ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
  }
  return createHmac("sha256", secret).update(ip).digest("hex");
}
export const json = (message: string, status = 200) =>
  Response.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
