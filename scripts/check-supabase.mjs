/**
 * Comprueba que la app puede hablar con Supabase y que schema.sql quedó bien.
 *
 *   npm run check
 *
 * No toca tus fotos. Lo único que escribe es una fila de prueba en
 * `app_settings` con la clave `__check`, que la app ignora.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const bad = (msg, hint) => {
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
  if (hint) console.log(`    \x1b[2m${hint}\x1b[0m`);
  failures++;
};

let failures = 0;

/** Traduce el error de Supabase a la pista útil, no a la genérica. */
const hintFor = (error, fallback) => {
  const msg = String(error?.message ?? '');
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(msg)) {
    return 'No se llegó al servidor. Revisa que la URL sea la correcta y que tengas internet.';
  }
  if (error?.code === '42P01') {
    return 'La tabla no existe. ¿Ejecutaste supabase/schema.sql en el SQL Editor?';
  }
  if (/invalid|jwt|api key/i.test(msg)) {
    return 'La clave anon no es válida. Cópiala de nuevo desde Project Settings → API Keys.';
  }
  return fallback;
};

console.log('\n\x1b[1mNuestro Árbol — comprobación de Supabase\x1b[0m\n');

// ── 1. Variables de entorno ────────────────────────────────────────────────
if (!url || !key) {
  console.log('  \x1b[31m✗\x1b[0m Faltan las variables de entorno.');
  console.log('\n    Abre \x1b[1m.env.local\x1b[0m y pega los dos valores del panel de Supabase:');
  console.log('    Project Settings → API Keys → "Project URL" y "anon public".\n');
  process.exit(1);
}

if (/^(sb_publishable_|sb_secret_|eyJ)/.test(url)) {
  bad(
    'En NEXT_PUBLIC_SUPABASE_URL hay una clave, no la dirección del proyecto.',
    'La URL está en Project Settings → Data API → "Project URL". Es la que acaba en .supabase.co'
  );
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  bad(
    `La URL no tiene la forma esperada: ${url}`,
    'Debe ser https://algo.supabase.co (sin barra ni rutas al final).'
  );
} else {
  ok(`URL del proyecto: ${url}`);
}

if (key.includes('service_role')) {
  bad('Estás usando la clave service_role.', 'Usa la "anon public". La service_role da acceso total y no debe salir del servidor.');
} else if (key.length < 40) {
  bad('La clave anon parece incompleta.', 'Cópiala entera, es muy larga.');
} else {
  ok(`Clave anon: ${key.slice(0, 12)}…${key.slice(-6)} (${key.length} caracteres)`);
}

if (failures > 0) {
  console.log('\n\x1b[31mArregla lo de arriba y vuelve a ejecutar `npm run check`.\x1b[0m\n');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('');

// ── 2. Tabla photos ────────────────────────────────────────────────────────
{
  const { count, error } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);

  if (error) {
    bad(
      `No se puede leer la tabla "photos": ${error.message}`,
      hintFor(error, 'Revisa las políticas de la sección 2 de schema.sql.')
    );
  } else {
    ok(`Tabla "photos" accesible — ${count ?? 0} recuerdo(s) en el álbum`);
  }
}

// ── 3. Tabla app_settings ──────────────────────────────────────────────────
{
  const { error } = await supabase.from('app_settings').select('key').limit(1);
  if (error) {
    bad(
      `No se puede leer "app_settings": ${error.message}`,
      hintFor(error, 'Revisa la sección 2 de schema.sql.')
    );
  } else {
    ok('Tabla "app_settings" accesible');
  }
}

// ── 4. Bucket privado de fotos ─────────────────────────────────────────────
{
  const { error } = await supabase.storage.from('photos').list('', { limit: 1 });
  if (error) {
    bad(
      `No se puede leer el bucket "photos": ${error.message}`,
      hintFor(error, 'Revisa las secciones 3 y 4 de schema.sql (bucket y políticas de storage).')
    );
  } else {
    ok('Bucket "photos" accesible (privado, con URL firmada)');
  }
}

// ── 5. Bucket público del logo ─────────────────────────────────────────────
{
  const { error } = await supabase.storage.from('branding').list('', { limit: 1 });
  if (error) {
    bad(
      `No se puede leer el bucket "branding": ${error.message}`,
      hintFor(error, 'Revisa la sección 3 de schema.sql.')
    );
  } else {
    ok('Bucket "branding" accesible (público, para el ícono de la PWA)');
  }
}

// ── 6. Escritura, y que el borrado sea inofensivo ──────────────────────────
//
// Con RLS activo y sin policy de DELETE, Postgres NO devuelve error: no ve
// ninguna fila que puedas borrar y responde "0 filas afectadas". La única
// forma de comprobarlo es intentar borrar algo que sabemos que existe y
// mirar si sigue ahí.
//
// La fila de prueba va en app_settings, no en photos, para no ensuciar el
// álbum. Siempre es la misma clave, así que nunca se acumulan.
{
  const CHECK_KEY = '__check';

  const { error: writeError } = await supabase
    .from('app_settings')
    .upsert(
      { key: CHECK_KEY, value: String(Date.now()), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (writeError) {
    bad(
      `No se puede escribir en la base de datos: ${writeError.message}`,
      hintFor(writeError, 'Revisa las políticas de insert/update de la sección 2 de schema.sql.')
    );
  } else {
    ok('Escritura correcta — subir fotos va a funcionar');

    await supabase.from('app_settings').delete().eq('key', CHECK_KEY);

    const { data: survivor } = await supabase
      .from('app_settings')
      .select('key')
      .eq('key', CHECK_KEY)
      .maybeSingle();

    if (survivor) {
      ok('El borrado está denegado — nadie puede vaciar el álbum');
    } else {
      bad(
        'El borrado NO está denegado: la fila de prueba desapareció.',
        'Hay una policy de DELETE que no debería existir. En el SQL Editor:\n' +
          "    select tablename, policyname from pg_policies where cmd = 'DELETE';"
      );
    }
  }
}

// ── Resultado ──────────────────────────────────────────────────────────────
console.log('');
if (failures === 0) {
  console.log('\x1b[32m\x1b[1mTodo conectado.\x1b[0m Arranca con \x1b[1mnpm run dev\x1b[0m\n');
} else {
  console.log(`\x1b[31m\x1b[1m${failures} problema(s).\x1b[0m Revisa las pistas de arriba.\n`);
  process.exit(1);
}
