import { NextResponse, type NextRequest } from 'next/server';
import { checkEnv } from '@/lib/env';

/**
 * El álbum no pide inicio de sesión, así que aquí no hay guardia de rutas.
 * Lo único que hace el middleware es evitar que la app reviente con un 500
 * cuando falta la configuración de Supabase: en ese caso manda a /setup,
 * que explica qué variable falta.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const env = checkEnv();

  if (!env.ok) {
    if (pathname === '/setup') return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = '/setup';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Ya configurado: /setup deja de tener sentido.
  if (pathname === '/setup') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Todo salvo assets estáticos, el service worker y el manifest.
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
