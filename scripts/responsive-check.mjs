/**
 * Prueba de responsive con navegador real.
 *
 *   npm run responsive
 *
 * Abre cada pantalla en varios tamaños de dispositivo y comprueba que:
 *   · no haya desbordamiento horizontal (nada cortado a los lados),
 *   · ningún elemento se salga del ancho del viewport,
 *   · nada quede tapado por la isla dinámica / barra de estado.
 *
 * Además guarda una captura de cada combinación en scripts/screenshots/.
 */
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3130';
const OUT = join(process.cwd(), 'scripts', 'screenshots');

// Los insets simulan el recorte real del dispositivo (isla dinámica, barra
// de gestos). Playwright no los aplica solo, así que se inyectan por CSS.
const DEVICES = [
  { name: 'iphone-se', w: 375, h: 667, dpr: 2, mobile: true, top: 20, bottom: 0 },
  { name: 'iphone-16-pro', w: 402, h: 874, dpr: 3, mobile: true, top: 59, bottom: 34 },
  { name: 'iphone-16-pro-landscape', w: 874, h: 402, dpr: 3, mobile: true, top: 0, bottom: 21 },
  { name: 'pixel-7', w: 412, h: 915, dpr: 2.6, mobile: true, top: 24, bottom: 24 },
  { name: 'estrecho-320', w: 320, h: 568, dpr: 2, mobile: true, top: 20, bottom: 0 },
  { name: 'ipad', w: 820, h: 1180, dpr: 2, mobile: false, top: 24, bottom: 20 },
  { name: 'escritorio', w: 1440, h: 900, dpr: 1, mobile: false, top: 0, bottom: 0 },
];

const PAGES = [
  { name: 'arbol', path: '/arbol' },
  { name: 'galeria', path: '/galeria' },
  { name: 'subir', path: '/subir' },
  { name: 'ajustes', path: '/ajustes' },
];

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => {
  console.log(`  \x1b[31m✗\x1b[0m ${m}`);
  problems++;
};

let problems = 0;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

console.log('\n\x1b[1mNuestro Árbol — prueba de responsive\x1b[0m');

for (const device of DEVICES) {
  console.log(`\n\x1b[1m${device.name}\x1b[0m (${device.w}×${device.h})`);

  const context = await browser.newContext({
    viewport: { width: device.w, height: device.h },
    deviceScaleFactor: device.dpr,
    isMobile: device.mobile,
    hasTouch: device.mobile,
  });

  // Simula las áreas seguras del dispositivo: env() no existe en Chromium
  // headless, así que se sustituyen las utilidades por valores reales.
  await context.addInitScript(
    ({ top, bottom }) => {
      try { sessionStorage.setItem('arbol:intro', '1'); } catch {}
      const style = document.createElement('style');
      style.textContent = `
        .pt-safe { padding-top: ${top}px !important; }
        .pt-safe-4 { padding-top: calc(1rem + ${top}px) !important; }
        .py-safe-6 { padding-top: calc(1.5rem + ${top}px) !important; padding-bottom: calc(1.5rem + ${bottom}px) !important; }
        .pb-safe { padding-bottom: ${bottom}px !important; }
        .h-header { height: calc(4rem + ${top}px) !important; padding-top: ${top}px !important; }
        .h-bottom-nav { height: calc(5rem + ${bottom}px) !important; padding-bottom: ${bottom}px !important; }
        .pb-bottom-nav { padding-bottom: ${104 + bottom}px !important; }
        .bottom-fab { bottom: ${104 + bottom}px !important; }
      `;
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    },
    { top: device.top, bottom: device.bottom }
  );

  const page = await context.newPage();

  for (const target of PAGES) {
    // La intro ya se marca como vista en el initScript, así que no hace falta
    // recargar: se mide directamente la interfaz asentada.
    const response = await page.goto(`${BASE}${target.path}`, { waitUntil: 'load' });
    await page.waitForTimeout(1800); // el aviso del logo aparece a los 900ms

    if (!response || response.status() >= 400) {
      bad(`${target.name}: el servidor devolvió ${response ? response.status() : 'sin respuesta'}`);
      continue;
    }

    const report = await page.evaluate((topInset) => {
      const vw = document.documentElement.clientWidth;
      const overflowing = [];

      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        // 1px de tolerancia por redondeos de subpíxel.
        if (r.right > vw + 1 || r.left < -1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() ?? '').slice(0, 60),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }

      // Recorte: un elemento puede salirse de su contenedor y quedar cortado
      // sin provocar scroll, porque un ancestro tiene overflow hidden. Eso no
      // lo ve la comprobación de arriba, así que se busca aparte.
      const clipped = [];
      const clippers = [];
      for (const el of document.querySelectorAll('body *')) {
        const s = getComputedStyle(el);
        if (s.overflowX === 'hidden' || s.overflowX === 'clip' || s.overflow === 'hidden') {
          clippers.push({ el, rect: el.getBoundingClientRect() });
        }
      }
      for (const el of document.querySelectorAll('.polaroid, .polaroid-frame, .paper-texture')) {
        const r = el.getBoundingClientRect();
        for (const c of clippers) {
          if (c.el === el || !c.el.contains(el)) continue;
          if (r.right > c.rect.right + 1 || r.left < c.rect.left - 1) {
            clipped.push({
              cls: (el.className?.toString?.() ?? '').slice(0, 40),
              by: (c.el.className?.toString?.() ?? '').slice(0, 40),
              over: Math.round(Math.max(r.right - c.rect.right, c.rect.left - r.left)),
            });
            break;
          }
        }
      }

      // ¿Los elementos fijos están realmente pegados a la ventana? Si un
      // ancestro tiene transform/filter/will-change deja de ser así y la barra
      // inferior se va a mitad de la página.
      const bottomNav = document.querySelector('nav.h-bottom-nav');
      const navBottom = bottomNav ? Math.round(bottomNav.getBoundingClientRect().bottom) : null;

      // ¿El título de la cabecera queda por debajo de la isla dinámica?
      const title = document.querySelector('header h1');
      const titleTop = title ? Math.round(title.getBoundingClientRect().top) : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: vw,
        overflowing: overflowing.slice(0, 5),
        overflowCount: overflowing.length,
        clipped: clipped.slice(0, 4),
        clippedCount: clipped.length,
        navBottom,
        viewportH: window.innerHeight,
        titleTop,
        topInset,
      };
    }, device.top);

    const label = `${target.name}`;

    if (report.scrollWidth > report.clientWidth + 1) {
      bad(`${label}: scroll horizontal (${report.scrollWidth} > ${report.clientWidth})`);
    } else if (report.overflowCount > 0) {
      bad(`${label}: ${report.overflowCount} elemento(s) fuera del viewport`);
      for (const o of report.overflowing) {
        console.log(`      <${o.tag} class="${o.cls}"> left=${o.left} right=${o.right}`);
      }
    } else if (report.clippedCount > 0) {
      bad(`${label}: ${report.clippedCount} foto(s) recortada(s) por un contenedor`);
      for (const c of report.clipped) {
        console.log(`      .${c.cls} se sale ${c.over}px de .${c.by}`);
      }
    } else if (report.navBottom !== null && Math.abs(report.navBottom - report.viewportH) > 2) {
      bad(`${label}: la barra inferior no está pegada a la ventana (bottom=${report.navBottom}, alto=${report.viewportH})`);
    } else if (report.titleTop !== null && report.titleTop < device.top) {
      bad(`${label}: el título queda bajo la isla (top=${report.titleTop} < ${device.top})`);
    } else {
      ok(`${label}${report.titleTop !== null ? ` — título a ${report.titleTop}px` : ''}`);
    }

    await page.screenshot({
      path: join(OUT, `${device.name}--${target.name}.png`),
      fullPage: false,
    });
  }

  await context.close();
}

await browser.close();

console.log('');
if (problems === 0) {
  console.log(`\x1b[32m\x1b[1mSin recortes ni desbordamientos.\x1b[0m Capturas en scripts/screenshots/\n`);
} else {
  console.log(`\x1b[31m\x1b[1m${problems} problema(s).\x1b[0m Capturas en scripts/screenshots/\n`);
  process.exit(1);
}
