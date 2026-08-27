import { stableRotation } from '@/lib/utils';
import PhotoImage from '@/components/PhotoImage';

/**
 * Foto impresa: marco crema, sombra proyectada, ligera rotación estable
 * y el tratamiento sepia del diseño.
 */
export default function Polaroid({
  src,
  caption,
  seed,
  aspect = 'aspect-[4/3]',
  maxRotation = 4,
  brackets = 'none',
  priority = false,
  className = '',
}: {
  src: string;
  caption?: string | null;
  seed: string;
  aspect?: string;
  maxRotation?: number;
  brackets?: 'none' | 'diagonal' | 'all';
  priority?: boolean;
  className?: string;
}) {
  const rotation = stableRotation(seed, maxRotation);

  return (
    <div
      className={`polaroid relative px-4 pb-12 pt-4 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {brackets !== 'none' && (
        <>
          <span className="corner-bracket corner-tl" />
          <span className="corner-bracket corner-br" />
          {brackets === 'all' && (
            <>
              <span className="corner-bracket corner-tr" />
              <span className="corner-bracket corner-bl" />
            </>
          )}
        </>
      )}

      <div className={`polaroid-img-container ${aspect}`}>
        <PhotoImage
          src={src}
          alt={caption ?? 'Recuerdo'}
          priority={priority}
          className="photo-vintage h-full w-full object-cover"
        />
      </div>

      {caption ? (
        <p className="polaroid-caption mt-4 font-body-md text-body-md">{caption}</p>
      ) : (
        <p className="polaroid-caption mt-4 font-body-md text-body-md opacity-40">·</p>
      )}
    </div>
  );
}
