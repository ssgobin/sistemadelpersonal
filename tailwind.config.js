/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#05070a',
        surface: '#0d1218',
        panel: '#121923',
        line: '#233041',
        electric: '#15d4ff',
        volt: '#9cff2e',
      },
      boxShadow: {
        glow: '0 0 40px rgba(21, 212, 255, 0.16)',
        lift: '0 18px 50px rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
