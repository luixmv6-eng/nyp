/**
 * Genera los íconos por defecto de la PWA a partir de public/icons/logo.png
 * (la etiqueta "Nyp" del diseño de Stitch).
 *
 *   npm run icons
 *
 * Sólo hace falta si cambias el logo por defecto del repo. El logo que subas
 * desde la app se procesa en el navegador y se guarda en Supabase Storage.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'public', 'icons');
const source = join(iconsDir, 'logo.png');

// Cuero negro del diseño, para rellenar si el logo no es cuadrado.
const LEATHER = { r: 0x14, g: 0x11, b: 0x0f, alpha: 1 };

await mkdir(iconsDir, { recursive: true });

for (const size of [180, 192, 512]) {
  await sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .flatten({ background: LEATHER })
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Ícono "maskable": el logo dentro del área segura (80%) sobre cuero.
const inner = Math.round(512 * 0.8);
await sharp({
  create: { width: 512, height: 512, channels: 4, background: LEATHER },
})
  .composite([
    {
      input: await sharp(source).resize(inner, inner, { fit: 'cover' }).png().toBuffer(),
      gravity: 'centre',
    },
  ])
  .png()
  .toFile(join(iconsDir, 'icon-maskable-512.png'));
console.log('✓ icon-maskable-512.png');

// Favicon
await sharp(source).resize(32, 32, { fit: 'cover' }).png().toFile(join(iconsDir, 'favicon-32.png'));
console.log('✓ favicon-32.png');
