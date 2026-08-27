'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Icon, { type IconName } from '@/components/Icon';
import { APP_VERSION } from '@/lib/version';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/arbol', label: 'El Árbol', icon: 'account_tree' },
  { href: '/galeria', label: 'Galería', icon: 'photo_library' },
  { href: '/subir', label: 'Añadir', icon: 'add_a_photo' },
];

const DRAWER_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: '/arbol', label: 'Nuestros Recuerdos', icon: 'book_2' },
  { href: '/galeria', label: 'El Álbum Completo', icon: 'photo_library' },
  { href: '/ajustes', label: 'Ajustes del Libro', icon: 'settings' },
];

export default function AppShell({
  children,
  logoUrl,
}: {
  children: React.ReactNode;
  logoUrl: string;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="leather-texture vignette-inset pb-bottom-nav relative min-h-[100dvh] w-full overflow-x-hidden">
      {/* ── Barra superior ─────────────────────────────────────────────── */}
      <header className="h-header px-edge-safe sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant/30 bg-leather-deep shadow-[0_10px_30px_-15px_rgba(61,43,31,0.6)]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="flex h-12 w-12 shrink-0 items-center justify-center text-on-surface-variant transition-colors hover:text-bronze-accent active:scale-95 active:opacity-80"
        >
          <Icon name="menu" weight={200} />
        </button>

        <Link href="/arbol" className="flex min-w-0 flex-1 justify-center px-2">
          {/* clamp: se encoge en pantallas estrechas antes que desbordar */}
          <h1
            className="truncate font-headline-md italic tracking-tight text-tarnished-brass"
            style={{ fontSize: 'clamp(1.125rem, 5.5vw, 1.75rem)', lineHeight: 1.3 }}
          >
            Nuestro Árbol
          </h1>
        </Link>

        <Link
          href="/ajustes"
          aria-label="Ajustes"
          className="flex h-12 w-12 shrink-0 items-center justify-center transition-colors active:scale-95 active:opacity-80"
        >
          <span className="polaroid-frame block h-9 w-9 overflow-hidden rounded-circle border border-outline-variant p-[2px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo"
              className="h-full w-full rounded-circle object-cover"
            />
          </span>
        </Link>
      </header>

      {children}

      {/* ── Cajón lateral ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.nav
              className="py-safe-6 fixed inset-y-0 left-0 z-[80] flex h-full w-80 max-w-[85vw] flex-col rounded-r-lg bg-surface-container px-6 shadow-2xl shadow-sepia-shadow"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="polaroid-frame h-12 w-12 overflow-hidden rounded-circle border-2 border-outline-variant p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="" className="h-full w-full rounded-circle object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Nuestro Árbol</h2>
                  <p className="truncate font-label-caps text-label-caps uppercase text-on-surface opacity-60">
                    Sólo nosotros dos
                  </p>
                </div>
              </div>

              <ul className="flex-grow space-y-2 border-t border-outline-variant/20 pt-6">
                {DRAWER_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-4 rounded-lg p-3 font-body-lg text-body-lg transition-all duration-300 ${
                          active
                            ? 'bg-surface-variant/10 font-bold text-tarnished-brass'
                            : 'text-on-surface opacity-80 hover:bg-primary-container/20'
                        }`}
                      >
                        <Icon name={link.icon} fill={active ? 1 : 0} />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-baseline justify-between gap-3 border-t border-outline-variant/20 pt-6">
                <p className="font-body-sm text-body-sm italic text-outline/40">
                  Nuestro álbum de recuerdos.
                </p>
                <span className="shrink-0 font-label-caps text-label-caps uppercase tracking-wider text-outline/30">
                  v{APP_VERSION}
                </span>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ── Navegación inferior ────────────────────────────────────────── */}
      <nav className="h-bottom-nav fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/20 bg-leather-deep px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex w-full max-w-md items-center justify-around">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex w-20 flex-col items-center justify-center transition-all duration-150 active:scale-90 ${
                  active
                    ? 'scale-110 text-secondary brightness-110'
                    : 'text-on-surface-variant opacity-60 hover:opacity-100'
                }`}
              >
                <Icon
                  name={tab.icon}
                  fill={active ? 1 : 0}
                  weight={active ? 400 : 300}
                  className={`mb-1 text-2xl ${active ? 'text-tarnished-brass drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : ''}`}
                />
                <span className="font-label-caps text-label-caps uppercase">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
