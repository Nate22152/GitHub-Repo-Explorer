/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          blue: '#58a6ff',
          green: '#238636',
          border: '#30363d'
        }
      }
    },
  },
  plugins: [],
}