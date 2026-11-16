import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Backdrop, Footer, Header } from "./Chrome";
import { listPortraits, removePortrait, reportPortrait } from "../lib/api";
import { forgetOwned, ownedToken } from "../lib/me";
import { Link, navigate, userPath } from "../lib/router";
import { normalizeHandle } from "../utils/moderation";
import { SURPLUS_URL, usd } from "../utils/money";
import { useSurplusStats } from "../lib/useSurplusStats";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso) {
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let v = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [size, unit] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return "";
}

function Portrait({ item, showUser, onGone }) {
  const [broken, setBroken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const token = ownedToken(item.id);

  const report = async () => {
    if (!window.confirm("Report this portrait? Three reports take it out of the gallery.")) return;
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

  const remove = async () => {
    if (!window.confirm("Take her out of the gallery? The picture is deleted.")) return;
    setBusy(true);
    try {
      await removePortrait(item.id, token);
      forgetOwned(item.id);
      onGone(item.id);
    } catch (e) {
      setNote(e.message);
      setBusy(false);
    }
  };

  return (
    <li className="group">
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-ash shadow-halo transition-shadow duration-500 group-hover:shadow-glow">
        {broken ? (
          <p className="grid h-full place-items-center p-6 text-center text-sm text-fog">This picture didn't load.</p>
        ) : (
          <img
            src={item.imageUrl}
            alt={`AI portrait by @${item.username}: ${item.caption}`}
            loading="lazy"
            width="1024"
            height="1024"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
        {item.costMicro > 0 && (
          <span
            className="absolute right-3 top-3 rounded-full bg-void/70 px-2.5 py-1 text-xs tabular-nums text-light backdrop-blur"
            title={`Cost to paint on Surplus Intelligence${item.listMicro ? ` (list price ${usd(item.listMicro)})` : ""}`}
          >
            {usd(item.costMicro)}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[17px] italic leading-snug text-mist">{item.caption}</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[13px] text-fog">
        <span className="min-w-0 truncate">
          {showUser && (
            <>
              <Link to={userPath(item.username)} className="text-light hover:underline">
                @{item.username}
              </Link>{" "}
            </>
          )}
          {timeAgo(item.createdAt)}
        </span>
        {token ? (
          <button type="button" onClick={remove} disabled={busy} className="shrink-0 hover:text-light disabled:opacity-50">
            Take down
          </button>
        ) : (
          <button
            type="button"
            onClick={report}
            disabled={busy || !!note}
            aria-label={`Report portrait by @${item.username}`}
            className="shrink-0 hover:text-light disabled:opacity-50"
          >
            Report
          </button>
        )}
      </div>
      {note && <p className="mt-1 text-xs text-light" role="status">{note}</p>}
    </li>
  );
}

function FindDreamer({ initial = "" }) {
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
      className="w-full max-w-xs"
    >
      <label htmlFor="find-user" className="text-sm text-fog">
        Find someone
      </label>
      <div className="mt-1 flex items-center border-b border-white/30 focus-within:border-light">
        <input
          id="find-user"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@username"
          autoCapitalize="none"
          spellCheck={false}
          className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-lg text-light placeholder:text-white/25 focus:outline-none focus:ring-0"
        />
        <button type="submit" className="p-2 text-fog hover:text-light" aria-label="Search">
          <Search className="h-5 w-5" />
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-light">{error}</p>}
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

  const gone = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  useEffect(() => {
    document.title = handle ? `Dreamed up by @${handle} | DreamHer` : "Gallery | DreamHer";
    return () => {
      document.title = "DreamHer: she's only a glow until you describe her";
    };
  }, [handle]);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Backdrop />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-14 sm:px-10 lg:pt-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {handle ? (
              <>
                <Link to="/gallery" className="text-sm text-fog hover:text-light">
                  Everyone's dreams
                </Link>
                <h1 className="glow-text mt-4 break-all font-display text-[clamp(2.6rem,6.5vw,5rem)] font-normal leading-[0.98] tracking-[-0.025em] text-light">
                  Dreamed up by @{handle}
                </h1>
                <p className="mt-5 text-fog">
                  <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="text-link">
                    @{handle} on X
                  </a>
                  <span className="ml-3 text-sm">Usernames are typed in by visitors and aren't verified.</span>
                </p>
              </>
            ) : (
              <>
                <h1 className="glow-text font-display text-[clamp(2.6rem,6.5vw,5rem)] font-normal leading-[0.98] tracking-[-0.025em] text-light">
                  Who everyone dreamed up
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-fog">
                  Newest first. The tag on each one is what it cost to bring her to life on{" "}
                  <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="text-link">
                    Surplus Intelligence
                  </a>
                  .
                </p>
                {stats && (
                  <p className="mt-4 text-[15px] text-mist">
                    {stats.portraits.toLocaleString("en-US")} {stats.portraits === 1 ? "portrait" : "portraits"} for {usd(stats.costMicro)} in total
                    {stats.listMicro > stats.costMicro && <span className="text-fog"> (list price {usd(stats.listMicro)})</span>}
                  </p>
                )}
              </>
            )}
          </div>
          <FindDreamer key={handle || "all"} initial={handle ? `@${handle}` : ""} />
        </div>

        <div className="mt-14 border-t border-white/10 pt-14">
          {invalid && <Empty title="That isn't an X username." body="Usernames use letters, numbers and _ (up to 15)." onStart={onStart} />}
          {!invalid && state === "loading" && (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading portraits">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="aspect-square animate-pulse rounded-[22px] bg-white/[0.04]" />
              ))}
            </ul>
          )}
          {!invalid && state === "error" && (
            <div className="max-w-lg" role="alert">
              <p className="font-display text-3xl italic text-light">The gallery didn't load.</p>
              <p className="mt-3 text-fog">{error}</p>
            </div>
          )}
          {!invalid && state === "ready" && items.length === 0 && (
            <Empty
              title={handle ? `@${handle} hasn't dreamed anyone up yet.` : "Nobody has been dreamed up yet."}
              body={handle ? "If this is you, describe her and she shows up here." : "Be the first."}
              onStart={onStart}
            />
          )}
          {!invalid && items.length > 0 && (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <Portrait key={item.id} item={item} showUser={!handle} onGone={gone} />
                ))}
              </ul>
              {next && (
                <div className="mt-16 flex justify-center">
                  <button type="button" onClick={more} disabled={loadingMore} className="btn-ghost px-8">
                    {loadingMore ? "Loading..." : "Show more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Empty({ title, body, onStart }) {
  return (
    <div className="max-w-xl">
      <p className="font-display text-4xl italic leading-tight text-light">{title}</p>
      <p className="mt-4 text-lg text-fog">{body}</p>
      <button type="button" onClick={onStart} className="btn-light mt-8 px-8">
        Describe her
      </button>
    </div>
  );
}
