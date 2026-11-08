/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Patapotea brand colours from the mockups
        navy: {
          DEFAULT: '#1B2A3B',
          light: '#243447',
          dark: '#121E2B',
        },
        amber: {
          brand: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
