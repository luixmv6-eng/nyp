import { checkEnv } from '@/lib/env';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Falta configurar · Nuestro Árbol' };

/**
 * Pantalla de configuración pendiente. Aparece cuando faltan variables de
 * entorno, en lugar de dejar que la app reviente con un 500.
 */
export default function SetupPage() {
  const { missing } = checkEnv();

  // En Vercel las instrucciones son otras: no hay .env.local que crear, y
  // hace falta volver a desplegar para que el build recoja las variables.
  const onVercel = Boolean(process.env.VERCEL);

  const steps: { variable: string; where: string }[] = [
    {
      variable: 'NEXT_PUBLIC_SUPABASE_URL',
      where: 'Supabase → Project Settings → Data API → Project URL',
    },
    {
      variable: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      where: 'Supabase → Project Settings → API Keys → anon public',
    },
  ];

  return (
    <main className="leather-texture vignette-inset flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="paper-texture relative p-8 shadow-[2px_4px_24px_rgba(0,0,0,0.9)]">
          <span className="gold-bracket bracket-tl" />
          <span className="gold-bracket bracket-tr" />
          <span className="gold-bracket bracket-bl" />
          <span className="gold-bracket bracket-br" />

          <h1 className="text-center font-headline-md text-headline-md-mobile text-dried-ink">
            Falta configurar el álbum
          </h1>
          <div className="mx-auto my-5 h-px w-24 bg-tarnished-brass opacity-60" />
          <p className="text-center font-body-md text-body-md italic text-dried-ink opacity-75">
            {onVercel ? (
              <>
                Añádelas en <span className="not-italic">Vercel → Settings → Environment
                Variables</span> y vuelve a desplegar.
              </>
            ) : (
              <>
                Crea el archivo <code className="not-italic">.env.local</code> en la raíz del
                proyecto y vuelve a arrancar <code className="not-italic">npm run dev</code>.
              </>
            )}
          </p>

          <ul className="mt-8 space-y-5">
            {steps.map((step) => {
              const isMissing = missing.includes(step.variable);
              return (
                <li key={step.variable} className="flex items-start gap-3">
                  <Icon
                    name={isMissing ? 'close' : 'check'}
                    weight={400}
                    className={`mt-1 text-lg ${isMissing ? 'text-error-container' : 'text-tarnished-brass'}`}
                  />
                  <div className="min-w-0">
                    <p className="break-all font-label-caps text-label-caps uppercase tracking-wider text-dried-ink">
                      {step.variable}
                    </p>
                    <p className="mt-1 font-body-sm text-body-sm italic text-dried-ink opacity-60">
                      {step.where}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 border-t border-dried-ink/20 pt-6">
            {onVercel ? (
              <>
                <p className="font-label-caps text-label-caps uppercase tracking-wider text-dried-ink opacity-60">
                  Importante
                </p>
                <p className="mt-3 font-body-sm text-body-sm italic text-dried-ink opacity-70">
                  Estas variables se incrustan durante el build, no se leen al
                  arrancar. Si ya las añadiste y sigues viendo esta pantalla, es
                  que falta volver a desplegar:
                </p>
                <p className="mt-3 font-body-sm text-body-sm text-dried-ink opacity-80">
                  Deployments → el último → ⋯ → <strong>Redeploy</strong>,
                  desmarcando <em>Use existing Build Cache</em>.
                </p>
              </>
            ) : (
              <>
                <p className="font-label-caps text-label-caps uppercase tracking-wider text-dried-ink opacity-60">
                  Atajo
                </p>
                <pre className="mt-3 overflow-x-auto bg-dried-ink/10 p-3 font-body-sm text-body-sm text-dried-ink">
                  <code>cp .env.example .env.local</code>
                </pre>
                <p className="mt-3 font-body-sm text-body-sm italic text-dried-ink opacity-60">
                  Los pasos completos están en el{' '}
                  <code className="not-italic">README.md</code>.
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center font-label-caps text-label-caps uppercase text-outline/40">
          Nuestro Árbol
        </p>
      </div>
    </main>
  );
}
