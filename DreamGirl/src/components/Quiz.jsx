import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, PenLine, Sparkles } from "lucide-react";
import { Header } from "./Chrome";
import { LABELS, SWATCHES, questions } from "../constants/question";
import { NIGHT } from "../constants/night";
import { checkText } from "../utils/moderation";

const EASE_OUT = [0.22, 1, 0.36, 1];
// How long a picked answer stays on screen before the next question slides in.
const ADVANCE_MS = 360;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const pad = (n) => String(n).padStart(2, "0");
const clean = (answers) => Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.trim()]));

export default function Quiz({ initialAnswers = {}, onComplete, onExit }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  // The option that was just tapped, while it pops before the next question.
  const [picked, setPicked] = useState(null);
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
  const swatches = SWATCHES[q.key];
  const progress = questions.filter((item) => answers[item.key]?.trim()).length;
  // Steps you can jump to: everything answered, plus the first unanswered one.
  const reachable = (n) => questions.slice(0, n).every((item) => answers[item.key]?.trim());

  // The question on screen right now. A question sliding out still takes clicks for a
  // moment, through its old handlers; this lets those clicks be told apart and ignored.
  const shownIndex = useRef(index);
  useEffect(() => {
    shownIndex.current = index;
  }, [index]);

  const go = useCallback((target) => {
    clearTimeout(advanceTimer.current);
    setPicked(null);
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  }, [index]);

  // Never draw with gaps: if anything is unanswered, go there instead.
  const finish = useCallback((all) => {
    const missing = questions.findIndex((item) => !all[item.key]?.trim() || checkText(all[item.key]));
    if (missing >= 0) {
      setPicked(null);
      setDirection(-1);
      setIndex(missing);
      return;
    }
    onComplete(clean(all));
  }, [onComplete]);

  const next = useCallback(() => {
    if (!answered) return;
    if (isLast) {
      clearTimeout(advanceTimer.current);
      finish(answers);
    } else go(index + 1);
  }, [answered, isLast, finish, answers, go, index]);

  // One tap per question: the pick pops, then the next question slides in.
  // On the last question the tap sends her off to be painted.
  const choose = useCallback((option) => {
    const at = index;
    if (at !== shownIndex.current) return; // a tap on the question sliding out
    const updated = { ...answers, [q.key]: option };
    setAnswers(updated);
    setCustomOpen((prev) => ({ ...prev, [q.key]: false }));
    setPicked(option);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setPicked(null);
      if (at === questions.length - 1) {
        finish(updated);
        return;
      }
      // To the question after this one, never "one more than wherever we are now".
      setDirection(1);
      setIndex(at + 1);
    }, ADVANCE_MS);
  }, [index, answers, q.key, finish]);

  const openCustom = () => {
    clearTimeout(advanceTimer.current);
    setPicked(null);
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
      // 1-9 pick the first nine answers, 0 the tenth.
      const idx = e.key === "0" ? 9 : /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : -1;
      // preventDefault so the digit isn't typed into the text box that may open.
      if (idx >= 0 && idx < q.options.length) {
        e.preventDefault();
        choose(q.options[idx]);
      } else if (q.custom && idx === q.options.length) {
        e.preventDefault();
        openCustom();
      } else if (e.key === "Enter" && answered && document.activeElement?.tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex min-h-[100svh] flex-col bg-pink-wash">
      <Header onHome={onExit}>
        <p className="rounded-full border-3 border-ink bg-white px-3 py-1 text-sm font-bold tabular-nums" aria-live="polite">
          {progress}/{questions.length} answered
        </p>
      </Header>

      {/* steps: tap any answered one to go back to it */}
      <nav className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6" aria-label="Questions">
        <ol className="flex gap-1.5 sm:gap-2">
          {questions.map((item, n) => {
            const done = !!answers[item.key]?.trim();
            const current = n === index;
            const canGo = reachable(n) && !current;
            return (
              <li key={item.key} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => canGo && go(n)}
                  disabled={!canGo}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Question ${n + 1}: ${LABELS[item.key]}`}
                  className="group block w-full text-left disabled:cursor-default"
                >
                  <span
                    className={`block h-3 rounded-full border-3 border-ink transition-colors duration-200 ${
                      current ? "bg-ink" : done ? "bg-pink group-enabled:group-hover:bg-pink-deep" : "bg-white"
                    }`}
                  />
                  <span
                    className={`mt-1.5 hidden truncate text-xs font-bold md:block ${
                      current ? "text-ink" : done ? "text-neutral-700" : "text-neutral-400"
                    }`}
                  >
                    {LABELS[item.key]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1fr_300px] lg:gap-14">
        <div className="flex flex-col">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <MotionDiv
              key={q.key}
              custom={direction}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <p className="inline-flex items-center gap-2 rounded-lg border-3 border-ink bg-white px-2.5 py-1 text-sm font-bold shadow-nb-sm">
                <span className="font-display tabular-nums">{pad(index + 1)}</span>
                <span className="text-neutral-400">/</span>
                <span className="tabular-nums text-neutral-500">{pad(questions.length)}</span>
                <span className="ml-1 rounded bg-pink px-1.5 py-px text-xs uppercase tracking-wider">{LABELS[q.key]}</span>
              </p>
              <h1 id="question" className="mt-5 max-w-2xl font-display text-[clamp(2.1rem,7vw,3.5rem)] leading-[1.04]">
                {q.question}
              </h1>
              <p className="mt-3 text-[15px] font-medium text-neutral-600">
                {isLast ? "Tap one and she'll be painted straight away." : "Tap one and we'll move on."}
              </p>

              <div role="radiogroup" aria-labelledby="question" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {q.options.map((option, n) => {
                  const selected = value === option && !showCustom;
                  const popping = picked === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(option)}
                      className={`group relative flex min-h-[64px] items-center gap-3 rounded-xl border-3 border-ink px-3 py-3 text-left text-[15px] font-bold leading-snug transition-[transform,box-shadow,background-color] duration-100 ease-out sm:min-h-[72px] sm:px-4 sm:text-base ${
                        selected
                          ? "translate-x-1 translate-y-1 bg-pink shadow-none"
                          : "bg-white shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pink-soft hover:shadow-nb-hover active:translate-x-1 active:translate-y-1 active:shadow-none"
                      }`}
                    >
                      {swatches?.[option] ? (
                        <span
                          aria-hidden
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-3 border-ink"
                          style={{ background: swatches[option] }}
                        >
                          {selected && (
                            <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-white">
                              <Check className="h-3 w-3" strokeWidth={4} />
                            </span>
                          )}
                        </span>
                      ) : (
                        <span
                          aria-hidden
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-3 border-ink text-xs font-bold tabular-nums transition-colors ${
                            selected ? "bg-white" : "bg-pink-wash group-hover:bg-white"
                          }`}
                        >
                          {selected ? <Check className="h-4 w-4" strokeWidth={3.5} /> : n < 9 ? n + 1 : n === 9 ? 0 : "·"}
                        </span>
                      )}
                      <span className="min-w-0">{option}</span>
                      {/* the pick pops, so the tap is felt before the page moves */}
                      {popping && !reduce && (
                        <MotionSpan
                          aria-hidden
                          className="pointer-events-none absolute inset-[-3px] rounded-xl border-3 border-ink"
                          initial={{ opacity: 0.9, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.08 }}
                          transition={{ duration: 0.35, ease: EASE_OUT }}
                        />
                      )}
                    </button>
                  );
                })}

                {q.custom && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={showCustom}
                    onClick={openCustom}
                    className={`flex min-h-[64px] items-center gap-3 rounded-xl border-3 border-dashed border-ink px-3 py-3 text-left text-[15px] font-bold leading-snug transition-colors duration-100 sm:min-h-[72px] sm:px-4 sm:text-base ${
                      showCustom ? "bg-pink-soft" : "bg-transparent hover:bg-white"
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
                <div className="mt-6">
                  <label htmlFor="custom-answer" className="mb-2 block text-sm font-bold">
                    In your own words
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="custom-answer"
                      ref={inputRef}
                      type="text"
                      maxLength={120}
                      value={value}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                      placeholder="Describe it, then press Enter"
                      aria-invalid={!!problem}
                      aria-describedby={problem ? "custom-problem" : undefined}
                      className="min-w-0 flex-1 rounded-xl border-3 border-ink bg-white px-4 py-3.5 text-lg font-medium shadow-nb placeholder:text-neutral-400 focus:shadow-nb-hover focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={next}
                      disabled={!answered}
                      className="nb-btn-pink shrink-0 px-5"
                      aria-label={isLast ? "Draw her" : "Next question"}
                    >
                      {isLast ? <Sparkles className="h-5 w-5" strokeWidth={2.5} /> : <ArrowRight className="h-5 w-5" strokeWidth={3} />}
                    </button>
                  </div>
                  {problem && (
                    <p id="custom-problem" className="mt-3 text-sm font-semibold text-pink-deep" role="alert">
                      {problem}
                    </p>
                  )}
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
            {/* only needed when coming back to a question that's already answered */}
            {answered && !showCustom && !picked && (
              <button type="button" onClick={next} className={isLast ? "nb-btn-pink px-7" : "nb-btn-white px-5"}>
                {isLast ? "Draw her" : "Keep this one"}
                {isLast ? <Sparkles className="h-4 w-4" strokeWidth={3} aria-hidden /> : <ArrowRight className="h-4 w-4" strokeWidth={3} aria-hidden />}
              </button>
            )}
          </div>
          <p className="mt-4 hidden text-right text-sm text-neutral-500 sm:block">
            Keys {q.options.length + (q.custom ? 1 : 0) <= 9 ? `1 to ${q.options.length + (q.custom ? 1 : 0)}` : "1 to 9 and 0"} pick an answer.
          </p>
        </div>

        {/* Running list of answers. Desktop only. */}
        <aside className="hidden lg:block" aria-label="Your answers so far">
          <div className="nb-card sticky top-8 overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden border-b-3 border-ink bg-ink">
              <img
                src={NIGHT.glow}
                alt=""
                className="h-full w-full object-cover object-[50%_30%] transition-[filter] duration-500"
                // she glows brighter with every answer
                style={{ filter: `brightness(${0.55 + progress * 0.06}) contrast(1.1)` }}
              />
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-3 pt-8 text-sm font-medium text-white">
                {progress < questions.length ? "Still a glow. Keep describing her." : "Ready to step out of the light."}
              </p>
            </div>
            <div className="flex items-baseline justify-between border-b-3 border-ink bg-pink-soft px-5 py-3">
              <h2 className="font-bold">Your answers</h2>
              <span className="font-display text-xl tabular-nums">
                {progress}/{questions.length}
              </span>
            </div>
            <ul className="divide-y-2 divide-neutral-100 px-5 py-2">
              {questions.map((item, n) => {
                const a = answers[item.key]?.trim();
                const canGo = reachable(n) && n !== index;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => canGo && go(n)}
                      disabled={!canGo}
                      className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-sm enabled:hover:text-pink-deep disabled:cursor-default"
                    >
                      <span className={`shrink-0 font-bold ${n === index ? "text-pink-deep" : "text-neutral-500"}`}>{LABELS[item.key]}</span>
                      <span className={`truncate font-semibold ${a ? "text-ink" : "text-neutral-300"}`}>{a || "—"}</span>
                    </button>
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
