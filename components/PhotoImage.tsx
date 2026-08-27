'use client';

import { useState } from 'react';

/**
 * Imagen de un recuerdo.
 *
 * Se usa <img> y no next/image a propósito: las URLs de Supabase van firmadas
 * y caducan, así que pasarlas por el optimizador de Next sólo añadiría una
 * copia intermedia que se queda obsoleta.
 *
 * Lo que aporta sobre un <img> pelado:
 *  · aparece con un fundido en vez de dar un salto seco,
 *  · mientras carga se ve el papel, no un hueco en blanco,
 *  · si el archivo falla, lo dice en vez de dejar el icono roto del navegador.
 */
export default function PhotoImage({
  src,
  alt,
  className = '',
  style,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  if (state === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-dried-ink/80 px-3 text-center">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline/60">
          No se pudo cargar
        </span>
      </div>
    );
  }

  return (
    <>
      {state === 'loading' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-dried-ink/60 to-surface-container-lowest"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // fetchPriority alto sólo en lo que se ve de entrada; el resto no
        // compite por el ancho de banda con lo que está en pantalla.
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
        className={`${className} transition-opacity duration-500 ${
          state === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
        style={style}
      />
    </>
  );
}
