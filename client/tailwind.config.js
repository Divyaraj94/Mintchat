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
          bg: '#131314', // Main background
          surface: '#1e1f20', // Input background, sidebar
          surfaceHover: '#333537', // Hover state
          textMain: '#e3e3e3', // Primary text
          textMuted: '#c4c7c5', // Secondary text
          border: '#444746', // Borders
          primary: '#a8c7fa', // Accent / Links
          pillBg: '#282a2c' // Tag pill background
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
