/**
 * Comprobación de la configuración.
 *
 * Sin estas variables la app no puede hablar con Supabase. En vez de reventar
 * con un 500 ilegible, detectamos qué falta y mandamos a /setup, que lo explica.
 */

export type EnvStatus = {
  ok: boolean;
  missing: string[];
};

export function checkEnv(): EnvStatus {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return { ok: missing.length === 0, missing };
}

/** `true` si se puede crear un cliente de Supabase. */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
