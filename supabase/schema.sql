-- Nuestro Árbol — esquema de Supabase.
-- Pegar entero en el SQL Editor y pulsar Run. Se puede repetir sin romper nada.

-- 1. Tablas
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  caption     text check (caption is null or char_length(caption) <= 280),
  photo_date  date not null default current_date,
  uploaded_by uuid,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create index if not exists photos_visible_idx
  on public.photos (photo_date desc, created_at desc)
  where deleted_at is null;


-- 2. Políticas de las tablas
alter table public.photos enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "el álbum se lee" on public.photos;
drop policy if exists "el álbum se escribe" on public.photos;
drop policy if exists "el álbum se edita" on public.photos;

create policy "el álbum se lee" on public.photos
  for select to anon, authenticated using (true);

create policy "el álbum se escribe" on public.photos
  for insert to anon, authenticated with check (true);

create policy "el álbum se edita" on public.photos
  for update to anon, authenticated using (true) with check (true);

-- Sin policy de DELETE: el borrado de la app sólo marca deleted_at.

drop policy if exists "ajustes: lectura" on public.app_settings;
drop policy if exists "ajustes: escritura" on public.app_settings;
drop policy if exists "ajustes: cambio" on public.app_settings;

create policy "ajustes: lectura" on public.app_settings
  for select to anon, authenticated using (true);

create policy "ajustes: escritura" on public.app_settings
  for insert to anon, authenticated with check (true);

create policy "ajustes: cambio" on public.app_settings
  for update to anon, authenticated using (true) with check (true);


-- 3. Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 26214400,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/avif'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- 4. Políticas de Storage
drop policy if exists "fotos: lectura" on storage.objects;
drop policy if exists "fotos: subida" on storage.objects;
drop policy if exists "logo: lectura" on storage.objects;
drop policy if exists "logo: subida" on storage.objects;
drop policy if exists "logo: reemplazo" on storage.objects;

create policy "fotos: lectura" on storage.objects
  for select to anon, authenticated using (bucket_id = 'photos');

create policy "fotos: subida" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'photos');

create policy "logo: lectura" on storage.objects
  for select to public using (bucket_id = 'branding');

create policy "logo: subida" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'branding');

create policy "logo: reemplazo" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'branding') with check (bucket_id = 'branding');


-- 5. Realtime (opcional: si falla, la app se refresca igual al volver a ella)
alter table public.photos replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.photos;
exception when others then null;
end $$;
