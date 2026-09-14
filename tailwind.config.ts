/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5A623',
          'yellow-light': '#FFD166',
          'yellow-dark': '#D4891A',
          black: '#0A0A0A',
          'card': '#111111',
          'card-hover': '#1A1A1A',
          'border': '#222222',
          'border-light': '#2E2E2E',
          'muted': '#9CA3AF',
          'muted-dark': '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #F5A623 0%, #D4891A 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
}
