import test from "node:test";
import assert from "node:assert/strict";
import {
  safeUrl,
  recordSchema,
  contactSchema,
  videoEmbed,
  settingsSchema,
} from "../src/lib/schema";
import { cleanHtml } from "../src/lib/sanitize";
import { validSignature } from "../src/lib/files";
test("URL: block executable, relative and credential-bearing URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "https://user:secret@example.com",
    "file:///etc/passwd",
  ]) {
    assert.equal(safeUrl.safeParse(url).success, false);
  }
  assert.equal(
    safeUrl.safeParse("https://example.com/article?q=test").success,
    true,
  );
});
test("rich text strips scripts, handlers, iframes and unsafe links", () => {
  const html = cleanHtml(
    '<p onclick="x()">Texto</p><script>alert(1)</script><iframe src="https://evil.test"></iframe><a href="javascript:alert(1)">X</a><a href="https://example.com">Link</a>',
  );
  assert.ok(!html.includes("onclick"));
  assert.ok(!html.includes("script"));
  assert.ok(!html.includes("iframe"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes('rel="noopener noreferrer"'));
});
test("embeds only authorize exact YouTube/Vimeo hosts and IDs", () => {
  assert.equal(
    videoEmbed("https://youtube.com.evil.test/watch?v=abcdefghijk"),
    null,
  );
  assert.equal(videoEmbed("http://youtu.be/abcdefghijk"), null);
  assert.equal(
    videoEmbed("https://vimeo.com/123456"),
    "https://player.vimeo.com/video/123456",
  );
  assert.equal(
    videoEmbed("https://youtu.be/abcdefghijk"),
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
  );
});
test("project can contain only text and several links; invalid link rejected", () => {
  const payload = {
    title: "Historia",
    slug: "historia",
    links: [
      {
        label: "Leer",
        url: "https://example.com",
        type: "articulo",
        sort_order: 0,
      },
      {
        label: "Escuchar",
        url: "https://example.com/audio",
        type: "podcast",
        sort_order: 1,
      },
    ],
  };
  assert.equal(recordSchema.safeParse(payload).success, true);
  assert.equal(
    recordSchema.safeParse({
      ...payload,
      links: [{ ...payload.links[0], url: "javascript:alert(1)" }],
    }).success,
    false,
  );
});
test("contact requires consent, valid email, sufficient text and empty honeypot", () => {
  const good = {
    name: "Ana",
    email: "ana@example.com",
    subject: "Proyecto",
    message: "Quiero conocer tus servicios",
    consent: true,
    website: "",
    startedAt: Date.now(),
  };
  assert.equal(contactSchema.safeParse(good).success, true);
  for (const patch of [
    { consent: false },
    { website: "spam" },
    { email: "no" },
    { message: "hola" },
  ])
    assert.equal(contactSchema.safeParse({ ...good, ...patch }).success, false);
});
test("appearance rejects arbitrary CSS", () => {
  assert.equal(
    settingsSchema.safeParse({ palette: "petroleo", typography: "editorial" })
      .success,
    true,
  );
  assert.equal(
    settingsSchema.safeParse({
      palette: "url(javascript:bad)",
      typography: "editorial",
    }).success,
    false,
  );
});
test("upload verifies signatures instead of trusting MIME", () => {
  assert.equal(validSignature(Buffer.from("<script>"), "image/png"), false);
  assert.equal(
    validSignature(Buffer.from("%PDF-1.7"), "application/pdf"),
    true,
  );
  assert.equal(
    validSignature(Buffer.from([255, 216, 255, 0]), "image/jpeg"),
    true,
  );
  assert.equal(validSignature(Buffer.from("<svg/>"), "image/svg+xml"), false);
});
