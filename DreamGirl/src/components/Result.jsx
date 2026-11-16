import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Download, ImageDown, PencilLine, RefreshCw, RotateCcw, Share2 } from "lucide-react";
import { Backdrop, Footer, Header } from "./Chrome";
import { NIGHT } from "../constants/night";
import { captionFor } from "../constants/question";
import { attachUsername, generatePortrait, removePortrait } from "../lib/api";
import { forgetOwned, rememberOwned } from "../lib/me";
import { Link, userPath } from "../lib/router";
import { SURPLUS_URL, savedPct, usd } from "../utils/money";
import { downloadShareCard } from "../utils/shareCard";

const SITE = "https://dreamher.vercel.app";

function photoHref(url, id) {
  if (url.startsWith("data:")) return url; // local dev
  return `${url}${url.includes("?") ? "&" : "?"}download=dreamher-${id.slice(0, 8)}`;
}

/** What it cost to bring her to life on Surplus, against the model's list price. */
function Price({ receipt }) {
  const saved = savedPct(receipt.costMicro, receipt.listMicro);
  return (
    <section className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.03] p-7 sm:p-8" aria-label="What she cost">
      <p className="text-sm text-fog">Brought to life on Surplus Intelligence for</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <p className="glow-text font-display text-6xl font-normal leading-none tracking-[-0.03em] text-light tabular-nums sm:text-7xl">
          {receipt.costMicro > 0 ? usd(receipt.costMicro) : "about 1¢"}
        </p>
        {receipt.listMicro > 0 && (
          <p className="text-fog">
            list price <span className="line-through">{usd(receipt.listMicro)}</span>
            {saved !== null && <span className="text-light">, {saved}% less</span>}
          </p>
        )}
      </div>
      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
        <div>
          <dt className="text-fog">Model</dt>
          <dd className="mt-1 text-light">{receipt.modelLabel}</dd>
        </div>
        <div>
          <dt className="text-fog">Painted in</dt>
          <dd className="mt-1 tabular-nums text-light">{receipt.seconds} seconds</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm leading-relaxed text-fog">
        Surplus sends every request to the cheapest provider with spare capacity.{" "}
        <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="text-link">
          Get these prices for your app
        </a>
      </p>
    </section>
  );
}

export default function Result({ answers, handle, onAskHandle, onRestart, onEdit }) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null); // {item, token, posted, receipt, prompt}
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now);
  const [now, setNow] = useState(Date.now);
  const [post, setPost] = useState({ state: "idle", msg: "" }); // idle | posting | posted | removed | error
  const [saving, setSaving] = useState("");
  const started = useRef(-1);
  const current = useRef(0);

  // One request per attempt. The ref guard also stops StrictMode from painting (and paying) twice.
  useEffect(() => {
    if (started.current === attempt) return;
    started.current = attempt;
    current.current = attempt;
    setStatus("loading");
    setError("");
    setData(null);
    setPost({ state: "idle", msg: "" });
    setStartedAt(Date.now());
    generatePortrait(answers, handle)
      .then((d) => {
        rememberOwned(d.item.id, d.token);
        if (current.current !== attempt) return;
        setData(d);
        setPost(d.posted ? { state: "posted", msg: "" } : { state: "idle", msg: "" });
        setStatus("ready");
      })
      .catch((e) => {
        if (current.current !== attempt) return;
        setError(e.message);
        setStatus("error");
      });
    // handle is read once per painting on purpose; adding it later posts via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, answers]);

  useEffect(() => {
    if (status !== "loading") return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [status]);

  const postAs = useCallback(
    async (name) => {
      if (!data) return;
      setPost({ state: "posting", msg: "" });
      try {
        const r = await attachUsername(data.item.id, data.token, name);
        setData((d) => ({ ...d, item: r.item, posted: true }));
        setPost({ state: "posted", msg: "" });
      } catch (e) {
        setPost({ state: "error", msg: e.message });
      }
    },
    [data],
  );

  // Username added after she was painted: put her in the gallery now.
  useEffect(() => {
    if (status === "ready" && handle && data && !data.posted && post.state === "idle") postAs(handle);
  }, [status, handle, data, post.state, postAs]);

  const remove = async () => {
    if (!data || !window.confirm("Take her out of the gallery? The picture is deleted.")) return;
    try {
      await removePortrait(data.item.id, data.token);
      forgetOwned(data.item.id);
      setData((d) => ({ ...d, posted: false }));
      setPost({ state: "removed", msg: "" });
    } catch (e) {
      setPost({ state: "error", msg: e.message });
    }
  };

  const saveCard = async () => {
    if (!data) return;
    setSaving("Making your card...");
    try {
      await downloadShareCard(
        {
          image: data.item.imageUrl,
          caption: data.item.caption,
          costMicro: data.receipt.costMicro,
          handle: data.posted ? data.item.username : null,
        },
        `dreamher-${data.item.id.slice(0, 8)}.png`,
      );
      setSaving("");
    } catch (e) {
      setSaving(e.message);
    }
  };

  const share = async () => {
    const posted = data?.posted && data.item.username;
    const url = posted ? `${SITE}${userPath(data.item.username)}` : SITE;
    const price = data?.receipt?.costMicro ? usd(data.receipt.costMicro) : "about a cent";
    const text = `I described her and she stepped out of the light. Brought to life on Surplus Intelligence for ${price}.`;
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
  const ready = status === "ready" && data;

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Backdrop />
      <Header onHome={onRestart} />

      <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-14 px-5 pb-20 pt-10 sm:px-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-24 lg:pt-16">
        <div className="mx-auto w-full max-w-[520px] lg:sticky lg:top-10">
          <div className="relative aspect-square overflow-hidden rounded-[32px] bg-ash shadow-halo">
            {ready && (
              <img
                key={data.item.id}
                src={data.item.imageUrl}
                alt={`AI portrait: ${caption}`}
                width="1024"
                height="1024"
                className="h-full w-full animate-emerge object-cover"
              />
            )}
            {loading && (
              <div className="absolute inset-0" role="status">
                <img src={NIGHT.glow} alt="" className="h-full w-full animate-breathe object-cover object-[50%_35%]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="font-display text-3xl italic text-light">She's stepping out of the light</p>
                  <p className="mt-2 text-sm tabular-nums text-fog">
                    {elapsed}s {elapsed > 20 ? "(almost here)" : "(usually 5 to 20 seconds)"}
                  </p>
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="absolute inset-0 grid place-items-center p-10 text-center" role="alert">
                <div>
                  <AlertCircle className="mx-auto h-6 w-6 text-light" aria-hidden />
                  <p className="mt-4 font-display text-3xl italic text-light">She didn't come through.</p>
                  <p className="mt-3 text-sm leading-relaxed text-fog">{error}</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-5 font-display text-xl italic text-mist">{ready ? data.item.caption : caption}</p>
        </div>

        <div className="max-w-xl">
          <h1 className="glow-text font-display text-[clamp(2.8rem,6.6vw,5.2rem)] font-normal leading-[0.98] tracking-[-0.025em] text-light">
            {ready ? "There she is." : status === "error" ? "The light flickered." : "Almost here."}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-fog">
            {status === "error"
              ? "Your answers are kept. Try again, or change an answer first."
              : "Not quite her? Dream her again for a new take on the same answers, or change an answer."}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={saveCard} disabled={!ready || !!saving} className="btn-light px-7">
              <Download className="h-4 w-4" aria-hidden />
              Download
            </button>
            <button type="button" onClick={() => setAttempt((n) => n + 1)} disabled={loading} className={status === "error" ? "btn-light" : "btn-ghost"}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              {status === "error" ? "Try again" : "Dream her again"}
            </button>
            <button type="button" onClick={share} disabled={!ready} className="btn-ghost">
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fog">
            {ready && (
              <a href={photoHref(data.item.imageUrl, data.item.id)} download="dreamher-photo.png" className="inline-flex items-center gap-1.5 hover:text-light">
                <ImageDown className="h-4 w-4" aria-hidden />
                Photo only
              </a>
            )}
            {saving && <span role="status">{saving}</span>}
          </div>

          {ready && (
            <div className="mt-8 text-[15px] text-mist" role="status">
              {post.state === "posted" && (
                <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span>
                    She's in the gallery, dreamed up by <span className="text-light">@{data.item.username}</span>.
                  </span>
                  <Link to={userPath(data.item.username)} className="text-link">
                    See yours
                  </Link>
                  <button type="button" onClick={remove} className="text-fog underline decoration-white/20 underline-offset-[5px] hover:text-light">
                    Take her down
                  </button>
                </p>
              )}
              {post.state === "posting" && <p>Adding her to the gallery...</p>}
              {post.state === "removed" && <p>Taken down and deleted.</p>}
              {post.state === "error" && <p className="text-light">{post.msg}</p>}
              {post.state === "idle" && !handle && (
                <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span>Add your X username to put her in the gallery.</span>
                  <button type="button" onClick={onAskHandle} className="text-link">
                    Add username
                  </button>
                </p>
              )}
            </div>
          )}

          {ready && data.receipt && <Price receipt={data.receipt} />}

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
            <button type="button" onClick={onEdit} className="text-link">
              <PencilLine className="h-4 w-4" aria-hidden />
              Change answers
            </button>
            <button type="button" onClick={onRestart} className="text-link">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Start over
            </button>
          </div>

          {data?.prompt && (
            <details className="mt-10 border-t border-white/10 pt-5 text-sm">
              <summary className="cursor-pointer list-none text-fog hover:text-light [&::-webkit-details-marker]:hidden">
                Read what we asked the painter for
              </summary>
              <p className="mt-3 leading-relaxed text-fog">{data.prompt}</p>
            </details>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
