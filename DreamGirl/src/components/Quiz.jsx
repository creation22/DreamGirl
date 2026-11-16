import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, Check, PenLine } from "lucide-react";
import { Backdrop, Header } from "./Chrome";
import { questions } from "../constants/question";
import { NIGHT } from "../constants/night";
import { checkText } from "../utils/moderation";

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
  // Typed answers are checked as you type; the server checks again before drawing.
  const problem = checkText(value);
  const answered = value.trim() !== "" && !problem;
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

  const known = questions.map((item) => answers[item.key]?.trim()).filter(Boolean);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Backdrop />
      <Header onHome={onExit}>
        <p className="text-sm tabular-nums text-fog" aria-live="polite">
          {index + 1} of {questions.length}
        </p>
      </Header>

      {/* progress: a thin line of light */}
      <div className="h-px w-full bg-white/10" aria-hidden>
        <div
          className="h-full bg-light shadow-glow transition-[width] duration-700 ease-out"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-16 px-5 pb-10 pt-12 sm:px-10 sm:pt-16 lg:grid-cols-[1fr_340px] lg:gap-24">
        <div className="flex flex-col">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <MotionDiv
              key={q.key}
              custom={direction}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 * direction, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 * direction, filter: "blur(6px)" }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <h1 id="question" className="max-w-2xl font-display text-[clamp(2.3rem,5.6vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.02em] text-light">
                {q.question}
              </h1>

              <div role="radiogroup" aria-labelledby="question" className="mt-12 grid gap-3 sm:grid-cols-2">
                {q.options.map((option, n) => {
                  const selected = value === option && !showCustom;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(option)}
                      className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-[18px] text-left text-[17px] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.985] ${
                        selected
                          ? "border-light bg-light text-void shadow-glow"
                          : "border-white/[0.12] bg-white/[0.03] text-mist hover:border-white/45 hover:text-light"
                      }`}
                    >
                      <span>{option}</span>
                      <span aria-hidden className={`text-xs tabular-nums ${selected ? "text-void/60" : "text-fog/70"}`}>
                        {selected ? <Check className="h-4 w-4" strokeWidth={2.5} /> : n + 1}
                      </span>
                    </button>
                  );
                })}

                {q.custom && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={showCustom}
                    onClick={openCustom}
                    className={`flex items-center justify-between gap-4 rounded-2xl border border-dashed px-5 py-[18px] text-left text-[17px] transition-colors duration-200 ${
                      showCustom ? "border-light text-light" : "border-white/20 text-fog hover:border-white/50 hover:text-light"
                    }`}
                  >
                    <span>Something else</span>
                    <PenLine aria-hidden className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showCustom && (
                <div className="mt-9">
                  <label htmlFor="custom-answer" className="text-sm text-fog">
                    In your own words
                  </label>
                  <input
                    id="custom-answer"
                    ref={inputRef}
                    type="text"
                    maxLength={120}
                    value={value}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    placeholder="a red silk saree with a gold border"
                    aria-invalid={!!problem}
                    aria-describedby={problem ? "custom-problem" : undefined}
                    className="mt-2 w-full border-0 border-b border-white/40 bg-transparent px-0 py-3 font-display text-3xl italic text-light placeholder:text-white/20 focus:border-light focus:outline-none focus:ring-0"
                  />
                  {problem && (
                    <p id="custom-problem" className="mt-3 flex items-start gap-2 text-sm text-light" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      {problem}
                    </p>
                  )}
                </div>
              )}
            </MotionDiv>
          </AnimatePresence>

          <div className="mt-auto flex items-center justify-between gap-3 pt-14">
            {index > 0 ? (
              <button type="button" onClick={() => go(index - 1)} className="btn-ghost px-5">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-5">
              <p className="hidden text-sm text-fog md:block">Keys 1 to {q.options.length + (q.custom ? 1 : 0)}, then Enter</p>
              <button type="button" onClick={next} disabled={!answered} className={isLast ? "btn-light px-8" : "btn-ghost px-8"}>
                {isLast ? "Bring her to life" : "Next"}
              </button>
            </div>
          </div>
        </div>

        {/* Her, still a glow, with what you've told us so far. Desktop only. */}
        <aside className="hidden lg:block" aria-label="What you've told us about her">
          <div className="sticky top-10">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[28px] shadow-halo">
              <img src={NIGHT.glow} alt="" className="h-full w-full animate-breathe object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-6 font-display text-xl italic leading-snug text-light">
                {known.length ? known.map((k) => k.toLowerCase()).join(", ") : "Tell us about her."}
              </p>
            </div>
            <p className="mt-5 text-center text-sm tabular-nums text-fog">
              {known.length} of 10 known
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
