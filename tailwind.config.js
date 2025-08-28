/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        brand: {
          blue: {
            800: '#111827',
            900: '#0F172A'
          },
          /* Mapped mint to a neutral / silver color per design direction */
          mint: '#7F8487',
          /* keep amber as-is for small highlights, map cyan to a soft neutral */
          amber: '#F59E0B',
          cyan: '#D9DCDD'
        }
      },
      boxShadow: {
        soft: '0 4px 16px -4px rgba(0,0,0,0.15)',
        /* neutral silver glow instead of green/teal */
        glow: '0 0 18px rgba(127,132,135,0.35)',
        'glow-lg': '0 0 36px rgba(127,132,135,0.45)'
      },
      borderRadius: {
        '2xl': '1rem'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-out',
        slideUp: 'slideUp 180ms ease-out'
      }
    }
  },
  plugins: []
};
