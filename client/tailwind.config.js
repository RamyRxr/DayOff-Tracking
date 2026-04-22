/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Apple-style warm grays
        'warm-gray': {
          50: '#FAFAFA',
          100: '#F8F8F8',
          200: '#F2F2F7', // Main background
          300: '#E5E5EA',
          400: '#D1D1D6',
          500: 'rgba(118,118,128,0.12)',
          600: 'rgba(118,118,128,0.18)',
        },
        // NAFTAL deep navy
        'navy': {
          DEFAULT: '#1B3A6B',
          50: 'rgba(27,58,107,0.05)',
          100: 'rgba(27,58,107,0.1)',
          200: 'rgba(27,58,107,0.2)',
          dark: '#0F2140',
        },
        // Apple system colors
        'apple-green': '#34C759',
        'apple-amber': '#FF9F0A',
        'apple-red': '#FF3B30',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Layered ambient glow — signature shadow
        'ambient': '0 0 0 0.5px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.04)',
        // Deep modal shadow
        'modal': '0 0 0 0.5px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)',
        // Inner shadow for inputs
        'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.05)',
        'inner-input': 'inset 0 1px 2px rgba(0,0,0,0.06)',
        // Status glows
        'glow-green': '0 0 12px rgba(52,199,89,0.15)',
        'glow-red': '0 0 12px rgba(255,59,48,0.15)',
        'glow-amber': '0 0 12px rgba(255,159,10,0.15)',
      },
      backdropBlur: {
        'xl': '20px',
        '2xl': '24px',
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'wider': '0.05em',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
    },
  },
  plugins: [],
}

