import { useCallback, useEffect, useState } from "react";
import { Flag, Search } from "lucide-react";
import { Header } from "./Chrome";
import { listPortraits, reportPortrait } from "../lib/api";
import { Link, navigate, userPath } from "../lib/router";
import { normalizeHandle } from "../utils/moderation";
import { usd } from "../utils/money";
import PriceTag from "./PriceTag";
import { useSurplusStats } from "./SurplusStats";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let v = s;
  for (const [size, unit] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return "";
}

function PortraitCard({ item, showUser }) {
  const [broken, setBroken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const report = async () => {
    if (!window.confirm("Report this portrait? Three reports hide it from the gallery.")) return;
    setBusy(true);
    try {
      await reportPortrait(item.id);
      setNote("Reported. Thanks.");
    } catch (e) {
      setNote(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="nb-card flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden border-b-3 border-ink bg-pink-wash">
        {broken ? (
          <p className="grid h-full place-items-center p-4 text-center text-sm font-semibold text-neutral-600">
            This picture didn't load. Try again in a minute.
          </p>
        ) : (
          <img
            src={item.imageUrl}
            alt={`AI portrait by @${item.username}: ${item.caption}`}
            loading="lazy"
            width="768"
            height="768"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        )}
        {/* Bottom-left: faces sit in the upper half of nearly every portrait. */}
        <PriceTag costMicro={item.costMicro} listMicro={item.listMicro} className="absolute bottom-2 left-2" />
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-pink-soft px-3 py-2.5">
        {/* Typed answers can run long; three lines keeps the cards an even height. */}
        <p className="line-clamp-3 text-xs font-semibold leading-snug sm:text-sm" title={item.caption}>
          {item.caption}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 text-xs">
          <span className="min-w-0 truncate">
            {showUser && (
              <>
                <Link to={userPath(item.username)} className="font-bold underline decoration-2 underline-offset-2 hover:text-pink-deep">
                  @{item.username}
                </Link>{" "}
              </>
            )}
            {/* On a narrow card there's no room beside the username, and the name matters more.
                On the one-user page there's no name here, so the time stays. */}
            <span className={showUser ? "hidden text-neutral-700 sm:inline" : "text-neutral-700"}>{timeAgo(item.createdAt)}</span>
          </span>
          <button
            type="button"
            onClick={report}
            disabled={busy || !!note}
            aria-label={`Report portrait by @${item.username}`}
            className="-my-1.5 flex shrink-0 items-center gap-1 py-1.5 font-semibold text-neutral-700 hover:text-pink-deep disabled:opacity-50"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Report
          </button>
        </div>
        {note && <p className="text-xs font-semibold text-pink-deep" role="status">{note}</p>}
      </div>
    </li>
  );
}

function FindUser({ initial = "" }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const h = normalizeHandle(value);
        if (!h) return setError("Type an X username, like @yourname.");
        setError("");
        navigate(userPath(h));
      }}
      className="w-full max-w-sm"
    >
      <label htmlFor="find-user" className="text-sm font-bold">
        Find someone's portraits
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="find-user"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@username"
          autoCapitalize="none"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border-3 border-ink bg-white px-4 py-2.5 font-semibold shadow-nb-sm outline-none focus:shadow-nb"
        />
        <button type="submit" className="nb-btn-white px-4 py-2.5" aria-label="Search">
          <Search className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-pink-deep">{error}</p>}
    </form>
  );
}

export default function Gallery({ handle: rawHandle, onStart }) {
  const stats = useSurplusStats();
  const handle = rawHandle ? normalizeHandle(rawHandle) : null;
  const invalid = rawHandle && !handle;
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (before) => {
      const data = await listPortraits({ user: handle || undefined, before });
      setItems((prev) => (before ? [...prev, ...data.items] : data.items));
      setNext(data.nextBefore);
    },
    [handle],
  );

  useEffect(() => {
    if (invalid) return;
    let live = true;
    setState("loading");
    setItems([]);
    load()
      .then(() => live && setState("ready"))
      .catch((e) => {
        if (!live) return;
        setError(e.message);
        setState("error");
      });
    return () => {
      live = false;
    };
  }, [load, invalid]);

  const more = async () => {
    setLoadingMore(true);
    try {
      await load(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    document.title = handle ? `@${handle}'s portraits | DreamHer` : "Public gallery | DreamHer";
    return () => {
      document.title = "DreamHer: describe her, we'll draw her";
    };
  }, [handle]);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            {handle ? (
              <>
                <Link to="/gallery" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-pink-deep">
                  All portraits
                </Link>
                <h1 className="mt-3 break-all font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-[1.05]">@{handle}</h1>
                <p className="mt-3 text-lg text-neutral-700">
                  Portraits posted under this name.{" "}
                  <a
                    href={`https://x.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-pink-deep"
                  >
                    Open @{handle} on X
                  </a>
                </p>
                <p className="mt-1 text-sm text-neutral-600">Usernames are typed in by visitors and aren't verified.</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-[1.05]">Public gallery</h1>
                <p className="mt-3 max-w-xl text-lg text-neutral-700">
                  Every portrait drawn on DreamHer, newest first, with the X username of who made it.
                  The tag on each one is what it cost to draw.
                </p>
                {stats && (
                  <p className="mt-4 inline-block rounded-lg border-3 border-ink bg-pink-soft px-3 py-1.5 text-sm font-bold shadow-nb-sm">
                    {stats.portraits.toLocaleString("en-US")} {stats.portraits === 1 ? "portrait" : "portraits"} for {usd(stats.costMicro)} in total
                    {stats.listMicro > stats.costMicro && <> (list price {usd(stats.listMicro)})</>}
                  </p>
                )}
              </>
            )}
          </div>
          <FindUser key={handle || "all"} initial={handle ? `@${handle}` : ""} />
        </div>

        <div className="mt-12">
          {invalid && <Empty title="That isn't an X username." body="Usernames use letters, numbers and _ (up to 15)." onStart={onStart} />}
          {!invalid && state === "loading" && (
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading portraits">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="nb-card aspect-[4/5] animate-pulse bg-pink-wash" />
              ))}
            </ul>
          )}
          {!invalid && state === "error" && (
            <div className="nb-card max-w-lg p-6" role="alert">
              <p className="font-display text-xl">The gallery didn't load.</p>
              <p className="mt-2 text-neutral-700">{error}</p>
            </div>
          )}
          {!invalid && state === "ready" && items.length === 0 && (
            <Empty
              title={handle ? `No portraits from @${handle} yet.` : "No portraits yet."}
              body={handle ? "If this is you, answer the 10 questions and she'll show up here." : "Be the first: answer the 10 questions and your portrait lands here."}
              onStart={onStart}
            />
          )}
          {!invalid && items.length > 0 && (
            <>
              <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <PortraitCard key={item.id} item={item} showUser={!handle} />
                ))}
              </ul>
              {next && (
                <div className="mt-10 flex justify-center">
                  <button type="button" onClick={more} disabled={loadingMore} className="nb-btn-white">
                    {loadingMore ? "Loading..." : "Load more portraits"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Empty({ title, body, onStart }) {
  return (
    <div className="nb-card max-w-xl p-8">
      <p className="font-display text-2xl">{title}</p>
      <p className="mt-3 text-neutral-700">{body}</p>
      <button type="button" onClick={onStart} className="nb-btn-pink mt-6">
        Start the 10 questions
      </button>
    </div>
  );
}
