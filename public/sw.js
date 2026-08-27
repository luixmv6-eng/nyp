/**
 * Service worker de "Nuestro Árbol".
 *
 * Estrategia deliberadamente conservadora, porque los recuerdos importan:
 *   · Assets estáticos (/_next/static, /icons)  → cache-first (son inmutables)
 *   · Navegación (páginas HTML)                  → network-first con fallback offline
 *   · Fotos firmadas de Supabase                 → NUNCA se cachean (la firma caduca)
 *   · API de Supabase                            → NUNCA se cachea (datos frescos)
 */

const VERSION = 'v1';
const STATIC_CACHE = `arbol-static-${VERSION}`;
const PAGES_CACHE = `arbol-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('arbol-') && !key.endsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca tocar Supabase: ni la API ni las URLs firmadas de las fotos.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Nunca cachear las rutas de sesión.
  if (url.pathname.startsWith('/auth/')) return;

  // Assets inmutables de Next, íconos y la fuente de íconos: cache-first.
  const isFontHost =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isFontHost || url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Páginas: red primero, caché como red de seguridad si no hay conexión.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        })
    );
  }
});
