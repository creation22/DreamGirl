"use client";
import React, { useEffect, useState } from "react";
import { generatePrompt } from "./generateprompt";
import { Loader2, AlertTriangle } from "lucide-react";
import { SparklesCore } from "../components/sparkles";

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const newPrompt = generatePrompt();
      if (!newPrompt) {
        setError("Prompt generation failed.");
        return;
      }

      setPrompt(newPrompt);
      setLoading(true);
      setError("");

      try {
        const imageLink = `https://image.pollinations.ai/prompt/${encodeURIComponent(newPrompt)}`;
        setImageUrl(imageLink);
      } catch (err) {
        console.error(err);
        setError("Image generation failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Sparkles Background */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={500}
          className="w-full h-full"
          particleColor="#FFC0CB"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 py-8">
        <h1 className="text-3xl md:text-5xl font-bold text-pink-700 mb-4 drop-shadow-lg">
          Your Dream Girl ✨
        </h1>

        <p className="text-pink-200 text-sm mb-6 max-w-md drop-shadow-md">
          Generated based on your personality preferences. AI imagined this using your answers!
        </p>

        {loading ? (
          <div className="flex items-center justify-center mt-10 animate-pulse">
            <Loader2 className="w-10 h-10 text-pink-200 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-300 flex items-center gap-2 mt-6">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : imageUrl ? (
          <div className="mt-4 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-300 backdrop-blur-md">
            <img
              src={imageUrl}
              alt="AI generated dream girl"
              className="w-full h-auto object-cover"
            />
            <div className="p-4 bg-white/70 text-pink-700 text-xs font-medium">
              Prompt used: <span className="italic">{prompt}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GenerateImage;
