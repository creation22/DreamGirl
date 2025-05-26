"use client";
import React, { useEffect, useState } from "react";
import { MultiStepLoader as Loader } from "./multi-step-loader";

const loadingStates = [
  { text: "Analyzing your answers..." },
  { text: "Generating traits of your dream girl..." },
  { text: "Styling appearance & outfit..." },
  { text: "Adding emotions and expressions..." },
  { text: "Finalizing the artistic style..." },
  { text: "Almost done... Summoning the vibe ✨" },
  { text: "Creating the final image..." },
];

export function MultiStepLoaderDemo({ onClick, disabled, show }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      const timeout = setTimeout(() => {
        onClick?.(); // Call the final submit handler
        setLoading(false);
      }, loadingStates.length * 2000);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  return (
    <div className="w-full">
      <Loader
        loadingStates={loadingStates}
        loading={loading}
        duration={2000}
        className="text-pink-300"
      />
      {!show && (
        <button
          onClick={() => setLoading(true)}
          disabled={disabled}
          className="w-full mt-4 py-2 rounded-full bg-pink-400 text-white font-semibold text-sm hover:bg-pink-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Reveal the Magic ✨
        </button>
      )}
    </div>
  );
}
