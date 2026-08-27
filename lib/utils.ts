/**
 * Rotación "aleatoria" pero estable: la misma foto siempre se inclina igual,
 * en servidor y en cliente (si fuera Math.random habría hydration mismatch).
 */
export function stableRotation(seed: string, maxDegrees = 5): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0..1
  return Number((normalized * maxDegrees * 2 - maxDegrees).toFixed(2));
}

/** Variación estable dentro de un rango, útil para desplazamientos del árbol. */
export function stableRange(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i) * 31;
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 997) / 997;
  return min + normalized * (max - min);
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** "14 de Octubre, 2023" — el formato exacto del diseño de Stitch. */
export function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${d} de ${MESES[m - 1]}, ${y}`;
}

/** Sólo el año, para las etiquetas pequeñas del árbol. */
export function yearOf(isoDate: string): string {
  return isoDate.split('-')[0] ?? '';
}

/** Fecha de hoy en YYYY-MM-DD según la zona horaria local del dispositivo. */
export function todayLocalISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Extensión segura a partir del tipo MIME del archivo. */
export function extensionFor(file: File): string {
  const fromType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/avif': 'avif',
  };
  if (fromType[file.type]) return fromType[file.type];
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext && /^[a-z0-9]{2,5}$/.test(ext) ? ext : 'jpg';
}
