'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { makeSquareIcon } from '@/lib/imaging';
import { LOGO_SIZES, LOGO_VERSION_KEY, logoObjectPath } from '@/lib/logo';
import Icon from '@/components/Icon';

/**
 * Elige el logo del álbum. La misma imagen se usa como:
 *   · etiqueta de la portada (pantalla de carga)
 *   · logo del header
 *   · favicon, apple-touch-icon e íconos del manifest de la PWA
 *
 * Se recorta en cuadrado y se sube en 180/192/512 px al bucket público
 * `branding`, con nombres fijos, para que el sistema operativo pueda pedirlos
 * sin sesión al instalar la app.
 */
export default function LogoSettings({ currentLogoUrl }: { currentLogoUrl: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSave() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    try {
      // Un PNG cuadrado por cada tamaño que pide la PWA.
      for (const size of LOGO_SIZES) {
        const blob = await makeSquareIcon(file, size);
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(logoObjectPath(size), blob, {
            contentType: 'image/png',
            cacheControl: '31536000',
            upsert: true, // el logo siempre vive en la misma ruta
          });
        if (uploadError) throw uploadError;
      }

      // El token de versión rompe la caché del navegador y del manifest.
      const { error: settingError } = await supabase.from('app_settings').upsert(
        {
          key: LOGO_VERSION_KEY,
          value: String(Date.now()),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (settingError) throw settingError;

      setSaved(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el logo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="paper-texture w-full max-w-sm p-8 shadow-[2px_4px_16px_rgba(0,0,0,0.8)]">
      <h3 className="font-headline-sm text-headline-sm text-dried-ink">El logo del álbum</h3>
      <p className="mt-2 font-body-sm text-body-sm italic text-dried-ink opacity-70">
        Se usa en la portada, en la cabecera y como ícono de la app en tu móvil.
      </p>

      {/* Marco con el logo actual o el nuevo */}
      <div className="relative mx-auto mt-8 flex aspect-square w-40 items-center justify-center overflow-hidden border border-sepia-shadow bg-surface-container-low shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
        <span className="gold-bracket bracket-tl" />
        <span className="gold-bracket bracket-tr" />
        <span className="gold-bracket bracket-bl" />
        <span className="gold-bracket bracket-br" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview ?? currentLogoUrl}
          alt="Logo actual"
          className="h-full w-full object-cover"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          aria-label="Elegir logo"
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            setError(null);
            setSaved(false);
            if (picked && picked.size > 5 * 1024 * 1024) {
              setError('Esa imagen pesa demasiado (más de 5 MB).');
              return;
            }
            setFile(picked);
          }}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <p className="mt-4 text-center font-label-caps text-label-caps uppercase tracking-wider text-dried-ink opacity-50">
        {preview ? 'Vista previa' : 'Toca para elegir otra'}
      </p>

      {error && (
        <p className="mt-6 font-body-sm text-body-sm italic text-error-container" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-6 font-body-sm text-body-sm italic text-dried-ink opacity-80" role="status">
          Logo guardado. Si ya tienes la app instalada, el ícono se actualiza al
          reinstalarla desde el navegador.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={busy || !file}
        className="bronze-button mt-8 flex w-full items-center justify-center gap-2 rounded-sm py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
      >
        <Icon name="check" weight={300} />
        {busy ? 'Guardando…' : 'Usar esta imagen'}
      </button>
    </div>
  );
}
