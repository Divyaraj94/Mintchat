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
        gemini: {
          bg: 'var(--gemini-bg)',
          surface: 'var(--gemini-surface)',
          surfaceHover: 'var(--gemini-surface-hover)',
          textMain: 'var(--gemini-text-main)',
          textMuted: 'var(--gemini-text-muted)',
          border: 'var(--gemini-border)',
          primary: 'var(--gemini-primary)',
          pillBg: 'var(--gemini-pill-bg)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
