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
        primary: { 50: '#e6f7f0', 100: '#b3e6d1', 200: '#80d4b2', 300: '#4dc393', 400: '#25b07d', 500: '#128C7E', 600: '#0e766a', 700: '#0b5f56', 800: '#084942', 900: '#05332e' },
      },
    },
  },
  plugins: [],
}
