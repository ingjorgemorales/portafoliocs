-- Apply to a dedicated development project first.
create table public.administrators (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.administrators enable row level security;
create policy own_role on public.administrators for select to authenticated using (user_id=auth.uid());
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.administrators where user_id=(select auth.uid())) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.configuration(id text primary key check(id in ('profile','settings','assistant')), data jsonb not null default '{}', updated_at timestamptz not null default now());
create table public.sections(id text primary key check(id in ('sobre-mi','portafolio','servicios','experiencia','formacion','testimonios','contacto')), title text not null, visible boolean not null default true, sort_order integer not null default 0, updated_at timestamptz not null default now());
create table public.categories(id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 180), summary text not null default '', body text not null default '', data jsonb not null default '{}', published boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.projects (like public.categories including all);
alter table public.projects add column slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), add column category_id uuid references public.categories(id) on delete set null, add column featured boolean not null default false;
create table public.services (like public.categories including all);
create table public.experience (like public.categories including all);
create table public.education (like public.categories including all);
create table public.testimonials (like public.categories including all);
create table public.faqs (like public.categories including all);
create table public.sources (like public.categories including all);
create table public.project_links(id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, label text not null check(length(label) between 1 and 100), url text not null check(url ~ '^https?://[^[:space:]]+$'), type text not null check(type in ('articulo','video','redes','web','podcast','documento','otro')), sort_order integer not null default 0);
create index on public.project_links(project_id,sort_order);
create index on public.projects(category_id);
create table public.media(id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete restrict, object_path text not null unique, name text not null, alt text not null default '', mime text not null, size integer not null check(size between 1 and 20971520), purpose text not null default 'gallery' check(purpose in ('gallery','cover','portrait','cv','social')), published boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on public.media(project_id,sort_order);
create table public.contacts(id uuid primary key default gen_random_uuid(), name text not null, email text not null, subject text not null, message text not null, consent_at timestamptz not null default now(), privacy_version text not null, status text not null default 'pending' check(status in ('pending','handled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on public.contacts(status,created_at desc);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
do $$ declare t text; begin
 foreach t in array array['categories','projects','services','experience','education','testimonials','faqs','sources'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy published_read on public.%I for select to anon, authenticated using (published or public.is_admin())',t);
 execute format('create policy admin_write on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
 execute format('create index on public.%I(published,sort_order)',t);
 end loop;
 foreach t in array array['configuration','sections'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy public_read on public.%I for select to anon, authenticated using (true)',t);
 execute format('create policy admin_write on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
 end loop;
 foreach t in array array['configuration','sections','categories','projects','services','experience','education','testimonials','faqs','sources','media','contacts'] loop
 execute format('create trigger updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
 end loop;
end $$;
alter table public.project_links enable row level security;
create policy published_read on public.project_links for select to anon,authenticated using (exists(select 1 from public.projects p where p.id=project_id and p.published) or public.is_admin());
create policy admin_write on public.project_links for all to authenticated using(public.is_admin()) with check(public.is_admin());
alter table public.media enable row level security;
create policy readable_media on public.media for select to anon,authenticated using(public.is_admin() or (case when project_id is null then published else exists(select 1 from public.projects p where p.id=project_id and p.published) end));
create policy admin_write on public.media for all to authenticated using(public.is_admin()) with check(public.is_admin());
alter table public.contacts enable row level security;
create policy admin_only on public.contacts for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- All objects stay private, including draft covers. Public access is mediated by RLS.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('portfolio','portfolio',false,20971520,array['image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','audio/wav']);
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='portfolio' and (public.is_admin() or exists(select 1 from public.media m where m.object_path=storage.objects.name)));
create policy admin_upload on storage.objects for insert to authenticated with check(bucket_id='portfolio' and public.is_admin());
create policy admin_delete on storage.objects for delete to authenticated using(bucket_id='portfolio' and public.is_admin());

-- Atomic project + links save; invoker rights preserve RLS.
create function public.save_project(payload jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare project_uuid uuid := coalesce((payload->>'id')::uuid,gen_random_uuid()); item jsonb;
begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 insert into public.projects(id,title,summary,body,published,sort_order,slug,category_id,featured,data)
 values(project_uuid,payload->>'title',payload->>'summary',payload->>'body',(payload->>'published')::boolean,(payload->>'sort_order')::integer,payload->>'slug',nullif(payload->>'category_id','')::uuid,coalesce((payload->>'featured')::boolean,false),payload->'data')
 on conflict(id) do update set title=excluded.title,summary=excluded.summary,body=excluded.body,published=excluded.published,sort_order=excluded.sort_order,slug=excluded.slug,category_id=excluded.category_id,featured=excluded.featured,data=excluded.data;
 delete from public.project_links where project_id=project_uuid;
 for item in select * from jsonb_array_elements(payload->'links') loop
 insert into public.project_links(project_id,label,url,type,sort_order) values(project_uuid,item->>'label',item->>'url',item->>'type',(item->>'sort_order')::integer);
 end loop;
 return project_uuid;
end $$;
revoke all on function public.save_project(jsonb) from public;
grant execute on function public.save_project(jsonb) to authenticated;

-- Distributed, atomic quotas. Only server service_role may consume quotas.
create table public.request_limits(key text primary key, hits integer not null default 0, expires_at timestamptz not null);
alter table public.request_limits enable row level security;
create function public.consume_quota(quota_key text, max_hits integer, window_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare used integer;
begin
 delete from public.request_limits where expires_at < now() - interval '1 day';
 insert into public.request_limits(key,hits,expires_at) values(quota_key,1,now()+make_interval(secs=>window_seconds))
 on conflict(key) do update set hits=case when public.request_limits.expires_at<=now() then 1 else public.request_limits.hits+1 end, expires_at=case when public.request_limits.expires_at<=now() then now()+make_interval(secs=>window_seconds) else public.request_limits.expires_at end returning hits into used;
 return used<=max_hits;
end $$;
revoke all on function public.consume_quota(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_quota(text,integer,integer) to service_role;
insert into public.sections(id,title,sort_order) values ('sobre-mi','Sobre mí',0),('portafolio','Trabajo seleccionado',1),('servicios','Lo que podemos crear',2),('experiencia','Experiencia',3),('formacion','Formación',4),('testimonios','Otras voces',5),('contacto','Hablemos de tu próxima historia',6);
