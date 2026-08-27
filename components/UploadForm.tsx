'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { prepareUpload } from '@/lib/imaging';
import { todayLocalISO } from '@/lib/utils';
import Icon from '@/components/Icon';

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocalISO());
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  // La URL del preview es un objeto en memoria: hay que liberarla.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    setError(null);
    if (picked && picked.size > 25 * 1024 * 1024) {
      setError('Esa foto pesa demasiado (más de 25 MB).');
      return;
    }
    setFile(picked);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Falta elegir la foto.');
      return;
    }

    setStatus('working');
    const supabase = createClient();

    try {
      // 1. Reescalamos en el navegador y sacamos también la miniatura.
      const { full, thumb, contentType, extension } = await prepareUpload(file);

      // 2. Las guardamos en el bucket. La miniatura va al lado de la grande,
      //    con el sufijo _thumb, que es como la busca lib/photos.ts.
      const id = crypto.randomUUID();
      const path = `album/${id}.${extension}`;

      // cacheControl alto: el archivo nunca cambia, sólo cambia su firma.
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, full, { contentType, cacheControl: '31536000', upsert: false });
      if (uploadError) throw uploadError;

      if (thumb) {
        // Si falla la miniatura no abortamos: la app usará la foto grande.
        await supabase.storage
          .from('photos')
          .upload(`album/${id}_thumb.jpg`, thumb, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false,
          });
      }

      // 3. Y anotamos el recuerdo en la tabla.
      const { error: insertError } = await supabase.from('photos').insert({
        image_url: path,
        caption: caption.trim() || null,
        photo_date: date,
      });
      if (insertError) throw insertError;

      setStatus('done');
      router.push('/arbol');
      router.refresh();
    } catch (err) {
      setStatus('idle');
      const message = err instanceof Error ? err.message : 'No se pudo guardar el recuerdo.';
      setError(
        /row-level security|violates/i.test(message)
          ? 'La base de datos rechazó la subida. ¿Ejecutaste supabase/schema.sql?'
          : message
      );
    }
  }

  const busy = status !== 'idle';

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
      <h2 className="mb-6 text-center font-display-lg text-display-fluid text-secondary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Subir un Recuerdo
      </h2>

      {/* ── Hueco vacío del álbum ──────────────────────────────────────── */}
      <div className="group relative mt-2 w-full max-w-sm">
        <div className="paper-texture flex flex-col items-center justify-center border border-paper-edge p-6 shadow-[2px_4px_16px_rgba(0,0,0,0.8)]">
          <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden border border-sepia-shadow bg-surface-container-low shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] transition-colors duration-300 group-hover:bg-surface-container">
            <span className="gold-bracket bracket-tl" />
            <span className="gold-bracket bracket-tr" />
            <span className="gold-bracket bracket-bl" />
            <span className="gold-bracket bracket-br" />

            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa"
                className="h-full w-full object-cover"
                style={{ filter: 'sepia(0.4) contrast(1.2) brightness(0.9)' }}
              />
            ) : (
              <>
                <Icon
                  name="add_photo_alternate"
                  weight={200}
                  className="mb-3 text-5xl text-outline opacity-40"
                />
                <span className="font-label-caps text-label-caps uppercase text-outline opacity-60">
                  Elegir imagen
                </span>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handlePick}
              disabled={busy}
              aria-label="Elegir imagen"
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          {preview && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              disabled={busy}
              className="mt-4 font-label-caps text-label-caps uppercase tracking-wider text-dried-ink opacity-60 underline-offset-4 hover:opacity-100 hover:underline"
            >
              Cambiar la foto
            </button>
          )}
        </div>
      </div>

      {/* ── Ficha de papel con los datos ───────────────────────────────── */}
      <div className="paper-texture mt-8 flex w-full max-w-sm flex-col items-center space-y-10 p-8 shadow-[2px_4px_16px_rgba(0,0,0,0.8)]">
        <div className="relative w-full">
          <label
            htmlFor="photo-date"
            className="absolute -top-6 left-0 font-label-caps text-label-caps uppercase tracking-wider text-on-tertiary-container"
          >
            Fecha
          </label>
          <input
            id="photo-date"
            type="date"
            required
            value={date}
            max={todayLocalISO()}
            onChange={(e) => setDate(e.target.value)}
            disabled={busy}
            className="ink-line w-full bg-transparent py-2 font-body-md text-body-md"
          />
        </div>

        <div className="relative w-full">
          <label
            htmlFor="photo-caption"
            className="absolute -top-6 left-0 font-label-caps text-label-caps uppercase tracking-wider text-on-tertiary-container"
          >
            Nota
          </label>
          <textarea
            id="photo-caption"
            rows={3}
            maxLength={280}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={busy}
            placeholder="Escribe un recuerdo…"
            className="ink-line w-full resize-none bg-transparent py-2 font-body-md text-body-md leading-loose"
          />
          <span className="mt-1 block text-right font-label-caps text-label-caps text-dried-ink opacity-40">
            {caption.length}/280
          </span>
        </div>

        {error && (
          <p className="w-full font-body-sm text-body-sm italic text-error-container" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !file}
          className="bronze-button flex w-full items-center justify-center gap-2 rounded-sm py-4 font-headline-sm text-headline-sm text-aged-parchment transition-transform duration-200 active:scale-95"
        >
          <Icon name="upload" weight={300} />
          {status === 'working' ? 'Guardando…' : 'Guardar el recuerdo'}
        </button>
      </div>
    </form>
  );
}
