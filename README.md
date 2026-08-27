# Nuestro Árbol

Un álbum de fotos para dos personas. PWA instalable, con estética de álbum de
cuero antiguo: tapa de cuero negro texturizado, herrajes de latón envejecido,
fotos impresas sobre papel crema y tipografía Libre Caslon Text.

El diseño viene del proyecto de Google Stitch **“Nuestro Árbol Vintage Album”**
(`projects/17520147251409572297`): la paleta, la escala tipográfica y las
texturas están portadas 1:1 a `tailwind.config.ts` y `app/globals.css`.

**La app no pide usuario ni contraseña.** Se abre y ya está.

---

## 1. Crear el proyecto de Supabase

1. Entra en <https://supabase.com/dashboard> y pulsa **New project**.
   - **Name**: `nuestro-arbol`
   - **Database Password**: genera una y guárdala (es la de la base de datos,
     no la de la app).
   - **Region**: la más cercana a vosotros dos.
2. Espera a que termine de aprovisionar (1–2 minutos).

## 2. Crear las tablas, los buckets y las políticas

1. En el menú lateral: **SQL Editor → New query**.
2. Copia todo `supabase/schema.sql` de este repo, pégalo y pulsa **Run**.

No hay nada que editar en el archivo. Crea de una sola vez:

| Qué | Detalle |
|---|---|
| `photos` | `id, image_url, caption, photo_date, uploaded_by, deleted_at, created_at` |
| `app_settings` | Guarda la versión del logo |
| Bucket `photos` | Privado. Las imágenes se sirven con URL firmada de 1 hora |
| Bucket `branding` | Público, sólo para el ícono de la app |
| Políticas RLS | Lectura, inserción y edición abiertas. **DELETE denegado** |
| Realtime | Activado sobre `photos` |

Para comprobar que quedó bien:

```sql
select id, public from storage.buckets where id in ('photos','branding');
select tablename, policyname, cmd from pg_policies
  where schemaname = 'public' order by tablename;
```

## 3. Variables de entorno

```bash
cp .env.example .env.local
```

```env
# Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Ojo, los dos valores están en páginas **distintas** del panel:

| Variable | Dónde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → **Data API** → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → **API Keys** → *anon public* |

La URL acaba en `.supabase.co`; si lo que pegas empieza por `sb_publishable_`
es una clave, no la dirección. La `service_role` no se usa nunca aquí.

> Si arrancas la app sin este archivo no verás un error: sale la pantalla
> `/setup` diciéndote exactamente qué variable falta.

## 4. Comprobar la conexión

```bash
npm run check
```

Comprueba, sin escribir nada en tu base de datos, que las claves son válidas,
que existen las dos tablas y los dos buckets, y que el borrado está denegado.
Si algo falla te dice qué sección de `schema.sql` revisar.

## 5. Arrancar

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Se abre la tapa del álbum y entras directo.

---

## Qué significa “sin contraseña”, en concreto

Merece la pena tenerlo claro, porque no es sólo que no haya pantalla de login:

- Las políticas de la base de datos aceptan al rol **anónimo**. Tienen que
  hacerlo: no hay sesión que comprobar.
- La clave `anon` de Supabase viaja dentro del JavaScript que descarga el
  navegador. **Quien tenga la URL de la app tiene esa clave**, y con ella puede
  hablar directamente con la API de Supabase sin pasar por la web: listar todas
  las fotos, descargarlas o insertar las suyas.
- La protección real es que nadie conozca la URL. Ten en cuenta que la URL viaja
  al historial del navegador (que suele sincronizarse en la nube), a las vistas
  previas de WhatsApp o Telegram si la compartes por ahí, y se queda para siempre
  con cualquiera a quien se la enseñes.

Por eso el proyecto hace tres cosas para que un descuido no sea catastrófico:

1. **El rol anónimo no tiene permiso de DELETE**, ni en las tablas ni en los
   archivos del bucket. Nadie puede vaciar el álbum, ni desde la app ni desde la
   API.
2. **Borrar es lógico.** El botón de eliminar rellena `deleted_at`; la fila y la
   imagen se quedan en Supabase.
3. **La URL no se filtra sola**: las páginas van con `noindex, nofollow` (los
   buscadores no las listan) y con `referrer: no-referrer` (la dirección no viaja
   en la cabecera `Referer` a Google Fonts ni a ningún tercero).

### Me equivoqué de foto al subirla

El botón de la papelera (en el detalle de la foto) la quita del álbum para los
dos, al instante. No hace falta nada más para el uso normal.

Lo que hace por dentro es marcar `deleted_at`: la fila y la imagen se quedan
guardadas en Supabase. Por eso se puede deshacer, y por eso nadie con la clave
`anon` puede vaciar el álbum de verdad.

**Recuperar una que borraste sin querer:**

```sql
-- Ver las borradas
select id, caption, photo_date, deleted_at from public.photos
  where deleted_at is not null;

-- Devolver una al álbum
update public.photos set deleted_at = null where id = 'EL-ID';
```

**Borrarla de verdad** (subiste algo que no quieres que siga existiendo).
Son dos pasos, porque la imagen y su ficha están en sitios distintos:

1. Copia la ruta del archivo:

   ```sql
   select id, image_url from public.photos where id = 'EL-ID';
   ```

   Sale algo como `album/3f2a....jpg`.

2. Panel de Supabase → **Storage** → bucket `photos` → carpeta `album` →
   busca ese archivo y bórralo con el menú de los tres puntos.

3. Vuelve al **SQL Editor** y borra la ficha:

   ```sql
   delete from public.photos where id = 'EL-ID';
   ```

   Esto funciona desde el SQL Editor aunque la app no pueda borrar: ahí actúas
   como dueño de la base de datos, no con la clave `anon`.

### Si algún día quieres cerrarlo

Lo más simple, sin cuentas ni correos, es un código compartido: una pantalla que
pide un PIN, lo guarda en el dispositivo y no lo vuelve a pedir. Habría que
cambiar las políticas de `schema.sql` y añadir esa pantalla; el resto de la app
(árbol, galería, subida, logo) no se toca.

---

## Estructura

```
app/
  layout.tsx              Fuentes, metadatos, íconos dinámicos, theme-color
  page.tsx                Pantalla de carga (la tapa del álbum se abre)
  manifest.ts             manifest.webmanifest generado con el logo actual
  offline/                Fallback del service worker
  setup/                  Aviso de configuración pendiente (en vez de un 500)
  (app)/
    layout.tsx            Header + cajón + nav inferior + Realtime
    arbol/                Árbol de recuerdos (pantalla principal)
    galeria/              Cuadrícula por años
    subir/                Formulario de subida
    ajustes/              Logo de la app y ficha del álbum
  foto/[id]/              Detalle a pantalla completa (editar / eliminar)

components/               UI (AppShell, Polaroid, TreeView, SplashCover…)
lib/
  supabase/client.ts      Cliente de navegador
  supabase/server.ts      Cliente de servidor
  photos.ts               Lectura + firma de URLs
  imaging.ts              Redimensionado y recorte en el navegador
  logo.ts                 Rutas y versión del logo
  env.ts                  Comprobación de variables de entorno
  utils.ts                Fechas en español, rotaciones estables
middleware.ts             Sólo redirige a /setup si falta configuración
public/sw.js              Service worker
supabase/schema.sql       Todo el backend en un archivo
scripts/generate-icons.mjs
```

## El logo de la app

En **Ajustes del Libro** eliges una imagen del dispositivo. El navegador la
recorta en cuadrado y genera tres PNG (180, 192 y 512 px) que se suben al bucket
`branding`. A partir de ahí se usa como:

- etiqueta de la tapa en la pantalla de carga,
- logo de la cabecera,
- favicon, `apple-touch-icon` e íconos del `manifest.webmanifest`.

Si ya tenías la PWA instalada, el ícono del escritorio se actualiza al
reinstalarla desde el navegador (así funcionan las PWA en iOS y Android).

El logo por defecto es la etiqueta “Nyp” del diseño de Stitch, en
`public/icons/logo.png`. Si lo cambias en el repo, regenera los tamaños con
`npm run icons`.

## Instalar en el móvil

- **Android / Chrome**: menú ⋮ → *Añadir a pantalla de inicio*.
- **iOS / Safari**: Compartir → *Añadir a pantalla de inicio*.

Hace falta HTTPS, así que en el móvil se instala desde el despliegue real, no
desde `localhost`.

## Desplegar en Vercel

```bash
npm run build
```

Importa el repo en Vercel y añade las dos variables de entorno. La URL que te
genere (`algo.vercel.app`) es la llave del álbum: guárdala como guardarías una
contraseña.
