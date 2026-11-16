/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Hover styles only on devices that can hover, so taps on phones don't stick.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        night: "#170F2E",
        dusk: "#251842",
        twilight: "#33245A",
        rose: { DEFAULT: "#FF4F87", deep: "#E8336F" },
        blush: "#FFC9D9",
        lavender: "#A99BD1",
        film: "#FBF6EF",
        ink: "#2B2140",
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        hand: ['"Caveat"', "cursive"],
      },
      boxShadow: {
        photo: "0 1px 2px rgba(10,4,24,.35), 0 18px 40px -12px rgba(10,4,24,.7)",
      },
      keyframes: {
        develop: {
          "0%": { filter: "blur(14px) saturate(0) brightness(1.6) contrast(.6)", opacity: "0.6" },
          "60%": { filter: "blur(3px) saturate(.6) brightness(1.15) contrast(.9)", opacity: "1" },
          "100%": { filter: "none", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        develop: "develop 1.8s cubic-bezier(.22,1,.36,1) both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
