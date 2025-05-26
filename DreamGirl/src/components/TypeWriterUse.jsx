"use client";
import { useState } from "react";
import { TypewriterEffect } from "./typewriter-effect";
import { motion, AnimatePresence } from "framer-motion";

export function TypewriterEffectDemo({ onStart }) {
  const [startClicked, setStartClicked] = useState(false);

  const handleClick = () => {
    setStartClicked(true);
    setTimeout(() => {
      onStart(); // trigger parent view switch
    }, 1000); // wait for animation to finish
  };

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
    <div className="h-screen w-full bg-gradient-to-b from-pink-500 to-black flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!startClicked && (
          <motion.div
            key="intro"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <p className="text-white text-3xl mb-10 font-pacifico drop-shadow-md text-center">
              Describe Her. We'll Draw Her 🥰
            </p>

            <TypewriterEffect words={words} />

            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "#f0f0f0",
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className="mt-10 px-6 py-2 rounded-xl bg-white text-black border border-black text-sm font-semibold shadow-md transition-all duration-300"
            >
              Let's Find Her
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
