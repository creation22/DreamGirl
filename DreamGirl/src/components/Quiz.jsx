import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, PenLine } from "lucide-react";
import { Header } from "./Chrome";
import { questions } from "../constants/question";

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
      // preventDefault so the digit isn't typed into the text box that may open.
      if (n >= 1 && n <= q.options.length) {
        e.preventDefault();
        choose(q.options[n - 1]);
      } else if (q.custom && n === q.options.length + 1) {
        e.preventDefault();
        openCustom();
      }
      else if (e.key === "Enter" && answered && document.activeElement?.tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progress = questions.filter((item) => answers[item.key]?.trim()).length;

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Header onHome={onExit}>
        <p className="rounded-full border-3 border-ink bg-pink-soft px-3 py-1 text-sm font-bold" aria-live="polite">
          Question {index + 1} of {questions.length}
        </p>
      </Header>

      {/* progress: one cell per question */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6" aria-hidden>
        <div className="flex h-4 overflow-hidden rounded-full border-3 border-ink bg-white">
          {questions.map((item, n) => (
            <span
              key={item.key}
              className={`flex-1 transition-colors duration-200 [&:not(:last-child)]:border-r-3 [&:not(:last-child)]:border-ink ${
                n < index || (n === index && answered) ? "bg-pink" : n === index ? "bg-pink-soft" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_300px] lg:gap-16">
        <div className="flex flex-col">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <MotionDiv
              key={q.key}
              custom={direction}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <h1 id="question" className="max-w-2xl font-display text-[clamp(2rem,7vw,3.25rem)] leading-[1.08]">
                {q.question}
              </h1>

              <div role="radiogroup" aria-labelledby="question" className="mt-9 grid gap-4 sm:grid-cols-2">
                {q.options.map((option, n) => {
                  const selected = value === option && !showCustom;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(option)}
                      className={`flex items-center gap-4 rounded-xl border-3 border-ink px-4 py-4 text-left text-lg font-semibold transition-[transform,box-shadow,background-color] duration-100 ease-out ${
                        selected
                          ? "translate-x-1 translate-y-1 bg-pink shadow-none"
                          : "bg-white shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pink-wash hover:shadow-nb-hover active:translate-x-1 active:translate-y-1 active:shadow-none"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-3 border-ink text-sm font-bold ${
                          selected ? "bg-white" : "bg-pink-soft"
                        }`}
                      >
                        {selected ? <Check className="h-4 w-4" strokeWidth={3.5} /> : n + 1}
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
                    className={`flex items-center gap-4 rounded-xl border-3 border-dashed border-ink px-4 py-4 text-left text-lg font-semibold transition-colors duration-100 ${
                      showCustom ? "bg-pink-soft" : "bg-white hover:bg-pink-wash"
                    }`}
                  >
                    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-3 border-ink bg-white">
                      <PenLine className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    Something else
                  </button>
                )}
              </div>

              {showCustom && (
                <div className="mt-5">
                  <label htmlFor="custom-answer" className="mb-2 block text-sm font-bold">
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
                    className="w-full rounded-xl border-3 border-ink bg-white px-5 py-4 text-lg font-medium shadow-nb placeholder:text-neutral-400 focus:shadow-nb-hover focus:outline-none"
                  />
                </div>
              )}
            </MotionDiv>
          </AnimatePresence>

          <div className="mt-auto flex items-center justify-between gap-3 pt-12">
            {index > 0 ? (
              <button type="button" onClick={() => go(index - 1)} className="nb-btn-white px-5">
                <ArrowLeft className="h-4 w-4" strokeWidth={3} aria-hidden />
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={next} disabled={!answered} className="nb-btn-pink px-8">
              {isLast ? "Draw her" : "Next"}
            </button>
          </div>
          <p className="mt-4 hidden text-right text-sm text-neutral-600 sm:block">
            Press 1 to {q.options.length + (q.custom ? 1 : 0)} to pick, Enter to continue.
          </p>
        </div>

        {/* Running list of answers. Desktop only. */}
        <aside className="hidden lg:block" aria-label="Your answers so far">
          <div className="nb-card sticky top-8 overflow-hidden">
            <div className="flex items-baseline justify-between border-b-3 border-ink bg-pink-soft px-5 py-3">
              <h2 className="font-bold">Your answers</h2>
              <span className="font-display text-xl">{progress}/10</span>
            </div>
            <ul className="flex flex-wrap gap-2 p-5">
              {questions.map((item, n) => {
                const a = answers[item.key]?.trim();
                return (
                  <li
                    key={item.key}
                    className={`rounded-full border-3 px-3 py-1 text-sm font-semibold ${
                      a ? "border-ink bg-white" : "border-dashed border-neutral-300 text-neutral-400"
                    } ${n === index ? "ring-2 ring-pink ring-offset-2" : ""}`}
                  >
                    {a || n + 1}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
