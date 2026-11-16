import { Header } from "./Chrome";
import { LINKS } from "../constants/links";
import { NIGHT } from "../constants/night";
import { useSurplusStats } from "../lib/useSurplusStats";
import { Link } from "../lib/router";
import { SURPLUS_URL, usd } from "../utils/money";

const delay = (ms) => ({ animationDelay: `${ms}ms` });

/** One screen: the photograph, one line, one button. */
export default function Landing({ onStart }) {
  const stats = useSurplusStats();
  const avg = stats ? Math.round(stats.costMicro / stats.portraits) : 0;

  return (
    <div className="relative isolate flex h-[100svh] min-h-[620px] flex-col overflow-hidden bg-void">
      <img
        src={NIGHT.full}
        alt="A man walks through tall grass at night, holding the hand of a girl made of light."
        className="absolute inset-0 -z-10 h-full w-full animate-fade object-cover object-[63%_40%] [filter:contrast(1.12)_brightness(1.05)] sm:object-[60%_45%]"
        fetchpriority="high"
      />
      {/* shade the side and bottom where the words sit, keep her light untouched */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-void/70 via-transparent to-void/95 sm:bg-gradient-to-r sm:from-void/85 sm:from-0% sm:via-void/30 sm:via-30% sm:to-transparent sm:to-48%" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-gradient-to-t from-void/85 to-transparent sm:block" />

      <Header transparent />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 pb-6 pt-2 sm:justify-end sm:px-10 sm:pb-10">
        <h1
          className="glow-text max-w-[12ch] animate-rise font-display text-[clamp(2.5rem,7.4vw,6rem)] font-normal leading-[0.98] tracking-[-0.025em] text-light"
          style={delay(400)}
        >
          She's only a glow until you describe her.
        </h1>

        <div>
          <p className="max-w-md animate-rise text-[17px] leading-relaxed text-mist sm:mt-8 sm:text-lg" style={delay(700)}>
            Answer ten questions and she steps out of the light, painted in seconds by Surplus
            Intelligence.
          </p>
          <div className="mt-7 flex animate-rise flex-wrap items-center gap-x-7 gap-y-4" style={delay(900)}>
            <button type="button" onClick={onStart} className="btn-light px-9 py-4 text-base">
              Describe her
            </button>
            <Link to="/gallery" className="text-link text-[15px]">
              See who others dreamed up
            </Link>
          </div>

          <div className="mt-12 flex animate-rise flex-col gap-3 border-t border-white/10 pt-5 text-[13px] text-fog sm:flex-row sm:items-center sm:justify-between" style={delay(1100)}>
            <p>
              {stats ? (
                <>
                  {stats.portraits.toLocaleString("en-US")} dreamed up so far, at {usd(avg)} each on{" "}
                </>
              ) : (
                <>About a cent each, painted on </>
              )}
              <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="text-link">
                Surplus Intelligence
              </a>
              . Free, no sign-up.
            </p>
            <nav className="flex gap-5" aria-label="More">
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
