import 'server-only';
import { unstable_cache } from 'next/cache';
import { anonClient } from '@/lib/supabase/anon';
import type { Photo } from '@/lib/types';

/** Una foto lista para pintar: la grande y su miniatura. */
export type PhotoWithUrl = Photo & {
  /** Imagen a tamaño completo, para el detalle. */
  url: string;
  /** Miniatura ligera, para el árbol y la galería. */
  thumbUrl: string;
};

/**
 * El bucket es privado, así que cada objeto necesita una URL firmada. El
 * detalle importante: Supabase genera una firma DISTINTA cada vez, así que si
 * firmáramos en cada render el navegador no podría cachear ni una imagen y
 * volvería a descargarlas todas en cada navegación.
 *
 * Por eso la firma se cachea: durante SIGN_CACHE_TTL se devuelve exactamente
 * la misma URL, el navegador la reconoce y tira de su caché. La firma vive
 * más que la caché para que nunca se sirva una a punto de caducar.
 */
const SIGN_TTL = 60 * 60 * 6; // la firma vale 6 h
const SIGN_CACHE_TTL = 60 * 60 * 4; // se reutiliza 4 h → 2 h de margen

/** Miniatura de `album/abc.jpg` → `album/abc_thumb.jpg`. */
export function thumbPathFor(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot === -1 ? `${path}_thumb` : `${path.slice(0, dot)}_thumb.jpg`;
}

/**
 * Firma un lote de rutas. Cacheado por lote: mientras el conjunto de fotos no
 * cambie, las URLs son estables y el navegador reutiliza sus descargas.
 */
const signPaths = unstable_cache(
  async (paths: string[]): Promise<Record<string, string>> => {
    if (paths.length === 0) return {};

    const supabase = anonClient();
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrls(paths, SIGN_TTL);

    if (error || !data) return {};

    const urls: Record<string, string> = {};
    for (const entry of data) {
      // Las rutas que no existen (p. ej. la miniatura de una foto antigua)
      // vuelven con `error` y sin URL: simplemente no entran en el mapa.
      if (entry.signedUrl && entry.path) urls[entry.path] = entry.signedUrl;
    }
    return urls;
  },
  ['photos-signed-urls'],
  { revalidate: SIGN_CACHE_TTL, tags: ['photos-signed-urls'] }
);

async function withUrls(photos: Photo[]): Promise<PhotoWithUrl[]> {
  if (photos.length === 0) return [];

  // Se piden las dos versiones de golpe, en una sola llamada.
  // Se ordenan porque el conjunto de rutas es la clave de caché: si sólo cambia
  // el orden del álbum (al editar la fecha de una foto) las URLs deben seguir
  // siendo las mismas, para no tirar la caché del navegador sin motivo.
  const paths = photos
    .flatMap((p) => [p.image_url, thumbPathFor(p.image_url)])
    .sort();
  const urls = await signPaths(paths);

  return photos
    .map((photo) => {
      const url = urls[photo.image_url] ?? '';
      // Las fotos subidas antes de que existieran las miniaturas no tienen
      // `_thumb`: para esas se usa la grande y santas pascuas.
      const thumbUrl = urls[thumbPathFor(photo.image_url)] ?? url;
      return { ...photo, url, thumbUrl };
    })
    .filter((photo) => photo.url !== '');
}

/** Todas las fotos del álbum, de la más reciente a la más antigua. */
export async function listPhotos(): Promise<PhotoWithUrl[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .is('deleted_at', null)
    .order('photo_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return withUrls(data as unknown as Photo[]);
}

/** Una foto concreta. `null` si no existe o si está borrada. */
export async function getPhoto(id: string): Promise<PhotoWithUrl | null> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  const [photo] = await withUrls([data as unknown as Photo]);
  return photo ?? null;
}

/** Cuántos recuerdos hay colgados. */
export async function countPhotos(): Promise<number> {
  const supabase = anonClient();
  const { count } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);
  return count ?? 0;
}
