import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import Landing from "./components/Landing";
import Quiz from "./components/Quiz";
import Result from "./components/Result";

export default function App() {
  const [page, setPage] = useState("landing"); // landing | quiz | result
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <>
      <Analytics />
      {page === "landing" && (
        <Landing
          onStart={() => {
            setAnswers({});
            setPage("quiz");
          }}
        />
      )}
      {page === "quiz" && (
        <Quiz
          initialAnswers={answers}
          onExit={() => setPage("landing")}
          onComplete={(a) => {
            setAnswers(a);
            setPage("result");
          }}
        />
      )}
      {page === "result" && (
        <Result
          answers={answers}
          onEdit={() => setPage("quiz")}
          onRestart={() => {
            setAnswers({});
            setPage("landing");
          }}
        />
      )}
    </>
  );
}
