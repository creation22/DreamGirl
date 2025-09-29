import React, { useEffect, useState } from "react";
import { generatePrompt } from "./generateprompt";
import { Loader2, AlertTriangle, RotateCcw, Download, Share, Sparkles } from "lucide-react";
import { SparklesCore } from "../components/sparkles";

const GenerateImage = ({ answers, onRestart }) => {
  const [promptData, setPromptData] = useState({ positive: "", negative: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Enhanced image generation with multiple fallback APIs
  const generateImageUrl = (promptData, seed = null) => {
    const randomSeed = seed || Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(promptData.positive);
    const encodedNegative = encodeURIComponent(promptData.negative);
    
    // Primary API with enhanced parameters
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&model=flux&seed=${randomSeed}&enhance=true&nologo=true&private=false&negative=${encodedNegative}`;
  };

  const fetchImage = async (isRegenerate = false) => {
    if (!answers || Object.keys(answers).length === 0) {
      setError("No answers provided.");
      return;
    }

    const newPromptData = generatePrompt(answers);
    if (!newPromptData || !newPromptData.positive) {
      setError("Prompt generation failed.");
      return;
    }

    setPromptData(newPromptData);
    setLoading(true);
    setError("");
    setImageLoaded(false);

    try {
      const imageLink = generateImageUrl(newPromptData);
      console.log("Generated prompt:", newPromptData.positive);
      console.log("Negative prompt:", newPromptData.negative);
      
      // Preload the image to ensure it loads properly
      const img = new Image();
      img.onload = () => {
        setImageUrl(imageLink);
        setImageLoaded(true);
        setLoading(false);
      };
      img.onerror = () => {
        setError("Failed to generate image. Please try again.");
        setLoading(false);
      };
      img.src = imageLink;
      
    } catch (err) {
      console.error("Image generation error:", err);
      setError("Image generation failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [answers]);

  const handleRegenerate = () => {
    setImageUrl("");
    setError("");
    setImageLoaded(false);
    fetchImage(true);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-dream-girl-hd.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError("Download failed. Please try again.");
    }
  };

  const handleShareToTwitter = () => {
    const tweetText = "I just created my dream girl using AI! 🥰✨ The quality is incredible! Check out DreamHer #DreamHer #AI #DreamGirl #AIArt";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-black">
      {/* Star this Repo - Top Left - Mobile Responsive */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
        <a
          href="https://github.com/creation22/DreamGirl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 px-2 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg transition-all duration-300"
        >
          ⭐ <span className="hidden sm:inline">Star this Repo</span><span className="sm:hidden">Star</span>
        </a>
      </div>

      {/* Buy Me a Coffee - Top Right - Mobile Responsive */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <a
          href="https://buymeacoffee.com/creation22"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 px-2 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg transition-all duration-300"
        >
          ☕ <span className="hidden sm:inline">Buy Me a Coffee</span><span className="sm:hidden">Coffee</span>
        </a>
      </div>

      {/* Enhanced Sparkles Background */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="result-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.8}
          particleDensity={200}
          className="w-full h-full"
          particleColor="#FFB6C1"
          speed={0.5}
        />
      </div>

    
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-3 py-16 sm:px-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Your Dream Girl
          </h1>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300" />
        </div>

        {/* Added back the commented description text - Mobile Responsive */}
        <p className="text-pink-200 text-xs sm:text-sm mb-6 max-w-xs sm:max-w-md drop-shadow-md px-2 leading-relaxed">
          High-quality AI generation based on your detailed preferences. If the output isn't as expected, simply click the 'Regenerate' button for a new response
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-6 sm:mt-10 space-y-4 px-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-pink-300 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-pink-500/20 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center">
              <p className="text-pink-200 text-base sm:text-lg font-medium">Creating your dream girl...</p>
              <p className="text-pink-300 text-xs sm:text-sm mt-2">Using advanced AI for high-quality results</p>
            </div>
            
            {/* Loading progress indicator - Mobile Responsive */}
            <div className="w-48 sm:w-64 bg-pink-900/50 rounded-full h-2 mt-4">
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-300 flex flex-col items-center gap-4 mt-6 p-4 sm:p-6 bg-red-900/20 rounded-2xl border border-red-500/30 mx-4">
            <div className="flex items-center gap-2 text-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">{error}</span>
            </div>
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Try Again
            </button>
          </div>
        ) : imageUrl ? (
          <div className="mt-4 max-w-sm sm:max-w-lg w-full px-4">
            {/* Enhanced Image Display - Mobile Responsive */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-400 rounded-2xl sm:rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-300/50 backdrop-blur-md bg-white/10">
                <img
                  src={imageUrl}
                  alt="AI generated dream girl - High Quality"
                  className={`w-full h-auto object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setError("Failed to load high-quality image")}
                />
                
                {/* Image overlay with quality badge - Mobile Responsive */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    HD QUALITY
                  </span>
                </div>
                
                {/* Enhanced info panel - Mobile Responsive */}
                <div className="p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="font-bold text-pink-200 mb-2 text-sm sm:text-base">✨ AI Generated Masterpiece</p>
                  <details className="text-xs sm:text-sm text-pink-100 cursor-pointer">
                    <summary className="font-medium mb-1 hover:text-pink-200">View Generation Details</summary>
                    <p className="mt-2 italic opacity-90 text-xs leading-relaxed bg-black/30 p-2 rounded">
                      {promptData.positive.substring(0, 150)}...
                    </p>
                  </details>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download HD
              </button>
              
              <button
                onClick={handleShareToTwitter}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            </div>
            
            {/* Enhanced Control Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center">
              <button
                onClick={handleRegenerate}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                Generate New
              </button>
              
              <button
                onClick={onRestart}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-sm sm:text-base"
              >
                Start Over
              </button>
            </div>

            <div className="mt-4 text-center px-2">
              <p className="text-pink-300 text-xs">
                🎨 Generated with enhanced AI prompts • 768x768 HD Resolution
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Google Form Feedback Button - Bottom Right - Mobile Responsive */}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSdQ4AvyxBcYbj6-LVSrcxuYWGS_RRbPCyR4f976I3cg8JPFAw/viewform?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold px-3 py-2 sm:px-5 sm:py-3 rounded-full shadow-xl hover:from-green-500 hover:to-teal-600 transition-all duration-300 text-xs sm:text-sm"
      >
        <span className="hidden sm:inline">✍️ Submit Feedback</span>
        <span className="sm:hidden">✍️ Feedback</span>
      </a>
    </div>
  );
};

export default GenerateImage;