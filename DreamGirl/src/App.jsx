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
  // "Describe her" without a username: ask for it first, then start.
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const openDialog = useCallback(() => setDialogOpen(true), []);

  const begin = useCallback(() => {
    setAnswers({});
    setPage("quiz");
    navigate("/");
  }, []);

  // The landing page and gallery are open to everyone; the questions need an X username.
  const start = useCallback(() => {
    if (handle) begin();
    else setAsking(true);
  }, [handle, begin]);

  const closeDialog = (saved) => {
    if (asking && saved) begin();
    setAsking(false);
    setDialogOpen(false);
  };

  const home = () => {
    setAnswers({});
    setPage("landing");
  };

  const atHome = route.name === "home";
  // Belt and braces: no username, no questions.
  const inApp = atHome && page !== "landing" && !!handle;

  return (
    <HandleDialogContext.Provider value={openDialog}>
      <Analytics />
      {/* The result stays mounted (hidden) while browsing the gallery, so coming back
          doesn't start a new drawing or post the portrait twice. */}
      {page === "result" && handle && (
        <div hidden={!atHome}>
          <Result answers={answers} handle={handle} onEdit={() => setPage("quiz")} onRestart={home} />
        </div>
      )}
      {atHome && !inApp && <Landing onStart={start} />}
      {inApp && page === "quiz" && (
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
      <HandleDialog open={asking || dialogOpen} starting={asking} initial={handle || ""} onClose={closeDialog} />
    </HandleDialogContext.Provider>
  );
}
