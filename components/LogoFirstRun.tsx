'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const DISMISS_KEY = 'arbol:logo-prompt-dismissed';

/**
 * La primera vez que se abre el álbum (mientras no haya un logo guardado)
 * preguntamos qué imagen quiere usarse como logo. Se puede posponer; siempre
 * queda disponible en Ajustes.
 */
export default function LogoFirstRun() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      /* modo privado o cookies bloqueadas: enseñamos el aviso igualmente */
    }
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* si no se puede recordar, volverá a aparecer; no es grave */
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          {/* El centrado va con flex, no con -translate-y-1/2: Framer Motion
              escribe `transform` en línea y pisaría la clase de Tailwind. */}
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-6">
          <motion.div
            className="pointer-events-auto my-auto w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.94, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="paper-texture relative p-8 text-center shadow-[2px_4px_24px_rgba(0,0,0,0.9)]">
              <span className="gold-bracket bracket-tl" />
              <span className="gold-bracket bracket-br" />

              <h3 className="font-headline-sm text-headline-sm text-dried-ink">
                ¿Qué imagen ponemos en la portada?
              </h3>
              <p className="mt-4 font-body-md text-body-md italic text-dried-ink opacity-75">
                Elige una foto o un dibujo vuestro. Será la etiqueta de la tapa,
                el logo de la cabecera y el ícono de la app en el móvil.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/ajustes"
                  onClick={dismiss}
                  className="bronze-button w-full rounded-sm py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
                >
                  Elegir el logo
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="font-label-caps text-label-caps uppercase tracking-wider text-dried-ink opacity-50 underline-offset-4 hover:underline hover:opacity-80"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
