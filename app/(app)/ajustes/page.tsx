import LogoSettings from '@/components/LogoSettings';
import { countPhotos } from '@/lib/photos';
import { getLogoVersion, logoPublicUrl } from '@/lib/logo';
import { APP_VERSION } from '@/lib/version';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ajustes del Libro · Nuestro Árbol' };

export default async function AjustesPage() {
  const [count, version] = await Promise.all([countPhotos(), getLogoVersion()]);

  return (
    <main className="flex flex-col items-center px-6 pb-16 pt-8">
      <h2 className="mb-8 text-center font-display-lg text-display-fluid text-secondary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Ajustes del Libro
      </h2>

      <LogoSettings currentLogoUrl={logoPublicUrl(512, version)} />

      {/* Ficha del álbum */}
      <div className="mt-10 w-full max-w-sm border border-outline-variant/20 bg-surface-container/40 p-6">
        <h3 className="font-label-caps text-label-caps uppercase tracking-wider text-tarnished-brass">
          Este álbum
        </h3>
        <dl className="mt-4 space-y-3 font-body-md text-body-md text-on-surface">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="opacity-60">Recuerdos</dt>
            <dd className="text-secondary">{count}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="opacity-60">Entrada</dt>
            <dd className="text-secondary">Sin contraseña</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="opacity-60">Versión</dt>
            <dd className="text-secondary">{APP_VERSION}</dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-outline-variant/20 pt-4 font-body-sm text-body-sm italic text-outline/50">
          Las fotos que borres no se destruyen: quedan guardadas en Supabase y se
          pueden recuperar desde el panel.
        </p>
      </div>

      <p className="mt-10 text-center font-label-caps text-label-caps uppercase tracking-wider text-outline/30">
        Nuestro Árbol · versión {APP_VERSION}
      </p>
    </main>
  );
}
