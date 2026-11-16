/** @type {import('tailwindcss').Config} */
// One system, two lightings:
// - Inside the app (quiz, result, gallery, dialogs): white neobrutalism. White, pinks and
//   pure black; 3px borders, hard offset shadows.
// - Landing page: the same components drawn in white on the night photograph
//   (white borders and white offset shadows), with the same pink buttons.
// Clash Display for headings, Satoshi for everything else, on both.
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
        display: ['"Clash Display"', "system-ui", "sans-serif"],
        sans: ['"Satoshi"', "system-ui", "sans-serif"],
      },
      borderWidth: { 3: "3px" },
      boxShadow: {
        "nb-sm": "2px 2px 0 0 #000",
        nb: "4px 4px 0 0 #000",
        "nb-hover": "6px 6px 0 0 #000",
        "nb-lg": "8px 8px 0 0 #000",
        // the same hard shadows, in white, for the night landing page
        "nb-w-sm": "2px 2px 0 0 #fff",
        "nb-w": "4px 4px 0 0 #fff",
        "nb-w-hover": "6px 6px 0 0 #fff",
      },
      keyframes: {
        develop: {
          "0%": { filter: "blur(14px) saturate(0) brightness(1.5) contrast(.6)", opacity: "0.6" },
          "60%": { filter: "blur(3px) saturate(.6) brightness(1.1)", opacity: "1" },
          "100%": { filter: "none", opacity: "1" },
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
        rise: "rise .9s cubic-bezier(.22,1,.36,1) both",
        fade: "fade 1.6s ease-out both",
      },
    },
  },
  plugins: [],
};
