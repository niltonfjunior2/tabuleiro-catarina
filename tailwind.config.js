/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unicorn: {
          pink: '#f472b6',
          purple: '#c084fc',
          yellow: '#fde047',
          cyan: '#38bdf8',
          bg: '#fdf2f8'
        }
      }
    },
  },
  plugins: [],
}
