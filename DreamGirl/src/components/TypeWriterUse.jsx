"use client";
import { TypewriterEffect } from "./typewriter-effect";

export function TypewriterEffectDemo({ onStart }) {
const words = [
  { text: "Find\u00A0" },
  { text: "how\u00A0" },
  { text: "your\u00A0" },
  { text: "dream\u00A0" },
  { text: "girl\u00A0" },
  { text: "looks\u00A0" },
  { text: "with\u00A0" },
  {
    text: "DreamHer ",
    className: "text-blue-500 dark:text-blue-500 ",
  },
];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-pink-500 to-black">
      <p className=" text-white text-3xl mb-10 font-pacifico drop-shadow-md text-center">
        Describe Her. We'll Draw Her 🥰
      </p>
      <TypewriterEffect words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
        <button
          onClick={onStart}
          className="w-40 h-10 rounded-xl bg-white text-black border border-black text-sm hover:bg-gray-100 transition-colors"
        >
          Let's Find Her
        </button>
      </div>
    </div>
  );
}