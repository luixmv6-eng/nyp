import type { Config } from 'tailwindcss';

/**
 * Paleta y escala tipográfica exportadas 1:1 desde el proyecto de Google Stitch
 * "Nuestro Árbol Vintage Album" (projects/17520147251409572297).
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Cuero / superficies oscuras ---
        'leather-deep': '#14110f',
        'surface': '#141313',
        'background': '#141313',
        'surface-dim': '#141313',
        'surface-container-lowest': '#0f0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2b2a29',
        'surface-container-highest': '#363434',
        'surface-bright': '#3a3938',
        'surface-variant': '#363434',
        'dried-ink': '#2b2622',
        'sepia-shadow': '#3d2b1f',

        // --- Metales envejecidos ---
        'tarnished-brass': '#7a623e',
        'bronze-accent': '#b88a44',
        'antique-gold': '#d4af37',
        'gold-light': '#f3e5ab',
        'gold-dark': '#8a6327',

        // --- Papel / crema ---
        'aged-parchment': '#e8dfcc',
        'tertiary-fixed': '#ebe2cf',
        'tertiary-fixed-dim': '#cec6b3',
        'paper-edge': '#d8cfbd',

        // --- Sistema (Material tokens del diseño) ---
        'primary': '#ccc5c1',
        'primary-fixed': '#e9e1dd',
        'primary-fixed-dim': '#ccc5c1',
        'primary-container': '#14110f',
        'on-primary': '#34302d',
        'on-primary-container': '#827c79',
        'inverse-primary': '#625d5a',
        'secondary': '#e1c297',
        'secondary-fixed': '#fedeb1',
        'secondary-fixed-dim': '#e1c297',
        'secondary-container': '#5b4524',
        'on-secondary': '#402d0e',
        'on-secondary-container': '#d2b48a',
        'tertiary': '#cec6b3',
        'tertiary-container': '#151107',
        'on-tertiary': '#353023',
        'on-tertiary-container': '#837c6c',
        'on-surface': '#e6e1e0',
        'on-surface-variant': '#d0c4be',
        'on-background': '#e6e1e0',
        'inverse-surface': '#e6e1e0',
        'inverse-on-surface': '#313030',
        'outline': '#998f89',
        'outline-variant': '#4d4540',
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
        circle: '9999px',
      },
      spacing: {
        'edge-wear-safe': '1rem',
        'page-margin': '3rem',
        'item-overlap': '-0.75rem',
        'gutter-md': '1.5rem',
        'photo-gutter': '1rem',
        unit: '4px',
      },
      fontFamily: {
        // Libre Caslon Text es la serif clásica de todo el álbum
        'headline-md': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'headline-sm': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'display-lg': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'display-lg-mobile': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'body-lg': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'body-md': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'body-sm': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'label-italic': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        'label-caps': ['var(--font-caslon)', 'Libre Caslon Text', 'serif'],
        // EB Garamond para la portada del álbum (splash)
        cover: ['var(--font-garamond)', 'EB Garamond', 'serif'],
      },
      fontSize: {
        'display-lg': ['44px', { lineHeight: '52px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-md-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-italic': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.12em', fontWeight: '600' }],
      },
      keyframes: {
        'pulse-gold': {
          '0%': { transform: 'scale(0.95)', opacity: '0.5', boxShadow: '0 0 0 0 rgba(212,175,55,0.7)' },
          '50%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 10px rgba(212,175,55,0)' },
          '100%': { transform: 'scale(0.95)', opacity: '0.5', boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
