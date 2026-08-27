import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de servidor sin cookies ni sesión.
 *
 * La app no tiene login, así que no hay nada que leer de las cookies. Evitarlas
 * tiene una ventaja concreta: este cliente sí se puede usar dentro de
 * `unstable_cache`, que prohíbe las APIs dinámicas como `cookies()`.
 */
let cached: ReturnType<typeof createClient> | null = null;

export function anonClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
