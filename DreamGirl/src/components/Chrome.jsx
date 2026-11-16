import { Coffee, Star } from "lucide-react";
import { LINKS } from "../constants/links";

const HEART =
  "M254.791,33.251c-46.555,0-76.089,51.899-83.079,51.899c-6.111,0-34.438-51.899-83.082-51.899c-47.314,0-85.947,39.021-88.476,86.27c-1.426,26.691,7.177,47.001,19.304,65.402c24.222,36.76,130.137,125.248,152.409,125.248c22.753,0,127.713-88.17,152.095-125.247c12.154-18.483,20.731-38.711,19.304-65.402C340.738,72.272,302.107,33.251,254.791,33.251";

export function Heart({ className = "" }) {
  return (
    <svg viewBox="-14 -14 371 371" className={className} aria-hidden>
      <path d={HEART} fill="#FF5FA2" stroke="#000" strokeWidth="26" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ onClick }) {
  const inner = (
    <>
      <Heart className="h-8 w-8" />
      <span className="font-display text-xl tracking-tight">DreamHer</span>
    </>
  );
  if (!onClick) return <span className="flex items-center gap-2">{inner}</span>;
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2" aria-label="DreamHer home">
      {inner}
    </button>
  );
}

const linkBtn =
  "flex items-center gap-1.5 rounded-lg border-3 border-ink bg-white px-3 py-1.5 text-sm font-semibold shadow-nb-sm transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";

export function Header({ onHome, children }) {
  return (
    <header className="border-b-3 border-ink bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Logo onClick={onHome} />
        {children ?? (
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Project links">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={linkBtn}>
              <Star className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Star on GitHub</span>
              <span className="sm:hidden">Star</span>
            </a>
            <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className={`${linkBtn} !bg-pink-soft`}>
              <Coffee className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Buy me a coffee</span>
              <span className="sm:hidden">Coffee</span>
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

/** A portrait card: square picture over a caption strip, in a thick black frame. */
export function Photo({ children, caption, className = "", shadow = "shadow-nb", style }) {
  return (
    <figure className={`overflow-hidden rounded-xl border-3 border-ink bg-white ${shadow} ${className}`} style={style}>
      <div className="relative aspect-square overflow-hidden border-b-3 border-ink bg-pink-wash">{children}</div>
      {caption && (
        <figcaption className="bg-pink-soft px-2.5 py-2 text-xs font-semibold leading-snug sm:px-3 sm:text-sm">{caption}</figcaption>
      )}
    </figure>
  );
}
