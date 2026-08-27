'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Icon, { type IconName } from '@/components/Icon';

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
    <div className="leather-texture vignette-inset relative min-h-[100dvh] w-full overflow-x-hidden pb-24">
      {/* ── Barra superior ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-leather-deep px-edge-wear-safe shadow-[0_10px_30px_-15px_rgba(61,43,31,0.6)]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="flex h-12 w-12 items-center justify-center text-on-surface-variant transition-colors hover:text-bronze-accent active:scale-95 active:opacity-80"
        >
          <Icon name="menu" weight={200} />
        </button>

        <Link href="/arbol" className="flex items-center gap-3">
          <h1 className="font-headline-md text-headline-md-mobile italic tracking-tight text-tarnished-brass md:text-headline-md">
            Nuestro Árbol
          </h1>
        </Link>

        <Link
          href="/ajustes"
          aria-label="Ajustes"
          className="flex h-12 w-12 items-center justify-center transition-colors active:scale-95 active:opacity-80"
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
              className="fixed inset-y-0 left-0 z-[80] flex h-full w-80 max-w-[85vw] flex-col rounded-r-lg bg-surface-container p-6 shadow-2xl shadow-sepia-shadow"
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

              <p className="border-t border-outline-variant/20 pt-6 font-body-sm text-body-sm italic text-outline/40">
                Nuestro álbum de recuerdos.
              </p>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ── Navegación inferior ────────────────────────────────────────── */}
      <nav className="fixed bottom-0 z-50 flex h-20 w-full items-center justify-around border-t border-outline-variant/20 bg-leather-deep px-4 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
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
