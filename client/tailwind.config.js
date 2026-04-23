/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Design system colors - Linear/Vercel style
        'warm-gray': {
          50: '#FAFAFA', // Main background
          100: '#F8F8F8',
          200: '#F2F2F7', // Card tints
          300: '#E5E5EA',
          400: '#D1D1D6',
          500: 'rgba(118,118,128,0.12)',
          600: 'rgba(118,118,128,0.18)',
        },
        // Primary accent - refined navy
        'navy': '#1A2F4F',
        'navy-dark': '#0F1F35',
        'navy-light': '#2C4A6F',
        // Text colors
        'gray-text': {
          DEFAULT: '#374151',
          dark: '#111827',
          light: '#6B7280',
        },
        // Status colors (used sparingly - dots/borders only)
        'status-green': '#34C759',
        'status-amber': '#FF9F0A',
        'status-red': '#C0392B',
      },
      fontFamily: {
        sans: ['Work Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
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
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

