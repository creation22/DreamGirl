/** @type {import('tailwindcss').Config} */
// Two looks, one site:
// - Landing page: "night", taken from the hero photograph. Black-and-white film, grain,
//   white glow as the only accent. Serif headline (font-serif).
// - Everything inside the app (quiz, result, gallery, dialogs): white neobrutalism.
//   White, pinks and pure black; 3px borders, hard offset shadows (font-display).
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Hover styles only on devices that can hover, so taps on phones don't stick.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // app
        ink: "#000000",
        pink: {
          DEFAULT: "#FF5FA2", // fills: buttons, highlight slab, selected answers
          deep: "#D6116A", // pink text on white (passes contrast)
          soft: "#FFC6DF", // secondary blocks, caption strips
          wash: "#FFF0F6", // alternate section background
        },
        // landing
        void: "#0D0D0D",
        fog: "#8F8F8F",
        mist: "#D6D6D6",
        light: "#FFFFFF",
      },
      fontFamily: {
        display: ['"Dela Gothic One"', "Impact", "sans-serif"],
        serif: ['"Bodoni Moda"', "Didot", "Georgia", "serif"],
        sans: ['"Lexend"', "system-ui", "sans-serif"],
      },
      borderWidth: { 3: "3px" },
      boxShadow: {
        "nb-sm": "2px 2px 0 0 #000",
        nb: "4px 4px 0 0 #000",
        "nb-hover": "6px 6px 0 0 #000",
        "nb-lg": "8px 8px 0 0 #000",
        glow: "0 0 24px rgba(255,255,255,.35), 0 0 64px rgba(255,255,255,.18)",
        "glow-lg": "0 0 40px rgba(255,255,255,.45), 0 0 120px rgba(255,255,255,.22)",
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
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        develop: "develop 1.6s cubic-bezier(.22,1,.36,1) both",
        stripes: "stripes 1.2s linear infinite",
        rise: "rise .9s cubic-bezier(.22,1,.36,1) both",
        fade: "fade 1.6s ease-out both",
      },
    },
  },
  plugins: [],
};
