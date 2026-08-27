import Link from 'next/link';
import type { PhotoWithUrl } from '@/lib/photos';
import { stableRotation, yearOf } from '@/lib/utils';
import Icon from '@/components/Icon';
import PhotoImage from '@/components/PhotoImage';

/**
 * El árbol de recuerdos: un tronco de latón que sube por el centro y ramas
 * que salen alternando lado, cada una sosteniendo una foto impresa.
 *
 * Las fotos van de la más antigua (abajo, las raíces) a la más reciente
 * (arriba, la copa), igual que crece un árbol.
 */
export default function TreeView({ photos }: { photos: PhotoWithUrl[] }) {
  // Llegan de la más nueva a la más vieja; el árbol crece al revés.
  const chronological = [...photos].reverse();

  if (chronological.length === 0) {
    return <EmptyTree />;
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4 pb-12 pt-10">
      {/* Copa: las ramas más finas se pierden hacia arriba */}
      <svg
        className="mx-auto block h-24 w-full max-w-md"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,100 C100,70 100,40 100,10" strokeWidth={2} />
        <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,70 C80,55 60,40 40,20" />
        <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,60 C120,48 145,32 168,14" />
        <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,45 C90,30 88,20 92,4" strokeWidth={1} />
        <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,40 C112,28 118,18 116,2" strokeWidth={1} />
      </svg>

      <ol className="relative">
        {/* Tronco */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-gradient-to-b from-tarnished-brass via-tarnished-brass to-tarnished-brass/40 shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        />

        {chronological.map((photo, index) => {
          const onLeft = index % 2 === 0;
          const nudge = stableRotation(photo.id + 'y', 8); // -8..8 px de desorden

          return (
            <li
              key={photo.id}
              className={`relative flex min-h-[240px] items-center ${onLeft ? 'justify-start' : 'justify-end'}`}
              style={{ marginTop: index === 0 ? 0 : `${nudge}px` }}
            >
              {/* Rama que conecta el tronco con la foto */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="tree-line"
                  vectorEffect="non-scaling-stroke"
                  d={
                    onLeft
                      ? 'M50,100 C50,74 34,70 26,50'
                      : 'M50,100 C50,74 66,70 74,50'
                  }
                />
              </svg>

              {/* Nudo de latón donde nace la rama */}
              <span
                aria-hidden="true"
                className="metallic-hardware absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-circle opacity-80"
              />

              <Link
                href={`/foto/${photo.id}`}
                className="relative z-10 block w-[46%] min-w-[112px] max-w-[220px] transition-transform duration-300 hover:z-20 hover:scale-105 active:scale-95"
              >
                <Polaroidish
                  src={photo.thumbUrl}
                  seed={photo.id}
                  label={photo.caption?.trim() || yearOf(photo.photo_date)}
                  priority={index >= chronological.length - 3}
                />
              </Link>
            </li>
          );
        })}

        {/* Raíces */}
        <li className="relative flex h-24 items-start justify-center">
          <svg
            className="h-24 w-full max-w-md"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,0 C100,30 100,60 100,90" strokeWidth={3} />
            <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,55 C82,70 66,80 46,92" />
            <path className="tree-line" vectorEffect="non-scaling-stroke" d="M100,55 C118,70 136,80 156,92" />
          </svg>
        </li>
      </ol>
    </div>
  );
}

/** Variante compacta de la foto impresa, con la etiqueta en cursiva del diseño. */
function Polaroidish({
  src,
  seed,
  label,
  priority = false,
}: {
  src: string;
  seed: string;
  label: string;
  priority?: boolean;
}) {
  const rotation = stableRotation(seed, 4);
  return (
    <div
      className="polaroid-frame flex flex-col items-center p-3 pb-8"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="polaroid-img-container aspect-square w-full">
        <PhotoImage
          src={src}
          alt={label}
          priority={priority}
          className="h-full w-full object-cover"
          style={{ filter: 'sepia(0.5) contrast(1.2) brightness(0.9)' }}
        />
      </div>
      <span className="mt-4 line-clamp-2 px-1 text-center font-label-italic text-label-italic italic text-dried-ink opacity-90">
        {label}
      </span>
    </div>
  );
}

function EmptyTree() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <svg className="h-32 w-48 opacity-60" viewBox="0 0 200 120" aria-hidden="true">
        <path className="tree-line" d="M100,120 C100,90 100,70 100,50" strokeWidth={3} />
        <path className="tree-line" d="M100,80 C78,66 58,50 38,32" />
        <path className="tree-line" d="M100,72 C122,58 146,42 168,24" />
        <path className="tree-line" d="M100,55 C92,38 90,24 96,8" strokeWidth={1.5} />
      </svg>
      <h2 className="mt-8 font-headline-sm text-headline-sm text-aged-parchment">
        El árbol todavía está desnudo
      </h2>
      <p className="mt-3 max-w-xs font-body-md text-body-md italic text-tertiary opacity-80">
        Cuelga el primer recuerdo y empezará a crecer.
      </p>
      <Link
        href="/subir"
        className="bronze-button mt-8 flex items-center gap-2 rounded-sm px-8 py-3 font-headline-sm text-headline-sm text-aged-parchment active:scale-95"
      >
        <Icon name="add_a_photo" weight={300} />
        Subir el primero
      </Link>
    </div>
  );
}
