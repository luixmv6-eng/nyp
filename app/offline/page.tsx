export const metadata = { title: 'Sin conexión · Nuestro Árbol' };

export default function OfflinePage() {
  return (
    <main className="leather-texture vignette-inset flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
      <h1 className="mt-8 font-headline-md text-headline-md italic text-tarnished-brass">
        El álbum está cerrado
      </h1>
      <p className="mt-4 max-w-xs font-body-md text-body-md italic text-tertiary opacity-80">
        No hay conexión ahora mismo. Vuelve a intentarlo cuando la tengas.
      </p>
      <div className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
    </main>
  );
}
