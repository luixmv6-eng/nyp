import Link from 'next/link';
import Polaroid from '@/components/Polaroid';
import Icon from '@/components/Icon';
import { listPhotos } from '@/lib/photos';
import { formatLongDate, yearOf } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Galería · Nuestro Árbol' };

export default async function GaleriaPage() {
  const photos = await listPhotos();

  // Un "capítulo" del álbum por año, del más reciente al más antiguo.
  const chapters = new Map<string, typeof photos>();
  for (const photo of photos) {
    const year = yearOf(photo.photo_date);
    if (!chapters.has(year)) chapters.set(year, []);
    chapters.get(year)!.push(photo);
  }

  return (
    <>
      <div className="vignette-overlay" />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-8 pt-8 md:px-page-margin">
        <div className="paper-layer relative min-h-[60vh] rounded-sm p-6 md:p-12">
          {photos.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <Icon name="photo_library" className="text-5xl text-outline opacity-30" weight={200} />
              <h2 className="mt-6 font-headline-sm text-headline-sm text-aged-parchment">
                El álbum está en blanco
              </h2>
              <p className="mt-3 max-w-xs font-body-md text-body-md italic text-tertiary opacity-80">
                Todavía no hay páginas escritas. Empieza por la primera.
              </p>
              <Link
                href="/subir"
                className="bronze-button mt-8 flex items-center gap-2 rounded-sm px-8 py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
              >
                <Icon name="add_a_photo" weight={300} />
                Subir un recuerdo
              </Link>
            </div>
          ) : (
            [...chapters.entries()].map(([year, chapterPhotos], chapterIndex) => (
              <section key={year} className={chapterIndex === 0 ? '' : 'mt-24'}>
                <header className="relative z-20 mb-12 text-center">
                  <h2 className="mb-4 font-headline-md text-headline-md text-aged-parchment drop-shadow-lg">
                    {year}
                  </h2>
                  <div className="mx-auto h-px w-32 bg-tarnished-brass opacity-70" />
                  <p className="mt-4 font-body-lg text-body-lg italic text-tertiary opacity-90">
                    {chapterPhotos.length}{' '}
                    {chapterPhotos.length === 1 ? 'recuerdo guardado' : 'recuerdos guardados'}
                  </p>
                </header>

                <div className="relative z-20 grid grid-cols-1 gap-12 sm:grid-cols-2 md:gap-16 lg:grid-cols-3">
                  {chapterPhotos.map((photo, index) => (
                    <Link
                      key={photo.id}
                      href={`/foto/${photo.id}`}
                      className="block transition-transform duration-300 hover:z-30 hover:scale-105 active:scale-95"
                    >
                      <Polaroid
                        src={photo.thumbUrl}
                        seed={photo.id}
                        caption={photo.caption?.trim() || formatLongDate(photo.photo_date)}
                        brackets={index % 3 === 0 ? 'diagonal' : 'none'}
                        maxRotation={5}
                        priority={chapterIndex === 0 && index < 3}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </>
  );
}
