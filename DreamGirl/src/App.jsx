import { useCallback, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import Landing from "./components/Landing";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Gallery from "./components/Gallery";
import HandleDialog from "./components/HandleDialog";
import { HandleDialogContext } from "./components/Chrome";
import { matchRoute, navigate, usePath } from "./lib/router";
import { useHandle, wasAsked } from "./lib/me";

export default function App() {
  const route = matchRoute(usePath());
  const handle = useHandle();
  const [page, setPage] = useState("landing"); // within "/": landing | quiz | result
  const [answers, setAnswers] = useState({});
  // Ask for the X username the first time someone lands on the site.
  const [dialogOpen, setDialogOpen] = useState(() => !wasAsked());

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const openDialog = useCallback(() => setDialogOpen(true), []);

  const start = useCallback(() => {
    setAnswers({});
    setPage("quiz");
    navigate("/");
  }, []);

  const home = () => {
    setAnswers({});
    setPage("landing");
  };

  const atHome = route.name === "home";

  return (
    <HandleDialogContext.Provider value={openDialog}>
      <Analytics />
      {/* The result stays mounted (hidden) while browsing the gallery, so coming back
          doesn't start a new drawing or post the portrait twice. */}
      {page === "result" && (
        <div hidden={!atHome}>
          <Result answers={answers} handle={handle} onAskHandle={openDialog} onEdit={() => setPage("quiz")} onRestart={home} />
        </div>
      )}
      {atHome && page === "landing" && <Landing onStart={start} />}
      {atHome && page === "quiz" && (
        <Quiz
          initialAnswers={answers}
          onExit={() => setPage("landing")}
          onComplete={(a) => {
            setAnswers(a);
            setPage("result");
          }}
        />
      )}
      {route.name === "gallery" && <Gallery onStart={start} />}
      {route.name === "user" && <Gallery key={route.handle} handle={route.handle} onStart={start} />}
      <HandleDialog open={dialogOpen} initial={handle || ""} onClose={() => setDialogOpen(false)} />
    </HandleDialogContext.Provider>
  );
}
