'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PLAYED_KEY = 'arbol:intro';

/**
 * Apertura del álbum.
 *
 * Vive en el layout raíz, no en una página. Ésa es la diferencia: la portada
 * es una capa por encima de todo, así que la navegación a /arbol ocurre por
 * debajo mientras la tapa sigue cerrada. Cuando la tapa se abre, el álbum ya
 * está montado detrás y sólo hay que acercarse a él — sin cortes.
 *
 * La secuencia es:
 *   1. la tapa de cuero, quieta, con los puntos de latón latiendo
 *   2. la tapa gira sobre su lomo
 *   3. la cámara entra: la capa se acerca y se disuelve mientras el contenido
 *      crece desde 0.92 hasta su tamaño real
 *
 * Se reproduce una vez por sesión del navegador.
 */
export default function AlbumIntro({ logoUrl }: { logoUrl: string }) {
  const [phase, setPhase] = useState<'idle' | 'closed' | 'opening' | 'zooming' | 'gone'>('idle');

  // OJO: este efecto no puede depender de nada que cambie después del montaje.
  // Con `useReducedMotion()` en las dependencias se re-ejecutaba (devuelve null
  // en el primer render y false después), y en la segunda pasada sessionStorage
  // ya estaba marcado, así que la animación se cortaba a la mitad. Por eso la
  // preferencia se lee aquí dentro con matchMedia.
  useEffect(() => {
    // Quien decide si toca abrir el álbum es el script en línea del <head>,
    // que corre antes de pintar. Aquí sólo se comprueba su veredicto: así el
    // telón y esta animación no pueden discrepar.
    const shouldPlay = document.documentElement.getAttribute('data-intro') === 'playing';

    if (!shouldPlay) {
      setPhase('gone');
      return;
    }

    try {
      sessionStorage.setItem(PLAYED_KEY, '1');
    } catch {
      /* modo privado: como mucho se repite en la próxima carga */
    }

    setPhase('closed');

    const openAt = setTimeout(() => setPhase('opening'), 1000);
    const zoomAt = setTimeout(() => {
      setPhase('zooming');
      // Aquí el contenido empieza a crecer hasta su tamaño real, a la vez
      // que la portada se aleja: los dos movimientos se solapan.
      document.documentElement.setAttribute('data-intro', 'done');
    }, 2050);
    const endAt = setTimeout(() => setPhase('gone'), 2950);

    return () => {
      clearTimeout(openAt);
      clearTimeout(zoomAt);
      clearTimeout(endAt);
      document.documentElement.setAttribute('data-intro', 'done');
    };
  }, []);

  const visible = phase === 'closed' || phase === 'opening' || phase === 'zooming';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="album-intro"
          className="leather-texture fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={
            phase === 'zooming'
              ? { opacity: 0, scale: 1.6 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.32, 0, 0.24, 1] }}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Viñeta */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

          <div
            className="relative mx-6 aspect-[3/4] w-full max-w-[min(22rem,80vw)]"
            style={{ perspective: '1400px' }}
          >
            {/* La tapa de cuero */}
            <motion.div
              className="album-cover relative flex h-full w-full flex-col items-center justify-center rounded-l-sm rounded-r-xl"
              style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={
                phase === 'closed'
                  ? { rotateY: 0, x: 0, filter: 'brightness(1)' }
                  : { rotateY: -118, x: '-6%', filter: 'brightness(0.35)' }
              }
              transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }}
            >
              {/* Lomo */}
              <div className="spine-crease absolute bottom-0 left-0 top-0 z-10 w-8 rounded-l-sm border-r border-[#1a1410]" />

              {/* Herrajes de latón */}
              <div className="metallic-hardware absolute right-0 top-0 z-20 h-12 w-12 rounded-bl-full rounded-tr-xl opacity-90" />
              <div className="metallic-hardware absolute bottom-0 right-0 z-20 h-12 w-12 rounded-br-xl rounded-tl-full opacity-90" />

              {/* Broche */}
              <div className="metallic-hardware absolute -right-2 top-1/2 z-30 flex h-16 w-4 -translate-y-1/2 items-center justify-center rounded-r-md">
                <div className="h-2 w-2 rounded-circle bg-[#3a2a24] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Etiqueta central: el logo */}
              <div className="relative z-20 flex flex-col items-center justify-center px-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Nuestro Árbol"
                  className="w-[min(14rem,45vw)] rotate-[-2deg] rounded-sm border border-[#1a1410] object-cover opacity-95 shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                />

                <div className="mb-5 mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

                {/* Tres puntos de latón */}
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ opacity: phase === 'closed' ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {[0, 0.2, 0.4].map((delay) => (
                    <div
                      key={delay}
                      className="metallic-hardware h-2 w-2 animate-pulse-gold rounded-circle"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </motion.div>
              </div>

              <div className="scratch-overlay pointer-events-none absolute inset-0 rounded-r-xl opacity-20" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
