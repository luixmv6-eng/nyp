import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="leather-texture vignette-inset flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <h1 className="font-display-lg-mobile text-display-lg-mobile italic text-tarnished-brass">
        Esta página no está
      </h1>
      <p className="mt-4 max-w-xs font-body-md text-body-md italic text-tertiary opacity-80">
        Puede que el recuerdo se haya arrancado del álbum.
      </p>
      <Link
        href="/arbol"
        className="bronze-button mt-10 rounded-sm px-8 py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
      >
        Volver al árbol
      </Link>
    </main>
  );
}
