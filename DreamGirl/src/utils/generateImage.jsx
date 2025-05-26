"use client";
import React, { useEffect, useState } from "react";
import { generatePrompt } from "./generateprompt";
import { Loader2, AlertTriangle, RotateCcw, Download, Share } from "lucide-react";
import { SparklesCore } from "../components/sparkles";

const GenerateImage = ({ answers, onRestart }) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      if (!answers || Object.keys(answers).length === 0) {
        setError("No answers provided.");
        return;
      }

      const newPrompt = generatePrompt(answers);
      if (!newPrompt) {
        setError("Prompt generation failed.");
        return;
      }

      setPrompt(newPrompt);
      setLoading(true);
      setError("");

      try {
        const imageLink = `https://image.pollinations.ai/prompt/${encodeURIComponent(newPrompt)}?width=512&height=512&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
        setImageUrl(imageLink);
      } catch (err) {
        console.error(err);
        setError("Image generation failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [answers]);

  const handleRegenerate = () => {
    setImageUrl("");
    setError("");
    const newPrompt = generatePrompt(answers);
    setPrompt(newPrompt);
    setLoading(true);
    
    try {
      const imageLink = `https://image.pollinations.ai/prompt/${encodeURIComponent(newPrompt)}?width=512&height=512&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
      setImageUrl(imageLink);
    } catch (err) {
      console.error(err);
      setError("Image generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-dream-girl.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShareToTwitter = () => {
    const tweetText = "I just created my dream girl using AI! 🥰✨ Check out DreamHer - it's amazing! #DreamHer #AI #DreamGirl";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-black">
      {/* Sparkles Background */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={300}
          className="w-full h-full"
          particleColor="#FFC0CB"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 py-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Your Dream Girl ✨
        </h1>

        <p className="text-pink-200 text-sm mb-6 max-w-md drop-shadow-md">
          Generated based on your preferences. AI imagined this using your answers!
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <Loader2 className="w-12 h-12 text-pink-300 animate-spin mb-4" />
            <p className="text-pink-200 text-sm">Creating your dream girl...</p>
          </div>
        ) : error ? (
          <div className="text-red-300 flex flex-col items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRegenerate}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : imageUrl ? (
          <div className="mt-4 max-w-md w-full">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-300 backdrop-blur-md bg-white/10">
              <img
                src={imageUrl}
                alt="AI generated dream girl"
                className="w-full h-auto object-cover"
                onError={() => setError("Failed to load image")}
              />
              <div className="p-4 bg-black/50 text-pink-100 text-xs">
                <p className="font-medium mb-2">Generated from your preferences</p>
                <p className="italic opacity-75 text-xs">{prompt}</p>
              </div>
            </div>
            
            {/* Social sharing buttons */}
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors text-xs"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={handleShareToTwitter}
                className="flex items-center gap-1 px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors text-xs"
              >
                <Share className="w-3 h-3" />
                Share
              </button>
            </div>
            
            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors text-sm"
              >
                Start Over
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GenerateImage;