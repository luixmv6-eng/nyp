import type { MetadataRoute } from 'next';
import { getLogoVersion, logoPublicUrl } from '@/lib/logo';

// El manifest se regenera cada hora para recoger un logo nuevo.
export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const version = await getLogoVersion();

  const icons: MetadataRoute.Manifest['icons'] = version
    ? [
        { src: logoPublicUrl(192, version), sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: logoPublicUrl(512, version), sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: logoPublicUrl(512, version), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]
    : [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ];

  return {
    name: 'Nuestro Árbol',
    short_name: 'Nuestro Árbol',
    description: 'Nuestro álbum de recuerdos. Sólo para nosotros dos.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#14110f', // cuero negro
    theme_color: '#14110f',
    lang: 'es',
    dir: 'ltr',
    categories: ['photo', 'lifestyle'],
    icons,
  };
}
