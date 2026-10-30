/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neu: {
          light: '#e6edf8',
          dark: '#0c1427',
          surfaceDark: '#0c1427',
          blue: {
            DEFAULT: '#0284c7',
            50: '#f0f9ff',
            100: '#e0f2fe',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            glow: 'rgba(56, 189, 248, 0.25)'
          }
        },
        navy: {
          800: '#111b33',
          900: '#0c1427',
          950: '#060a14',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      }
    },
  },
  plugins: [],
}
