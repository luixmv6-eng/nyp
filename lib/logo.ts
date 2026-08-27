import { createClient as createBrowserClient } from '@supabase/supabase-js';

/**
 * El logo de la app vive en el bucket público `branding` con nombres fijos,
 * en los tres tamaños que necesita una PWA. Así la URL es determinista y el
 * manifest / apple-touch-icon la pueden pedir sin sesión.
 *
 * `app_settings.app_logo_version` guarda un token de versión para romper
 * la caché cuando se sube un logo nuevo.
 */

export const LOGO_VERSION_KEY = 'app_logo_version';

export const LOGO_SIZES = [180, 192, 512] as const;
export type LogoSize = (typeof LOGO_SIZES)[number];

export function logoObjectPath(size: LogoSize) {
  return `logo-${size}.png`;
}

export function logoPublicUrl(size: LogoSize, version: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !version) return `/icons/icon-${size}.png`;
  return `${base}/storage/v1/object/public/branding/${logoObjectPath(size)}?v=${version}`;
}

/**
 * Lee la versión del logo sin usar cookies (cliente anónimo).
 * Se usa desde el manifest, que el sistema operativo pide sin sesión.
 */
export async function getLogoVersion(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createBrowserClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', LOGO_VERSION_KEY)
      .maybeSingle();
    return data?.value ?? null;
  } catch {
    return null;
  }
}
