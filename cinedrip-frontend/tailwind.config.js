/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0f',
        surface: '#16161f',
        'surface-2': '#211f2d',
        brand: {
          500: '#a855f7',
          600: '#9333ea',
        },
        accent: {
          500: '#ec4899',
        },
      },
    },
  },
  plugins: [],
};
