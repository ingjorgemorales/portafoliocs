import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("migration + RLS: anonymous, non-admin, admin, drafts, media and atomic publication", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage;
 create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
 grant usage on schema public,auth,storage to anon,authenticated,service_role;
 grant execute on function auth.uid() to anon,authenticated,service_role;`);
    await db.exec(
      readFileSync(
        new URL(
          "../supabase/migrations/202610210001_initial.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(`grant select,insert,update,delete on all tables in schema public,storage to anon,authenticated,service_role;
 insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
 insert into public.administrators(user_id) values('11111111-1111-4111-8111-111111111111');
 insert into public.projects(id,title,slug,published) values('33333333-3333-4333-8333-333333333333','Public','public',true),('44444444-4444-4444-8444-444444444444','Draft','draft',false);
 insert into public.project_links(project_id,label,url,type) values('44444444-4444-4444-8444-444444444444','Secret','https://example.com/secret','web');
 insert into public.media(project_id,object_path,name,mime,size) values('44444444-4444-4444-8444-444444444444','draft.jpg','draft.jpg','image/jpeg',100),('33333333-3333-4333-8333-333333333333','public.jpg','public.jpg','image/jpeg',100);
 insert into storage.objects(bucket_id,name) values('portfolio','draft.jpg'),('portfolio','public.jpg');
 insert into public.contacts(name,email,subject,message,privacy_version) values('Person','test@example.com','Private','Sensitive content','v1');
 set role anon;`);
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.project_links")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.contacts")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    await assert.rejects(
      db.exec("insert into public.categories(title) values('Unauthorized')"),
    );
    await assert.rejects(db.exec("select public.consume_quota('x',1,60)"));
    await db.exec(
      "reset role; set role authenticated; set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';",
    );
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      1,
    );
    await assert.rejects(
      db.exec("insert into public.administrators(user_id) values(auth.uid())"),
    );
    await assert.rejects(
      db.exec("insert into public.services(title) values('Unauthorized')"),
    );
    await db.exec("update public.projects set title='Attack';");
    assert.equal(
      (await db.query<{ title: string }>("select title from public.projects"))
        .rows[0].title,
      "Public",
    );
    await db.exec(
      "reset role; set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';",
    );
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("select * from public.contacts")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      2,
    );
    const payload = {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Published now",
      summary: "Text only",
      body: "<p>Text</p>",
      slug: "draft",
      published: true,
      sort_order: 1,
      category_id: "",
      data: {},
      links: [
        {
          label: "One",
          url: "https://example.com/one",
          type: "web",
          sort_order: 0,
        },
        {
          label: "Two",
          url: "https://example.com/two",
          type: "web",
          sort_order: 1,
        },
      ],
    };
    await db.query("select public.save_project($1::jsonb)", [
      JSON.stringify(payload),
    ]);
    assert.equal(
      (await db.query("select * from public.project_links")).rows.length,
      2,
    );
    await assert.rejects(
      db.query("select public.save_project($1::jsonb)", [
        JSON.stringify({
          ...payload,
          title: "Must roll back",
          links: [
            { label: "bad", url: "javascript:bad", type: "web", sort_order: 0 },
          ],
        }),
      ]),
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select title from public.projects where slug='draft'",
        )
      ).rows[0].title,
      "Published now",
    );
    await db.exec("reset role; set role anon; set request.jwt.claim.sub='';");
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      2,
    );
    await db.exec(
      "reset role; set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; update public.projects set published=false where slug='draft'; reset role; set role anon; set request.jwt.claim.sub='';",
    );
    assert.equal(
      (await db.query("select * from public.project_links")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    await db.exec("reset role; set role service_role;");
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_quota('test',1,60) as allowed",
        )
      ).rows[0].allowed,
      true,
    );
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_quota('test',1,60) as allowed",
        )
      ).rows[0].allowed,
      false,
    );
  } finally {
    await db.close();
  }
});
