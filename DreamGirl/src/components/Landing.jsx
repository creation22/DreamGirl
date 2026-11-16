import { useContext } from "react";
import { AtSign, Images } from "lucide-react";
import { Heart } from "./Chrome";
import { HandleDialogContext } from "../lib/dialog";
import { useHandle } from "../lib/me";
import { LINKS } from "../constants/links";
import { NIGHT } from "../constants/night";
import { useSurplusStats } from "../lib/useSurplusStats";
import { Link } from "../lib/router";
import { SURPLUS_URL, usd } from "../utils/money";

const delay = (ms) => ({ animationDelay: `${ms}ms` });

/** The app's header, drawn in white for the night photograph. */
function NightHeader() {
  const handle = useHandle();
  const openDialog = useContext(HandleDialogContext);
  return (
    <header className="relative z-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" aria-label="DreamHer home" className="flex shrink-0 items-center gap-2 text-light">
          <Heart className="h-8 w-8" stroke="#fff" />
          <span className="hidden font-display text-xl min-[400px]:inline">DreamHer</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Main">
          <Link to="/gallery" className="nb-chip-night">
            <Images className="h-4 w-4" aria-hidden />
            Gallery
          </Link>
          <button type="button" onClick={openDialog} title="Change your X username" className="nb-chip-night max-w-[9.5rem]">
            <AtSign className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            <span className="truncate">{handle || "Add your X"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

/** One screen: the photograph, one line, one button, in the app's own shapes. */
export default function Landing({ onStart }) {
  const stats = useSurplusStats();
  const avg = stats ? Math.round(stats.costMicro / stats.portraits) : 0;

  return (
    <div className="grain relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-void text-mist">
      <img
        src={NIGHT.full}
        alt="A man walks through tall grass at night, holding the hand of a girl made of light."
        className="absolute inset-0 -z-10 h-full w-full animate-fade object-cover object-[63%_40%] [filter:contrast(1.12)_brightness(1.05)] sm:object-[60%_45%]"
        fetchpriority="high"
      />
      {/* shade the side and bottom where the words sit, keep her light untouched */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-void/70 via-transparent to-void/95 sm:bg-gradient-to-r sm:from-void/85 sm:from-0% sm:via-void/30 sm:via-30% sm:to-transparent sm:to-48%" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[58%] bg-gradient-to-t from-void from-40% via-void/80 to-transparent sm:h-1/3 sm:from-void/85 sm:from-0% sm:via-transparent" />

      <NightHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4 pb-6 pt-4 sm:justify-end sm:px-6 sm:pb-10">
        <h1
          className="animate-rise font-display text-[clamp(2.4rem,7vw,5.25rem)] leading-[1.02] text-light"
          style={delay(400)}
        >
          <span className="block">She's only a glow</span>
          <span className="block">until you</span>
          <span className="mt-2 inline-block -rotate-[1.5deg] rounded-xl border-3 border-light bg-pink px-3 pb-1 text-ink shadow-nb-w sm:px-4">
            describe her.
          </span>
        </h1>

        <div>
          <p className="max-w-md animate-rise text-[17px] font-medium leading-relaxed text-mist sm:mt-8 sm:text-lg" style={delay(700)}>
            Answer ten questions and she steps out of the light, painted in seconds by Surplus
            Intelligence.
          </p>
          <div className="mt-7 flex animate-rise flex-wrap items-center gap-x-5 gap-y-4" style={delay(900)}>
            <button type="button" onClick={onStart} className="nb-btn-night text-lg">
              Describe her
            </button>
            <Link to="/gallery" className="nb-chip-night px-4 py-2.5 text-[15px]">
              See who others dreamed up
            </Link>
          </div>

          <div className="mt-10 flex animate-rise flex-col gap-4 text-[13px] text-fog sm:flex-row sm:items-center sm:justify-between" style={delay(1100)}>
            <p className="self-start rounded-lg border-2 border-white/40 bg-void/50 px-3 py-2 text-mist backdrop-blur-sm">
              {stats ? (
                <>
                  {stats.portraits.toLocaleString("en-US")} dreamed up so far, at <strong className="text-light">{usd(avg)}</strong> each on{" "}
                </>
              ) : (
                <>About a cent each, painted on </>
              )}
              <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-light underline underline-offset-4">
                Surplus Intelligence
              </a>
              . Free, no sign-up.
            </p>
            <nav className="flex gap-5 font-medium" aria-label="More">
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-light">GitHub</a>
              <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className="hover:text-light">Buy me a coffee</a>
              <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className="hover:text-light">Feedback</a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
