'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Pantalla de carga: la tapa de cuero del álbum se abre sobre su lomo
 * (rotación en Y con perspectiva) y deja ver la primera página.
 * Al terminar, entra al árbol.
 */
export default function SplashCover({ logoUrl }: { logoUrl: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);

  // Precargamos la ruta de destino mientras el usuario mira la portada.
  useEffect(() => {
    router.prefetch('/arbol');
  }, [router]);

  useEffect(() => {
    if (reduceMotion) {
      router.replace('/arbol');
      return;
    }
    const start = setTimeout(() => setOpening(true), 1500);
    const go = setTimeout(() => router.replace('/arbol'), 2900);
    return () => {
      clearTimeout(start);
      clearTimeout(go);
    };
  }, [router, reduceMotion]);

  return (
    <main className="leather-texture fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Viñeta */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <div
        className="relative mx-6 aspect-[3/4] w-full max-w-sm md:max-w-md"
        style={{ perspective: '1400px' }}
      >
        {/* Primera página del álbum, escondida bajo la tapa */}
        <motion.div
          className="paper-layer absolute inset-0 flex flex-col items-center justify-center rounded-sm px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: 0.7, delay: opening ? 0.35 : 0 }}
        >
          <p className="font-label-caps text-label-caps uppercase text-tarnished-brass opacity-70">
            Nuestro
          </p>
          <h2 className="gold-emboss mt-3 font-cover text-display-lg-mobile">Árbol</h2>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />
        </motion.div>

        {/* La tapa de cuero */}
        <motion.div
          className="album-cover relative flex h-full w-full flex-col items-center justify-center rounded-l-sm rounded-r-xl"
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 0 }}
          animate={
            opening
              ? { rotateY: -115, x: '-4%', filter: 'brightness(0.45)' }
              : { rotateY: 0, x: 0, filter: 'brightness(1)' }
          }
          transition={{ duration: 1.25, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Lomo */}
          <div className="spine-crease absolute bottom-0 left-0 top-0 z-10 w-8 rounded-l-sm border-r border-[#1a1410]" />

          {/* Herrajes de latón en las esquinas */}
          <div className="metallic-hardware absolute right-0 top-0 z-20 h-12 w-12 rounded-bl-full rounded-tr-xl opacity-90" />
          <div className="metallic-hardware absolute bottom-0 right-0 z-20 h-12 w-12 rounded-br-xl rounded-tl-full opacity-90" />

          {/* Broche */}
          <div className="metallic-hardware absolute -right-2 top-1/2 z-30 flex h-16 w-4 -translate-y-1/2 items-center justify-center rounded-r-md">
            <div className="h-2 w-2 rounded-circle bg-[#3a2a24] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Etiqueta central: el logo */}
          <div className="relative z-20 mx-12 flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Nuestro Árbol"
              className="w-40 rotate-[-2deg] rounded-sm border border-[#1a1410] object-cover opacity-95 shadow-[0_10px_30px_rgba(0,0,0,0.9)] sm:w-56"
            />

            <div className="mb-6 mt-10 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

            {/* Indicador de carga: tres puntos de latón */}
            <div className="flex items-center gap-3">
              {[0, 0.2, 0.4].map((delay) => (
                <div
                  key={delay}
                  className="metallic-hardware h-2 w-2 animate-pulse-gold rounded-circle"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>

          <div className="scratch-overlay pointer-events-none absolute inset-0 rounded-r-xl opacity-20" />
        </motion.div>
      </div>
    </main>
  );
}
