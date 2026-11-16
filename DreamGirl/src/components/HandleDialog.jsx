import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { normalizeHandle } from "../utils/moderation";
import { setHandle, skipHandle } from "../lib/me";

/** Asks for the visitor's X username. Native <dialog> handles focus and Escape. */
export default function HandleDialog({ open, onClose, initial = "" }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const inputId = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setValue(initial);
      setError("");
      d.showModal();
      // showModal focuses the first button (Close); the username box is what people need.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, initial]);

  const editing = !!initial;
  // First ask: closing means "skip". Changing an existing name: closing just cancels.
  const skip = () => {
    if (!editing) skipHandle();
    onClose();
  };
  const stopPosting = () => {
    setHandle(null);
    onClose();
  };

  const save = (e) => {
    e.preventDefault();
    const handle = normalizeHandle(value);
    if (!handle) {
      setError("Use your X username: letters, numbers and _ (up to 15).");
      return;
    }
    setHandle(handle);
    onClose(handle);
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        skip();
      }}
      aria-labelledby={`${inputId}-title`}
      className="w-[min(92vw,480px)] overflow-hidden rounded-[28px] border border-white/10 bg-ash p-0 text-mist shadow-halo backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={save} className="relative px-7 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
        <button
          type="button"
          onClick={skip}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-fog transition-colors hover:bg-white/10 hover:text-light"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <h2 id={`${inputId}-title`} className="glow-text pr-8 font-display text-[40px] font-normal leading-[1] tracking-[-0.02em] text-light">
          {editing ? "Change your username" : "Who's dreaming?"}
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-fog">
          Everyone you bring to life goes in the public gallery under your X username, so friends can see who you dreamed up.
        </p>

        <label htmlFor={inputId} className="mt-8 block text-sm text-fog">
          X username
        </label>
        <div className="mt-1 flex items-baseline border-b border-white/30 focus-within:border-light">
          <span aria-hidden className="font-display text-3xl text-fog">
            @
          </span>
          <input
            id={inputId}
            ref={inputRef}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={60}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder="yourname"
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-err` : undefined}
            className="w-full border-0 bg-transparent px-1 py-2 font-display text-3xl text-light placeholder:text-white/20 focus:outline-none focus:ring-0"
          />
        </div>
        {error && (
          <p id={`${inputId}-err`} className="mt-2 text-sm text-light">
            {error}
          </p>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button type="submit" className="btn-light px-8">
            {editing ? "Save" : "Continue"}
          </button>
          {editing ? (
            <button type="button" onClick={stopPosting} className="text-sm text-fog underline decoration-white/20 underline-offset-[5px] hover:text-light">
              Stop posting my portraits
            </button>
          ) : (
            <button type="button" onClick={skip} className="text-sm text-fog underline decoration-white/20 underline-offset-[5px] hover:text-light">
              Skip, keep mine private
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
