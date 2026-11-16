import { useEffect, useRef, useState } from "react";
import { Download, PencilLine, RefreshCw, RotateCcw, Share2 } from "lucide-react";
import { Header, Photo } from "./Chrome";
import { LINKS } from "../constants/links";
import { NIGHT } from "../constants/night";
import { captionFor } from "../constants/question";
import { generatePortrait } from "../lib/api";
import { Link, userPath } from "../lib/router";
import { SURPLUS_URL, savedPct, usd } from "../utils/money";

const SITE = "https://dreamher.vercel.app";

function downloadHref(url, id) {
  if (url.startsWith("data:")) return url; // local dev
  return `${url}${url.includes("?") ? "&" : "?"}download=dreamher-${id.slice(0, 8)}`;
}

/** What this portrait cost on Surplus, next to the list price. */
function Receipt({ receipt }) {
  const saved = savedPct(receipt.costMicro, receipt.listMicro);
  return (
    <div className="nb-card mt-8 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b-3 border-ink bg-pink-soft px-4 py-2.5">
        <h2 className="font-bold">What she cost to draw</h2>
        {saved !== null && (
          <span className="rounded-full border-3 border-ink bg-white px-2.5 py-0.5 text-sm font-bold">{saved}% off</span>
        )}
      </div>
      <dl className="divide-y-2 divide-dashed divide-neutral-300 px-4 text-sm">
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-700">Model</dt>
          <dd className="font-semibold">{receipt.modelLabel}</dd>
        </div>
        {receipt.listMicro > 0 && (
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-neutral-700">List price</dt>
            <dd className="font-semibold tabular-nums text-neutral-500 line-through decoration-2">{usd(receipt.listMicro)}</dd>
          </div>
        )}
        {receipt.costMicro > 0 && (
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="font-semibold">Paid on Surplus Intelligence</dt>
            <dd className="rounded-lg border-3 border-ink bg-pink px-2.5 py-1 font-display text-xl tabular-nums">{usd(receipt.costMicro)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-700">Drawing time</dt>
          <dd className="font-semibold tabular-nums">{receipt.seconds}s</dd>
        </div>
      </dl>
      <p className="border-t-3 border-ink px-4 py-3 text-sm leading-relaxed">
        Surplus routes every request to the cheapest healthy seller of spare AI capacity.{" "}
        <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-4 hover:text-pink-deep">
          Get these prices for your app
        </a>
      </p>
    </div>
  );
}

export default function Result({ answers, handle, onRestart, onEdit }) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null); // {item, receipt, prompt}
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now);
  const [now, setNow] = useState(Date.now);
  const started = useRef(-1);
  const current = useRef(0);

  // One request per attempt. The ref guard also stops StrictMode from drawing (and paying) twice.
  useEffect(() => {
    if (started.current === attempt) return;
    started.current = attempt;
    current.current = attempt;
    setStatus("loading");
    setError("");
    setData(null);
    setStartedAt(Date.now());
    generatePortrait(answers, handle)
      .then((d) => {
        if (current.current !== attempt) return;
        setData(d);
        setStatus("ready");
      })
      .catch((e) => {
        if (current.current !== attempt) return;
        setError(e.message);
        setStatus("error");
      });
    // handle is read once per drawing on purpose: a name change applies to the next portrait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, answers]);

  useEffect(() => {
    if (status !== "loading") return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [status]);

  const share = async () => {
    const url = data?.item.username ? `${SITE}${userPath(data.item.username)}` : SITE;
    const text = "I described my dream girl and DreamHer drew her for under a cent. Try it:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "DreamHer", text, url });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener");
  };

  const caption = captionFor(answers) || "your dream girl";
  const elapsed = Math.max(0, Math.round((now - startedAt) / 1000));
  const loading = status === "loading";
  const link = "inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4 hover:text-pink-deep";

  return (
    <div className="flex min-h-[100svh] flex-col overflow-x-clip">
      <Header onHome={onRestart} />

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20 lg:pt-14">
        <div className="mx-auto w-full max-w-[460px] lg:sticky lg:top-8">
          <Photo caption={caption} shadow="shadow-nb-lg" className="-rotate-1">
            {status === "ready" && data && (
              <img
                key={data.item.id}
                src={data.item.imageUrl}
                alt={`AI portrait: ${caption}`}
                width="1024"
                height="1024"
                className="h-full w-full animate-develop object-cover"
              />
            )}
            {loading && (
              <div className="relative h-full w-full bg-ink" role="status">
                <img src={NIGHT.glow} alt="" className="h-full w-full animate-pulse object-cover object-[50%_30%] [animation-duration:2.6s]" />
                <div className="nb-card absolute inset-x-4 bottom-4 px-4 py-3">
                  <p className="font-display text-xl">She's stepping out of the light</p>
                  <p className="mt-1 text-sm tabular-nums text-neutral-700">
                    {elapsed}s {elapsed > 20 ? "(almost there)" : "(usually 5 to 20 seconds)"}
                  </p>
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center" role="alert">
                <p className="font-display text-2xl">She wasn't drawn.</p>
                <p className="max-w-[18rem] text-sm leading-relaxed text-neutral-700">{error}</p>
                <button type="button" onClick={() => setAttempt((n) => n + 1)} className="nb-btn-pink text-sm">
                  <RefreshCw className="h-4 w-4" strokeWidth={3} aria-hidden />
                  Try again
                </button>
              </div>
            )}
          </Photo>
        </div>

        <div className="max-w-lg">
          <h1 className="font-display text-[clamp(2.4rem,8vw,3.75rem)] leading-[1.05]">
            {status === "ready" ? "Here she is." : status === "error" ? "Almost there." : "She's on her way."}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            Not quite her? Draw her again for a new take on the same answers, or change an answer.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {status === "ready" && data ? (
              <a href={downloadHref(data.item.imageUrl, data.item.id)} download="dreamher.png" className="nb-btn-pink">
                <Download className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                Download
              </a>
            ) : (
              <button type="button" disabled className="nb-btn-pink">
                <Download className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                Download
              </button>
            )}
            <button type="button" onClick={() => setAttempt((n) => n + 1)} disabled={loading} className="nb-btn-white">
              <RefreshCw className="h-4 w-4" strokeWidth={3} aria-hidden />
              Draw her again
            </button>
            <button type="button" onClick={share} disabled={loading} className="nb-btn-white">
              <Share2 className="h-4 w-4" strokeWidth={3} aria-hidden />
              Share
            </button>
          </div>

          {/* Every portrait goes in the public gallery under the visitor's username. */}
          {status === "ready" && data?.item.username && (
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border-3 border-dashed border-ink bg-pink-wash px-4 py-3 text-sm" role="status">
              <span>
                Posted to the public gallery as <strong>@{data.item.username}</strong>.
              </span>
              <Link to={userPath(data.item.username)} className={link}>
                See your page
              </Link>
            </p>
          )}

          {status === "ready" && data?.receipt && <Receipt receipt={data.receipt} />}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <button type="button" onClick={onEdit} className={link}>
              <PencilLine className="h-4 w-4" aria-hidden />
              Change answers
            </button>
            <button type="button" onClick={onRestart} className={link}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Start over
            </button>
          </div>

          {data?.prompt && (
            <details className="nb-card group mt-8 overflow-hidden text-sm">
              <summary className="cursor-pointer list-none px-4 py-3 font-bold group-open:border-b-3 group-open:border-ink group-open:bg-pink-soft [&::-webkit-details-marker]:hidden">
                See the description we sent
              </summary>
              <p className="px-4 py-3 leading-relaxed text-neutral-700">{data.prompt}</p>
            </details>
          )}

          <p className="mt-8 text-sm text-neutral-700">
            Enjoying it?{" "}
            <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className={link}>
              Tell me what to add
            </a>{" "}
            or{" "}
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={link}>
              star the repo
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
