/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Hover styles only on devices that can hover, so taps on phones don't stick.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        pink: {
          DEFAULT: "#FF5FA2", // fills: buttons, highlight slab, selected answers
          deep: "#D6116A", // pink text on white (passes contrast)
          soft: "#FFC6DF", // secondary blocks, caption strips
          wash: "#FFF0F6", // alternate section background
        },
      },
      fontFamily: {
        display: ['"Dela Gothic One"', "Impact", "sans-serif"],
        sans: ['"Lexend"', "system-ui", "sans-serif"],
      },
      borderWidth: { 3: "3px" },
      boxShadow: {
        "nb-sm": "2px 2px 0 0 #000",
        nb: "4px 4px 0 0 #000",
        "nb-hover": "6px 6px 0 0 #000",
        "nb-lg": "8px 8px 0 0 #000",
      },
      keyframes: {
        develop: {
          "0%": { filter: "blur(14px) saturate(0) brightness(1.5) contrast(.6)", opacity: "0.6" },
          "60%": { filter: "blur(3px) saturate(.6) brightness(1.1)", opacity: "1" },
          "100%": { filter: "none", opacity: "1" },
        },
        stripes: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "56px 0" },
        },
      },
      animation: {
        develop: "develop 1.6s cubic-bezier(.22,1,.36,1) both",
        stripes: "stripes 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};
