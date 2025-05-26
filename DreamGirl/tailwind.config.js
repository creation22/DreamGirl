/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
          fontFamily: {
      pacifico: ['"Pacifico"', 'cursive'],
      quicksand: ['"Quicksand"', 'sans-serif'],
    },
    },
  },
  plugins: [],
}
