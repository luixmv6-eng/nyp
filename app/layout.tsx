import type { Metadata, Viewport } from 'next';
import { Libre_Caslon_Text, EB_Garamond } from 'next/font/google';
import './globals.css';
import { getLogoVersion, logoPublicUrl } from '@/lib/logo';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-caslon',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-garamond',
});

export const viewport: Viewport = {
  themeColor: '#14110f', // cuero negro
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

/**
 * Los íconos son dinámicos: si hay un logo subido a Supabase se usa ese,
 * si no, el que viene con la app.
 */
export async function generateMetadata(): Promise<Metadata> {
  const version = await getLogoVersion();

  return {
    title: 'Nuestro Árbol',
    description: 'Nuestro álbum de recuerdos. Sólo para nosotros dos.',
    applicationName: 'Nuestro Árbol',
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Nuestro Árbol',
    },
    formatDetection: { telephone: false },
    // La privacidad del álbum depende de que la URL no circule, así que:
    //  · noindex/nofollow  → los buscadores no la listan
    //  · no-referrer       → la dirección no viaja a terceros (Google Fonts,
    //                        enlaces salientes) en la cabecera Referer
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
    icons: {
      icon: [
        { url: logoPublicUrl(192, version), sizes: '192x192', type: 'image/png' },
        { url: version ? logoPublicUrl(192, version) : '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: logoPublicUrl(180, version), sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${caslon.variable} ${garamond.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Material Symbols Outlined: la familia de íconos del diseño de Stitch */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body-md text-body-md bg-leather-deep text-on-background">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
