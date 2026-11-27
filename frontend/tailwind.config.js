/** @type {import('tailwindcss').Config} */
const sansStack = ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'];

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Single-point accent control: every `sky-*` utility in the app resolves to this institutional teal.
        sky: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#0f3d3a',
          950: '#042f2e',
        },
        neu: {
          light: '#f5f6f8',
          dark: '#0e1116',
          surfaceDark: '#161a21',
          blue: {
            DEFAULT: '#0f766e',
            50: '#f0fdfa',
            100: '#ccfbf1',
            400: '#2dd4bf',
            500: '#0d9488',
            600: '#0f766e',
            700: '#115e59',
            glow: 'rgba(45, 212, 191, 0.2)'
          }
        },
        navy: {
          800: '#1d222b',
          900: '#161a21',
          950: '#0e1116',
        }
      },
      fontFamily: {
        sans: sansStack,
        // `font-mono` is used widely for small labels/numbers: render it as clean tabular sans.
        // Use `font-code` only for IDs/tokens that genuinely benefit from monospace.
        mono: sansStack,
        code: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
      },
      spacing: {
        '22': '5.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out both',
        slideDown: 'slideDown 0.22s ease-out both',
        scaleUp: 'scaleUp 0.18s ease-out both',
      },
    },
  },
  plugins: [],
}
