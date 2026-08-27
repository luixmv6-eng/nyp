'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para componentes que corren en el navegador.
 * Comparte la sesión por cookies con el cliente de servidor.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
    );
  }

  return createBrowserClient(url, key);
}
