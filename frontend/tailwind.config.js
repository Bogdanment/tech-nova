/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c0f14',
        stone: '#f6f7fb',
        accent: '#2d6cdf'
      }
    }
  },
  plugins: []
};
