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
        setLoading(false);
        onClick?.();
      }, loadingStates.length * 2000); // Total duration matches loader
      
      return () => clearTimeout(timeout);
    }
  }, [show, onClick]);

  
  const handleButtonClick = () => {
    if (!disabled) {
      setLoading(true);
      
      setTimeout(() => {
        setLoading(false);
        onClick?.();
      }, loadingStates.length * 2000);
    }
  };

  return (
    <div className="w-full">
      <Loader
        loadingStates={loadingStates}
        loading={loading}
        duration={2000}
        className="text-pink-300"
      />
      {!show && !loading && (
        <button
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Reveal the Magic ✨
        </button>
      )}
    </div>
  );
}