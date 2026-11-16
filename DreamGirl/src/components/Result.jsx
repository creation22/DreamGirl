import { useEffect, useMemo, useState } from "react";
import { Download, PencilLine, RefreshCw, RotateCcw, Share2 } from "lucide-react";
import { Header, Photo } from "./Chrome";
import { LINKS } from "../constants/links";
import { generatePrompt, imageUrlFor } from "../utils/generateprompt";
import { captionFor } from "../constants/question";

const TIMEOUT_MS = 90_000;
const SITE = "https://dreamher.vercel.app";
const newSeed = () => Math.floor(Math.random() * 1_000_000);

// Pollinations' free tier draws one image per 45 seconds per visitor, counted from when the
// last one finished. A request inside that window returns HTTP 503 with a yellow
// "Free limit reached" picture, and <img> can't see the status, so we pace drawings
// ourselves. (fetch() can't be used to check: Pollinations answers page fetches with
// 403 "Missing Turnstile token".) Kept in sessionStorage so Start over can't skip the wait.
const COOLDOWN_MS = 47_000;
const LAST_DRAW_KEY = "dreamher:lastDrawAt";
let lastDrawInMemory = 0;
function lastDrawAt() {
  try {
    return Number(sessionStorage.getItem(LAST_DRAW_KEY)) || lastDrawInMemory;
  } catch {
    return lastDrawInMemory;
  }
}
function markDraw(t) {
  lastDrawInMemory = t;
  try {
    sessionStorage.setItem(LAST_DRAW_KEY, String(t));
  } catch {
    /* storage blocked: the in-memory value still paces this tab */
  }
}

export default function Result({ answers, onRestart, onEdit }) {
  const prompt = useMemo(() => generatePrompt(answers), [answers]);
  const [seed, setSeed] = useState(newSeed);
  const [status, setStatus] = useState("waiting"); // waiting | loading | ready | error
  const [imageUrl, setImageUrl] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!prompt) {
      setStatus("error");
      return;
    }
    const url = imageUrlFor(prompt, seed);
    const img = new Image();
    let timeout;

    const start = () => {
      const t = Date.now();
      markDraw(t);
      setStartedAt(t);
      setNow(t);
      setStatus("loading");
      timeout = setTimeout(() => {
        img.onload = img.onerror = null;
        img.src = "";
        setStatus("error");
      }, TIMEOUT_MS);
      img.onload = () => {
        clearTimeout(timeout);
        markDraw(Date.now());
        setImageUrl(url);
        setStatus("ready");
      };
      img.onerror = () => {
        clearTimeout(timeout);
        markDraw(Date.now());
        setStatus("error");
      };
      img.src = url;
    };

    const wait = Math.max(0, lastDrawAt() + COOLDOWN_MS - Date.now());
    setStatus(wait > 0 ? "waiting" : "loading");
    const delay = setTimeout(start, wait);

    return () => {
      clearTimeout(delay);
      clearTimeout(timeout);
      img.onload = img.onerror = null;
    };
  }, [prompt, seed]);

  const cooldownLeft = Math.max(0, Math.ceil((lastDrawAt() + COOLDOWN_MS - now) / 1000));
  const elapsed = Math.max(0, Math.round((now - startedAt) / 1000));
  const busy = status === "waiting" || status === "loading";
  const drawAgain = () => setSeed(newSeed());

  const share = async () => {
    const text = "I described my dream girl and DreamHer drew her. Try it:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "DreamHer", text, url: SITE });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE)}`;
    window.open(intent, "_blank", "noopener");
  };

  const caption = captionFor(answers) || "your dream girl";

  return (
    <div className="flex min-h-[100svh] flex-col overflow-x-clip">
      <Header onHome={onRestart} />

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20 lg:pt-10">
        <div className="relative mx-auto w-full max-w-[460px]">
          <div aria-hidden className="pointer-events-none absolute -inset-12 rounded-full bg-rose/15 blur-3xl" />
          <Photo caption={caption} className="relative -rotate-1">
            {status === "ready" && (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={`AI portrait: ${caption}`}
                width="768"
                height="768"
                className="h-full w-full animate-develop object-cover"
              />
            )}
            {busy && (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(110deg,#251842_30%,#3a2a66_50%,#251842_70%)] bg-[length:200%_100%] px-6 text-center animate-shimmer"
                role="status"
              >
                {status === "waiting" ? (
                  <>
                    <span className="font-hand text-4xl text-blush">starting in {cooldownLeft}s</span>
                    <span className="max-w-[17rem] text-sm leading-relaxed text-lavender">
                      The free drawing service allows one portrait every 45 seconds.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-hand text-4xl text-blush">drawing her...</span>
                    <span className="text-sm tabular-nums text-lavender">
                      {elapsed}s {elapsed > 25 ? "(busy right now, still going)" : "(usually 10 to 30 seconds)"}
                    </span>
                  </>
                )}
              </div>
            )}
            {status === "error" && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-dusk p-6 text-center" role="alert">
                <p className="text-lg font-semibold text-film">The portrait didn't come back.</p>
                <p className="max-w-[18rem] text-sm leading-relaxed text-lavender">
                  The drawing service is busy or timed out. Your answers are kept, so trying again
                  takes one tap.
                </p>
                <button type="button" onClick={drawAgain} className="btn-primary px-6 py-3 text-sm">
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Try again
                </button>
              </div>
            )}
          </Photo>
        </div>

        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
            {status === "ready" ? "Here she is." : status === "error" ? "Almost there." : "She's on her way."}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-lavender">
            Not quite her? Draw her again for a new take on the same answers, or change an answer.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {status === "ready" ? (
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Download className="h-5 w-5" aria-hidden />
                Open full size
              </a>
            ) : (
              <button type="button" disabled className="btn-primary">
                <Download className="h-5 w-5" aria-hidden />
                Open full size
              </button>
            )}
            <button
              type="button"
              onClick={drawAgain}
              disabled={busy || cooldownLeft > 0}
              className="btn-quiet tabular-nums disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {!busy && cooldownLeft > 0 ? `Draw her again in ${cooldownLeft}s` : "Draw her again"}
            </button>
            <button type="button" onClick={share} className="btn-quiet">
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
          </div>
          <p className="mt-3 text-sm text-lavender/80">
            Full size opens in a new tab to save. Seeing a yellow "limit reached" card? Wait for the
            countdown, then draw her again.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-lavender hover:text-film">
              <PencilLine className="h-4 w-4" aria-hidden />
              Change answers
            </button>
            <button type="button" onClick={onRestart} className="inline-flex items-center gap-1.5 text-lavender hover:text-film">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Start over
            </button>
          </div>

          {prompt && (
            <details className="mt-10 border-t border-twilight pt-5 text-sm">
              <summary className="cursor-pointer font-medium text-blush">See the description we sent</summary>
              <p className="mt-3 leading-relaxed text-lavender">{prompt.positive}</p>
            </details>
          )}

          <p className="mt-10 text-sm text-lavender">
            Enjoying it?{" "}
            <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className="text-blush underline underline-offset-4 hover:text-film">
              Tell me what to add
            </a>{" "}
            or{" "}
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="text-blush underline underline-offset-4 hover:text-film">
              star the repo
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
