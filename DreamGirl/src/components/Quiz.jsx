import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, PenLine } from "lucide-react";
import { Header, Photo } from "./Chrome";
import { questions, captionFor } from "../constants/question";

const EASE_OUT = [0.22, 1, 0.36, 1];
const MotionDiv = motion.div;

export default function Quiz({ initialAnswers = {}, onComplete, onExit }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [customOpen, setCustomOpen] = useState(() => {
    // Reopen the text box for answers that were typed in on an earlier pass.
    const open = {};
    questions.forEach((q) => {
      const a = initialAnswers[q.key];
      if (q.custom && a && !q.options.includes(a)) open[q.key] = true;
    });
    return open;
  });
  const advanceTimer = useRef(null);
  const inputRef = useRef(null);

  const q = questions[index];
  const value = answers[q.key] ?? "";
  const isLast = index === questions.length - 1;
  const answered = value.trim() !== "";
  const showCustom = !!customOpen[q.key];

  const go = useCallback((next) => {
    clearTimeout(advanceTimer.current);
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }, [index]);

  const submit = useCallback(() => {
    clearTimeout(advanceTimer.current);
    const cleaned = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.trim()]));
    onComplete(cleaned);
  }, [answers, onComplete]);

  const next = useCallback(() => {
    if (!answered) return;
    if (isLast) submit();
    else go(index + 1);
  }, [answered, isLast, submit, go, index]);

  const choose = useCallback((option) => {
    setAnswers((prev) => ({ ...prev, [q.key]: option }));
    setCustomOpen((prev) => ({ ...prev, [q.key]: false }));
    // One tap per question: move on shortly after a pick so the choice registers visually.
    if (!isLast) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        setDirection(1);
        setIndex((n) => Math.min(n + 1, questions.length - 1));
      }, 280);
    }
  }, [q.key, isLast]);

  const openCustom = () => {
    clearTimeout(advanceTimer.current);
    setCustomOpen((prev) => ({ ...prev, [q.key]: true }));
    if (q.options.includes(value)) setAnswers((prev) => ({ ...prev, [q.key]: "" }));
  };

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    if (showCustom) inputRef.current?.focus();
  }, [showCustom, index]);

  // Number keys pick an option, Enter moves on.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === "Enter") next();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
      else if (q.custom && n === q.options.length + 1) openCustom();
      else if (e.key === "Enter" && answered && document.activeElement?.tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const caption = captionFor(answers, { all: true });
  const progress = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Header onHome={onExit}>
        <p className="text-sm font-medium text-lavender" aria-live="polite">
          Question {index + 1} of {questions.length}
        </p>
      </Header>

      {/* progress: one segment per question */}
      <div className="mx-auto flex w-full max-w-6xl gap-1.5 px-4 sm:px-6" aria-hidden>
        {questions.map((item, n) => (
          <span
            key={item.key}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              n < index || (n === index && answered) ? "bg-rose" : n === index ? "bg-blush/40" : "bg-twilight"
            }`}
          />
        ))}
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div className="flex flex-col">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <MotionDiv
              key={q.key}
              custom={direction}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <h1 id="question" className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                {q.question}
              </h1>

              <div role="radiogroup" aria-labelledby="question" className="mt-9 grid gap-3 sm:grid-cols-2">
                {q.options.map((option, n) => {
                  const selected = value === option && !showCustom;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(option)}
                      className={`group flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-lg font-medium transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                        selected
                          ? "border-rose bg-rose/15 text-film"
                          : "border-twilight bg-dusk/60 text-film/90 hover:border-lavender/60 hover:bg-dusk"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                          selected ? "bg-rose text-night" : "bg-twilight text-lavender"
                        }`}
                      >
                        {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : n + 1}
                      </span>
                      {option}
                    </button>
                  );
                })}

                {q.custom && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={showCustom}
                    onClick={openCustom}
                    className={`flex items-center gap-4 rounded-2xl border border-dashed px-4 py-4 text-left text-lg font-medium transition-[background-color,border-color] duration-150 ${
                      showCustom ? "border-rose bg-rose/10 text-film" : "border-twilight text-lavender hover:border-lavender/60 hover:text-film"
                    }`}
                  >
                    <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${showCustom ? "bg-rose text-night" : "bg-twilight text-lavender"}`}>
                      <PenLine className="h-4 w-4" />
                    </span>
                    Something else
                  </button>
                )}
              </div>

              {showCustom && (
                <div className="mt-4">
                  <label htmlFor="custom-answer" className="sr-only">
                    Your own answer
                  </label>
                  <input
                    id="custom-answer"
                    ref={inputRef}
                    type="text"
                    maxLength={120}
                    value={value}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    placeholder="Describe it in your own words"
                    className="w-full rounded-2xl border border-rose/60 bg-night px-5 py-4 font-hand text-2xl text-film placeholder:text-lavender/60 focus:border-rose focus:outline-none"
                  />
                </div>
              )}
            </MotionDiv>
          </AnimatePresence>

          <div className="mt-auto flex items-center justify-between gap-3 pt-10">
            {index > 0 ? (
              <button type="button" onClick={() => go(index - 1)} className="btn-quiet">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={next} disabled={!answered} className="btn-primary">
              {isLast ? "Draw her" : "Next"}
            </button>
          </div>
          <p className="mt-4 hidden text-right text-sm text-lavender/80 sm:block">
            Tip: press 1 to {q.options.length + (q.custom ? 1 : 0)} to pick, Enter to continue.
          </p>
        </div>

        {/* The empty photo her notes are written under. Desktop only. */}
        <aside className="hidden lg:block" aria-label="Your answers so far">
          <Photo caption={caption || "your answers will be noted here"} className="sticky top-8 rotate-2">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-twilight/70 to-dusk">
              <span className="font-hand text-6xl font-bold text-blush/80">{progress}/10</span>
              <span className="text-sm text-lavender">answered</span>
            </div>
          </Photo>
        </aside>
      </main>
    </div>
  );
}
