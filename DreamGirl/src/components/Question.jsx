"use client";
import React, { useState, useRef, useEffect } from "react";
import { SparklesCore } from "./sparkles";
import { questions } from "../constants/question";

export function SparklesPreview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const textareaRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion.id] || "";

  const optionsCount = currentQuestion.options.length;
  const textareaIndex = 4; // 5th option replaced by textarea

  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleTextareaChange = (e) => {
    setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
  };

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [selectedAnswer]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      console.log("All answers:", answers);
    }
  };

  return (
    <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={500}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {currentQuestionIndex === 0 && (
        <h1 className="text-3xl md:text-5xl font-bold text-white z-10 mb-6 text-center max-w-2xl">
          Answer these 10 questions to know how your dream girl looks like ✨
        </h1>
      )}

      <div className="z-10 w-full max-w-xl p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl text-white">
        <div className="text-sm text-right mb-2 text-gray-300">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            if (idx === textareaIndex) {
              // textarea instead of 5th option
              return (
                <textarea
                  key={idx}
                  ref={textareaRef}
                  placeholder="Write your answer here..."
                  value={selectedAnswer}
                  onChange={handleTextareaChange}
                  className="w-full px-4 py-2 mt-2 rounded-full text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white resize-none min-h-[38px]"
                />
              );
            } else {
              return (
                <label
                  key={idx}
                  className={`block px-4 py-2 rounded-full border cursor-pointer text-sm transition ${
                    selectedAnswer === option
                      ? "bg-white text-black border-white"
                      : "border-gray-300 text-white hover:bg-white hover:text-black"
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </label>
              );
            }
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedAnswer.trim() === ""}
          className="w-full mt-6 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
