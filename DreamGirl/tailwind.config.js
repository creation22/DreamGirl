/** @type {import('tailwindcss').Config} */
// Theme taken from the hero photograph: black-and-white night film, grain, and one
// source of light (her). White glow is the only accent.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Hover styles only on devices that can hover, so taps on phones don't stick.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        void: "#0D0D0D", // page, the photo's sky
        ash: "#181818", // raised surfaces
        smoke: "#2A2A2A", // lines and borders
        fog: "#8F8F8F", // secondary text
        mist: "#D6D6D6", // body text
        light: "#FFFFFF", // her
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Didot", "Georgia", "serif"],
        sans: ['"Archivo"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255,255,255,.35), 0 0 64px rgba(255,255,255,.18)",
        "glow-lg": "0 0 40px rgba(255,255,255,.45), 0 0 120px rgba(255,255,255,.22)",
        halo: "0 0 0 1px rgba(255,255,255,.08), 0 0 80px rgba(255,255,255,.10)",
      },
      keyframes: {
        // She steps out of the light: pure glow first, then her face.
        emerge: {
          "0%": { opacity: "0.2", filter: "brightness(3.2) blur(28px) contrast(.6) grayscale(1)" },
          "45%": { opacity: "1", filter: "brightness(1.8) blur(10px) contrast(.8) grayscale(.6)" },
          "100%": { opacity: "1", filter: "none" },
        },
        breathe: {
          "0%, 100%": { opacity: ".75", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.015)" },
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
        emerge: "emerge 2.2s cubic-bezier(.22,1,.36,1) both",
        breathe: "breathe 3.2s ease-in-out infinite",
        rise: "rise .9s cubic-bezier(.22,1,.36,1) both",
        fade: "fade 1.6s ease-out both",
      },
    },
  },
  plugins: [],
};
