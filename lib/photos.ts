import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Photo } from '@/lib/types';

/** Una foto ya lista para pintar: incluye la URL firmada temporal. */
export type PhotoWithUrl = Photo & { signedUrl: string };

/** Una hora: suficiente para una sesión de navegación, corto para filtrarse. */
const SIGNED_URL_TTL = 60 * 60;

/**
 * El bucket `photos` es privado, así que hay que firmar cada objeto.
 * `createSignedUrls` firma en lote (una sola llamada para todo el álbum).
 */
async function withSignedUrls(photos: Photo[]): Promise<PhotoWithUrl[]> {
  if (photos.length === 0) return [];

  const supabase = await createClient();
  const paths = photos.map((p) => p.image_url);
  const { data, error } = await supabase.storage
    .from('photos')
    .createSignedUrls(paths, SIGNED_URL_TTL);

  if (error || !data) return [];

  const urlByPath = new Map<string, string>();
  data.forEach((entry) => {
    if (entry.signedUrl && entry.path) urlByPath.set(entry.path, entry.signedUrl);
  });

  return photos
    .map((p) => ({ ...p, signedUrl: urlByPath.get(p.image_url) ?? '' }))
    .filter((p) => p.signedUrl !== '');
}

/**
 * Todas las fotos del álbum, de la más reciente a la más antigua.
 * El borrado es lógico, así que se excluyen las que tengan `deleted_at`.
 */
export async function listPhotos(): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .is('deleted_at', null)
    .order('photo_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return withSignedUrls(data as Photo[]);
}

/** Una foto concreta. `null` si no existe o si está borrada. */
export async function getPhoto(id: string): Promise<PhotoWithUrl | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  const [photo] = await withSignedUrls([data as Photo]);
  return photo ?? null;
}
