import { useContext } from "react";
import { Link } from "../lib/router";
import { useHandle } from "../lib/me";
import { HandleDialogContext } from "../lib/dialog";
import { LINKS } from "../constants/links";
import { NIGHT } from "../constants/night";
import { SURPLUS_URL } from "../utils/money";

export function Wordmark({ className = "" }) {
  return <span className={`font-display font-medium italic tracking-[-0.02em] ${className}`}>DreamHer</span>;
}

/** The photograph, blurred and darkened, fixed behind every page except the landing page. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <img src={NIGHT.blur} alt="" className="h-full w-full object-cover object-[62%_50%] opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/70 to-void" />
    </div>
  );
}

function HandleButton() {
  const handle = useHandle();
  const openDialog = useContext(HandleDialogContext);
  return (
    <button
      type="button"
      onClick={openDialog}
      title="Change your X username"
      className="max-w-[9rem] truncate rounded-full px-3 py-2 text-sm text-fog transition-colors hover:text-light"
    >
      {handle ? `@${handle}` : "Add your X"}
    </button>
  );
}

export function Header({ onHome, children, transparent = false }) {
  return (
    <header className={transparent ? "relative z-10" : "relative z-10 border-b border-white/[0.07]"}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-10">
        <Link to="/" onClick={onHome} aria-label="DreamHer home" className="shrink-0 text-[26px] leading-none text-light transition-opacity hover:opacity-80">
          <Wordmark />
        </Link>
        {children ?? (
          <nav className="flex min-w-0 items-center gap-1 sm:gap-3" aria-label="Main">
            <Link to="/gallery" className="rounded-full px-3 py-2 text-sm text-fog transition-colors hover:text-light">
              Gallery
            </Link>
            <HandleButton />
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-fog sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          Brought to life by{" "}
          <a href={SURPLUS_URL} target="_blank" rel="noopener noreferrer" className="text-link">
            Surplus Intelligence
          </a>
          . Made by{" "}
          <a href="https://github.com/creation22" target="_blank" rel="noopener noreferrer" className="text-link">
            creation22
          </a>
          .
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-light">GitHub</a>
          <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className="hover:text-light">Buy me a coffee</a>
          <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className="hover:text-light">Send feedback</a>
        </nav>
      </div>
    </footer>
  );
}
