'use client';

/**
 * Procesado de imágenes en el navegador, antes de subirlas.
 * Evita mandar 12 MB desde el móvil por datos y nos deja generar los
 * tamaños exactos que pide una PWA para sus íconos.
 */

async function loadBitmap(file: File | Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC y algunos formatos raros: caemos al <img> de toda la vida */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = url;
    });
  } finally {
    // Se revoca en el siguiente tick para que el navegador alcance a decodificar.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
      type,
      quality
    );
  });
}

/** Formatos que cualquier navegador sabe pintar. HEIC/HEIF no está: sólo Safari. */
const WEB_SAFE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/** Reescala un bitmap a JPEG dentro de un canvas. */
async function toJpeg(
  bitmap: ImageBitmap | HTMLImageElement,
  maxSide: number,
  quality: number
): Promise<Blob> {
  const width = 'width' in bitmap ? bitmap.width : 0;
  const height = 'height' in bitmap ? bitmap.height : 0;
  if (!width || !height) throw new Error('La imagen no tiene dimensiones legibles');

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no pudo procesar la imagen');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, canvas.width, canvas.height);

  return canvasToBlob(canvas, 'image/jpeg', quality);
}

/**
 * Prepara la foto para subirla: la reescala y la pasa a JPEG.
 *
 * Devuelve también una miniatura. Es lo que hace que el árbol y la galería
 * carguen rápido: ahí las fotos se ven a ~200px, no tiene sentido bajar la de
 * 2000px sólo para encogerla.
 *
 * Si el navegador no puede convertir la imagen (típico con HEIC del iPhone
 * fuera de Safari), lanza un error en vez de subir un archivo que luego no se
 * vería. Antes se subía igual y la foto aparecía rota.
 */
export async function prepareUpload(
  file: File,
  maxSide = 2000,
  quality = 0.85
): Promise<{ full: Blob; thumb: Blob | null; contentType: string; extension: string }> {
  let bitmap: ImageBitmap | HTMLImageElement | null = null;

  try {
    bitmap = await loadBitmap(file);
    const full = await toJpeg(bitmap, maxSide, quality);

    // La miniatura se genera del mismo bitmap: no se decodifica dos veces.
    let thumb: Blob | null = null;
    try {
      thumb = await toJpeg(bitmap, 640, 0.7);
    } catch {
      // Sin miniatura la app sigue funcionando: usa la grande.
    }

    return { full, thumb, contentType: 'image/jpeg', extension: 'jpg' };
  } catch (err) {
    // No se pudo convertir. Si el formato original es visible en la web, se
    // sube tal cual; si no (HEIC), mejor avisar que subir algo roto.
    const type = (file.type || '').toLowerCase();

    if (WEB_SAFE.includes(type)) {
      return {
        full: file,
        thumb: null,
        contentType: type,
        extension: type.split('/')[1].replace('jpeg', 'jpg'),
      };
    }

    if (type.includes('heic') || type.includes('heif')) {
      throw new Error(
        'Esa foto está en formato HEIC y este navegador no puede convertirla. ' +
          'En el iPhone: Ajustes → Cámara → Formatos → "Más compatible", o ' +
          'compártela primero por WhatsApp y sube esa copia.'
      );
    }

    throw new Error(
      err instanceof Error && err.message
        ? err.message
        : 'No se pudo leer esa imagen. Prueba con otra.'
    );
  } finally {
    if (bitmap && 'close' in bitmap) bitmap.close();
  }
}

/**
 * Genera el logo recortado en cuadrado, en los tamaños que necesita la PWA.
 * El fondo se rellena con el cuero negro del diseño por si la imagen tiene
 * transparencias o no es cuadrada.
 */
export async function makeSquareIcon(file: File, size: number): Promise<Blob> {
  const bitmap = await loadBitmap(file);
  const width = 'width' in bitmap ? bitmap.width : 0;
  const height = 'height' in bitmap ? bitmap.height : 0;
  if (!width || !height) throw new Error('No se pudo leer la imagen');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');

  ctx.fillStyle = '#14110f'; // cuero negro
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = 'high';

  // Recorte centrado tipo object-fit: cover
  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;
  ctx.drawImage(bitmap as CanvasImageSource, sx, sy, side, side, 0, 0, size, size);

  if ('close' in bitmap) bitmap.close();
  return canvasToBlob(canvas, 'image/png');
}
