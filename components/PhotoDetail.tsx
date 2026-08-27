'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { PhotoWithUrl } from '@/lib/photos';
import { formatLongDate, stableRotation, todayLocalISO } from '@/lib/utils';
import Icon from '@/components/Icon';
import PhotoImage from '@/components/PhotoImage';

/**
 * Detalle del recuerdo: la foto ampliada sobre el cuero, con la fecha y la
 * nota escritas debajo como a mano. Cualquiera de los dos puede editarla o
 * borrarla — es un álbum compartido.
 */
export default function PhotoDetail({ photo }: { photo: PhotoWithUrl }) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [date, setDate] = useState(photo.photo_date);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rotation = stableRotation(photo.id, 3);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('photos')
      .update({ caption: caption.trim() || null, photo_date: date })
      .eq('id', photo.id);

    setBusy(false);
    if (updateError) {
      setError('No se pudo guardar el cambio.');
      return;
    }
    setEditing(false);
    router.refresh();
  }

  /**
   * Borrado lógico: la foto desaparece del álbum, pero la fila y el archivo
   * siguen en Supabase. Así un borrado por error se puede deshacer desde el
   * SQL Editor, y nadie con la clave anon puede destruir el álbum de verdad.
   */
  async function handleDelete() {
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('photos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', photo.id);

    if (deleteError) {
      setBusy(false);
      setError('No se pudo eliminar el recuerdo.');
      return;
    }

    router.push('/arbol');
    router.refresh();
  }

  return (
    <main className="leather-radial vignette-inset relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden">
      {/* ── Acciones ───────────────────────────────────────────────────── */}
      <nav className="pt-safe-4 px-edge-safe fixed top-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-leather-deep to-transparent pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex items-center justify-center rounded-circle p-2 transition-opacity duration-300 hover:opacity-80 active:scale-95"
        >
          <Icon name="arrow_back" weight={200} className="aged-icon text-3xl" />
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setEditing((v) => !v); setError(null); }}
            aria-label="Editar recuerdo"
            className="flex items-center justify-center rounded-circle p-2 transition-opacity duration-300 hover:opacity-80 active:scale-95"
          >
            <Icon name={editing ? 'close' : 'edit'} weight={200} className="aged-icon text-2xl" />
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Eliminar recuerdo"
            className="flex items-center justify-center rounded-circle p-2 transition-opacity duration-300 hover:opacity-80 active:scale-95"
          >
            <Icon name="delete" weight={200} className="aged-icon text-2xl" />
          </button>
        </div>
      </nav>

      {/* ── La foto ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-40 pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <motion.div
          className="group relative z-10 w-full max-w-[min(400px,52vh)] md:max-w-[min(460px,62vh)]"
          initial={{ opacity: 0, y: 16, rotate: rotation }}
          animate={{ opacity: 1, y: 0, rotate: rotation }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Esquineros de latón */}
          <span className="absolute -left-2 -top-2 z-20 h-6 w-6 border-l-2 border-t-2 border-tarnished-brass opacity-90 shadow-[1px_1px_2px_rgba(0,0,0,0.6)]" />
          <span className="absolute -right-2 -top-2 z-20 h-6 w-6 border-r-2 border-t-2 border-tarnished-brass opacity-90 shadow-[-1px_1px_2px_rgba(0,0,0,0.6)]" />
          <span className="absolute -bottom-2 -left-2 z-20 h-6 w-6 border-b-2 border-l-2 border-tarnished-brass opacity-90 shadow-[1px_-1px_2px_rgba(0,0,0,0.6)]" />
          <span className="absolute -bottom-2 -right-2 z-20 h-6 w-6 border-b-2 border-r-2 border-tarnished-brass opacity-90 shadow-[-1px_-1px_2px_rgba(0,0,0,0.6)]" />

          <div className="polaroid-frame relative flex aspect-[3/4] w-full flex-col items-center justify-start overflow-hidden rounded-sm p-photo-gutter pb-[72px]">
            <div
              className="relative h-full w-full overflow-hidden border border-black/10 bg-cover bg-center shadow-inner"
              // La miniatura (ya cacheada por el árbol o la galería) se pinta
              // difuminada de fondo mientras baja la foto grande. Así el hueco
              // nunca está vacío y la espera se nota mucho menos.
              style={{ backgroundImage: `url(${photo.thumbUrl})` }}
            >
              <PhotoImage
                src={photo.url}
                alt={photo.caption ?? 'Recuerdo'}
                priority
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Fecha y nota, escritas sobre el cuero ────────────────────── */}
        {editing ? (
          <form
            onSubmit={handleSave}
            className="paper-texture relative z-10 mt-10 flex w-full max-w-sm flex-col gap-8 p-8 shadow-[2px_4px_16px_rgba(0,0,0,0.8)]"
          >
            <div className="relative">
              <label
                htmlFor="edit-date"
                className="absolute -top-6 left-0 font-label-caps text-label-caps uppercase tracking-wider text-on-tertiary-container"
              >
                Fecha
              </label>
              <input
                id="edit-date"
                type="date"
                required
                value={date}
                max={todayLocalISO()}
                onChange={(e) => setDate(e.target.value)}
                disabled={busy}
                className="ink-line w-full bg-transparent py-2 font-body-md text-body-md"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="edit-caption"
                className="absolute -top-6 left-0 font-label-caps text-label-caps uppercase tracking-wider text-on-tertiary-container"
              >
                Nota
              </label>
              <textarea
                id="edit-caption"
                rows={3}
                maxLength={280}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={busy}
                placeholder="Escribe un recuerdo…"
                className="ink-line w-full resize-none bg-transparent py-2 font-body-md text-body-md leading-loose"
              />
            </div>

            {error && (
              <p className="font-body-sm text-body-sm italic text-error-container" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="bronze-button flex w-full items-center justify-center gap-2 rounded-sm py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
            >
              <Icon name="check" weight={300} />
              {busy ? 'Guardando…' : 'Guardar'}
            </button>
          </form>
        ) : (
          <motion.div
            className="relative z-10 mt-12 w-full rotate-1 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <p className="aged-metal mb-2 font-display-lg text-display-fluid italic drop-shadow-md">
              {formatLongDate(photo.photo_date)}
            </p>
            {photo.caption && (
              <p className="aged-metal font-body-lg text-body-lg italic">{photo.caption}</p>
            )}
          </motion.div>
        )}

        {error && !editing && (
          <p className="relative z-10 mt-6 font-body-sm text-body-sm italic text-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* ── Confirmación de borrado ────────────────────────────────────── */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !busy && setConfirming(false)}
            />
            {/* Centrado con flex: Framer Motion escribe transform en línea
                y pisaría un -translate-y-1/2 de Tailwind. */}
            <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-6">
            <motion.div
              className="pointer-events-auto my-auto w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            >
              <div className="paper-texture p-8 text-center shadow-[2px_4px_24px_rgba(0,0,0,0.9)]">
                <h3 className="font-headline-sm text-headline-sm text-dried-ink">
                  ¿Arrancar esta página?
                </h3>
                <p className="mt-3 font-body-md text-body-md italic text-dried-ink opacity-70">
                  Desaparece del álbum para los dos. La foto queda guardada en
                  Supabase por si algún día la quieres de vuelta.
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                    className="flex-1 border border-dried-ink/30 py-3 font-label-caps text-label-caps uppercase tracking-wider text-dried-ink transition-opacity hover:opacity-70 active:scale-95"
                  >
                    Conservar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="flex-1 bg-error-container py-3 font-label-caps text-label-caps uppercase tracking-wider text-on-error-container transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {busy ? 'Borrando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
