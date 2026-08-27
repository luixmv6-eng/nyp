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

/**
 * Reduce la foto para que su lado mayor no pase de `maxSide` y la convierte
 * a JPEG. Si el navegador no puede procesarla, devuelve el archivo original.
 */
export async function prepareUpload(
  file: File,
  maxSide = 2200,
  quality = 0.88
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  try {
    const bitmap = await loadBitmap(file);
    const width = 'width' in bitmap ? bitmap.width : 0;
    const height = 'height' in bitmap ? bitmap.height : 0;
    if (!width || !height) throw new Error('sin dimensiones');

    const scale = Math.min(1, maxSide / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('sin canvas');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, targetW, targetH);

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if ('close' in bitmap) bitmap.close();

    // Si el "procesado" salió más pesado que el original, nos quedamos el original.
    if (blob.size >= file.size && scale === 1) {
      return { blob: file, contentType: file.type || 'image/jpeg', extension: 'jpg' };
    }
    return { blob, contentType: 'image/jpeg', extension: 'jpg' };
  } catch {
    return { blob: file, contentType: file.type || 'image/jpeg', extension: 'jpg' };
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
