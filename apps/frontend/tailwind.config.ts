import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // =============================================
      //  LFTG Design System — Biodiversité Guyane
      // =============================================
      colors: {
        // Primary: Forêt tropicale
        forest: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Secondary: Terre rouge / latérite
        laterite: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Accent: Eau / Maroni
        maroni: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent: Or / Orpaillage
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Neutral: Bois / Terre
        wood: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Semantic aliases
        primary: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#ea580c',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#f59e0b',
          foreground: '#1c1917',
        },
        background: '#fafaf9',
        foreground: '#1c1917',
        muted: {
          DEFAULT: '#f5f5f4',
          foreground: '#78716c',
        },
        border: '#e7e5e4',
        ring: '#16a34a',
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1c1917',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        'lftg': '0 4px 24px 0 rgba(22, 163, 74, 0.12)',
        'lftg-lg': '0 8px 40px 0 rgba(22, 163, 74, 0.18)',
      },
      backgroundImage: {
        'jungle-gradient': 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #f97316 100%)',
        'river-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #60a5fa 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
