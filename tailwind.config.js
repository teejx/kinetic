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
        background: '#090a0f',
        surface: {
          DEFAULT: '#12141c',
          raised: '#181b26',
          border: '#242938',
          subtle: '#2a3042',
        },
        volt: {
          DEFAULT: '#d4ff00',
          hover: '#c0ea00',
          muted: 'rgba(212, 255, 0, 0.12)',
          glow: 'rgba(212, 255, 0, 0.25)',
        },
        flame: {
          DEFAULT: '#ff5722',
          muted: 'rgba(255, 87, 34, 0.14)',
        },
        azure: {
          DEFAULT: '#38bdf8',
          muted: 'rgba(56, 189, 248, 0.14)',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
        display: ['Cabinet Grotesk', 'Outfit', 'Geist', 'sans-serif'],
      },
      boxShadow: {
        'volt-sm': '0 0 15px -3px rgba(212, 255, 0, 0.25)',
        'tactile': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
