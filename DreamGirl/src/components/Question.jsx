"use client";
import React, { useState, useRef, useEffect } from "react";
import { SparklesCore } from "./sparkles";
import { questions } from "../constants/question";
import { MultiStepLoaderDemo } from "./loadingState";

export function SparklesPreview({ onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const textareaRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id] || "";
  const textareaIndex = 4;

  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleTextareaChange = (e) => {
    setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [selectedAnswer]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = () => {
    console.log("Final submit called with answers:", answers);
    
    
    const transformedAnswers = {
      aura: answers[1],
      race: answers[2],
      bodyType: answers[3],
      skinTone: answers[4],
      facialStructure: answers[5],
      outfit: answers[6],
      hairstyle: answers[7],
      facialExpression: answers[8],
      accessories: answers[9],
      imageGenerationStyle: answers[10]
    };
    
    console.log("Transformed answers:", transformedAnswers);
    onComplete(transformedAnswers);
  };

  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-pink-900 via-purple-900 to-black flex flex-col items-center justify-center overflow-hidden rounded-md px-4 py-6 md:py-12">
  <div className="w-full absolute inset-0 h-full">
    <SparklesCore
      id="tsparticlesfullpage"
      background="transparent"
      minSize={0.6}
      maxSize={1.4}
      particleDensity={100}
      className="w-full h-full"
      particleColor="#FFC0CB"
    />
  </div>

  {currentQuestionIndex === 0 && (
    <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white z-10 mb-6 text-center max-w-2xl drop-shadow-lg leading-snug">
      Answer these 10 questions to know how your dream girl looks like ✨
    </h1>
  )}

  <div className="z-10 w-full max-w-xl p-6 sm:p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl text-white border border-pink-300/30">
    <div className="text-xs sm:text-sm text-right mb-4 text-pink-200 font-medium">
      Question {currentQuestionIndex + 1} of {questions.length}
    </div>

    <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center text-white drop-shadow-md">
      {currentQuestion.question}
    </h2>

    <div className="space-y-4">
      {currentQuestion.options.map((option, idx) => {
        if (idx === textareaIndex && currentQuestion.allowCustom) {
          return (
            <textarea
              key={idx}
              ref={textareaRef}
              placeholder="Add your own answer here..."
              value={selectedAnswer}
              onChange={handleTextareaChange}
              className="w-full px-4 py-3 mt-2 rounded-xl text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 resize-none min-h-[48px] bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300"
            />
          );
        } else {
          return (
            <label
              key={idx}
              className={`block px-4 py-3 sm:px-6 sm:py-4 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedAnswer === option
                  ? "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30"
                  : "border-pink-300/50 text-white hover:bg-pink-400/20 hover:text-white hover:border-pink-300 backdrop-blur-sm"
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </label>
          );
        }
      })}
    </div>

    <div className="mt-6 sm:mt-8">
      {currentQuestionIndex === questions.length - 1 ? (
        <MultiStepLoaderDemo
          onClick={handleFinalSubmit}
          disabled={selectedAnswer.trim() === ""}
          show={showLoader}
        />
      ) : (
        <button
          onClick={handleNext}
          disabled={selectedAnswer.trim() === ""}
          className="w-full mt-4 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Next Question →
        </button>
      )}
    </div>
  </div>
</div>

  );
}