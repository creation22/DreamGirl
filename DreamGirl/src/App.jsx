import { useCallback, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import Landing from "./components/Landing";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Gallery from "./components/Gallery";
import HandleDialog from "./components/HandleDialog";
import { HandleDialogContext } from "./lib/dialog";
import { matchRoute, navigate, usePath } from "./lib/router";
import { useHandle } from "./lib/me";

export default function App() {
  const route = matchRoute(usePath());
  const handle = useHandle();
  const [page, setPage] = useState("landing"); // within "/": landing | quiz | result
  const [answers, setAnswers] = useState({});
  // Changing the username later, from the @ chip.
  const [dialogOpen, setDialogOpen] = useState(false);

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
  // The site is entered with a username. Shared gallery links stay open to everyone,
  // so a friend can see your portraits first; "Make yours" brings them here.
  const gate = atHome && !handle;

  return (
    <HandleDialogContext.Provider value={openDialog}>
      <Analytics />
      {/* The result stays mounted (hidden) while browsing the gallery, so coming back
          doesn't start a new drawing or post the portrait twice. */}
      {page === "result" && (
        <div hidden={!atHome}>
          <Result answers={answers} handle={handle} onEdit={() => setPage("quiz")} onRestart={home} />
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
      <HandleDialog open={gate || dialogOpen} required={gate} initial={handle || ""} onClose={() => setDialogOpen(false)} />
    </HandleDialogContext.Provider>
  );
}
