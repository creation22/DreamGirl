import { Coffee, Star } from "lucide-react";
import { LINKS } from "../constants/links";


export function Logo({ onClick }) {
  const inner = (
    <>
      <img src="/dreamher.svg" alt="" className="h-7 w-7" />
      <span className="text-lg font-extrabold tracking-tight text-film">DreamHer</span>
    </>
  );
  if (!onClick) return <span className="flex items-center gap-2">{inner}</span>;
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2" aria-label="DreamHer home">
      {inner}
    </button>
  );
}

export function Header({ onHome, children }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Logo onClick={onHome} />
      {children ?? (
        <nav className="flex items-center gap-1 text-sm text-lavender sm:gap-2" aria-label="Project links">
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-dusk hover:text-film">
            <Star className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Star on GitHub</span>
            <span className="sm:hidden">Star</span>
          </a>
          <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-dusk hover:text-film">
            <Coffee className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Buy me a coffee</span>
            <span className="sm:hidden">Coffee</span>
          </a>
        </nav>
      )}
    </header>
  );
}

/** An instant-photo frame with a handwritten caption under the picture. */
export function Photo({ children, caption, className = "", style }) {
  return (
    <figure className={`photo ${className}`} style={style}>
      <div className="relative aspect-square overflow-hidden bg-dusk">{children}</div>
      <figcaption className="photo-caption">{caption}</figcaption>
    </figure>
  );
}
