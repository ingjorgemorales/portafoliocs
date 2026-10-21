import assert from "node:assert/strict";
const production = process.argv.includes("--production");
const root = production ? "http://127.0.0.1:3001" : "http://localhost:3000";
const pages = [
  "/",
  "/admin/login",
  "/privacidad",
  "/robots.txt",
  "/sitemap.xml",
];
if (!production)
  pages.push(
    "/admin",
    "/admin/perfil",
    "/admin/proyectos",
    "/admin/categorias",
    "/admin/servicios",
    "/admin/experiencia",
    "/admin/formacion",
    "/admin/testimonios",
    "/admin/multimedia",
    "/admin/contactos",
    "/admin/apariencia",
    "/admin/asistente",
    "/admin/configuracion",
    "/proyectos/voces-de-la-ciudad",
  );
for (const path of pages) {
  const response = await fetch(root + path);
  assert.equal(response.status, 200, path);
  const body = await response.text();
  assert.ok(!body.includes("No pudimos cargar esta página."), path);
  console.log(`OK ${path}`);
}
if (production) {
  const admin = await fetch(root + "/admin", { redirect: "manual" });
  assert.equal(admin.status, 307);
  assert.equal(admin.headers.get("location"), "/admin/login");
  const home = await (await fetch(root)).text();
  assert.ok(!home.includes("DEMONSTRACIÓN LOCAL"));
  assert.equal(
    (await fetch(root + "/proyectos/voces-de-la-ciudad")).status,
    404,
  );
  console.log("OK production: demo disabled and admin denied");
}
for (const route of ["/api/chat", "/api/contact"]) {
  const noOrigin = await fetch(root + route, { method: "POST", body: "{}" });
  assert.equal(noOrigin.status, 403);
  const unavailable = await fetch(root + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify({ message: "Prueba sin credenciales" }),
  });
  assert.equal(unavailable.status, 503);
  console.log(`OK ${route}: origin and unavailable state`);
}
const upload = await fetch(root + "/api/admin/media", {
  method: "POST",
  headers: { origin: "http://localhost:3000" },
  body: "unauthorized",
});
assert.ok(upload.status >= 400);
const media = await fetch(
  root + "/api/media/33333333-3333-4333-8333-333333333333",
);
assert.equal(media.status, 404);
console.log("OK media: unauthorized upload/read denied");
