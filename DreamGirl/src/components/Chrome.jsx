import { useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtSign, Coffee, Images, Star } from "lucide-react";
import { Link } from "../lib/router";
import { useHandle } from "../lib/me";
import { HandleDialogContext } from "../lib/dialog";
import { LINKS } from "../constants/links";
import { formatStars, useGithubStars } from "../lib/useGithubStars";

const MotionSpan = motion.span;

/** GitHub's mark (lucide no longer ships brand icons). */
export function GithubMark({ className = "" }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The live star count. A new number rolls up into place. */
export function StarCount({ stars }) {
  return (
    <span className="inline-grid overflow-hidden tabular-nums">
      <AnimatePresence initial={false} mode="popLayout">
        <MotionSpan
          key={stars}
          className="col-start-1 row-start-1"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatStars(stars)}
        </MotionSpan>
      </AnimatePresence>
    </span>
  );
}

function GithubChip() {
  const stars = useGithubStars();
  return (
    <a
      href={LINKS.github}
      target="_blank"
      rel="noopener noreferrer"
      className={`${chipBtn} hidden md:flex`}
      aria-label={stars === null ? "Star DreamHer on GitHub" : `Star DreamHer on GitHub, ${stars} stars`}
    >
      <GithubMark className="h-4 w-4" />
      Star
      {stars !== null && (
        <span className="-my-1.5 -mr-3 ml-0.5 flex items-center gap-1 self-stretch rounded-r-[5px] border-l-3 border-ink bg-pink px-2">
          <Star className="h-3.5 w-3.5 fill-ink" strokeWidth={2.5} aria-hidden />
          <StarCount stars={stars} />
        </span>
      )}
    </a>
  );
}

const HEART =
  "M254.791,33.251c-46.555,0-76.089,51.899-83.079,51.899c-6.111,0-34.438-51.899-83.082-51.899c-47.314,0-85.947,39.021-88.476,86.27c-1.426,26.691,7.177,47.001,19.304,65.402c24.222,36.76,130.137,125.248,152.409,125.248c22.753,0,127.713-88.17,152.095-125.247c12.154-18.483,20.731-38.711,19.304-65.402C340.738,72.272,302.107,33.251,254.791,33.251";

export function Heart({ className = "", stroke = "#000" }) {
  return (
    <svg viewBox="-14 -14 371 371" className={className} aria-hidden>
      <path d={HEART} fill="#FF5FA2" stroke={stroke} strokeWidth="26" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="DreamHer home">
      <Heart className="h-8 w-8" />
      <span className="font-display text-xl tracking-tight">DreamHer</span>
    </Link>
  );
}

export const chipBtn =
  "flex items-center gap-1.5 rounded-lg border-3 border-ink bg-white px-3 py-1.5 text-sm font-semibold shadow-nb-sm transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";

function HandleChip() {
  const handle = useHandle();
  const openDialog = useContext(HandleDialogContext);
  return (
    <button type="button" onClick={openDialog} className={`${chipBtn} max-w-[9.5rem] !bg-pink-soft`} title="Change your X username">
      <AtSign className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
      <span className="truncate">{handle || "Add your X"}</span>
    </button>
  );
}

export function Header({ onHome, children }) {
  return (
    <header className="border-b-3 border-ink bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" onClick={onHome} className="flex shrink-0 items-center gap-2" aria-label="DreamHer home">
          <Heart className="h-8 w-8" />
          <span className="hidden font-display text-xl tracking-tight min-[400px]:inline">DreamHer</span>
        </Link>
        {children ?? (
          <nav className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Main">
            <Link to="/gallery" className={chipBtn}>
              <Images className="h-4 w-4" aria-hidden />
              Gallery
            </Link>
            <HandleChip />
            <GithubChip />
            <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className={`${chipBtn} hidden lg:flex`}>
              <Coffee className="h-4 w-4" aria-hidden />
              Buy me a coffee
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
