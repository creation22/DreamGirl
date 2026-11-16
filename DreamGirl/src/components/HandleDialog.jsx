import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { normalizeHandle } from "../utils/moderation";
import { setHandle } from "../lib/me";

/**
 * Asks for the visitor's X username. Native <dialog> handles focus and Escape.
 * `starting`: asked from "Describe her". Saving starts the questions; closing stays on
 * the page, since the questions can't start without a name.
 * Otherwise it's changing the name, and closing just cancels.
 */
export default function HandleDialog({ open, onClose, initial = "", starting = false }) {
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
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, initial]);

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
        onClose();
      }}
      aria-labelledby={`${inputId}-title`}
      className="w-[min(92vw,460px)] rounded-2xl border-3 border-ink bg-white p-0 text-ink shadow-nb-lg backdrop:bg-ink/60 backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={save} className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={() => onClose()}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border-3 border-ink bg-white hover:bg-pink-wash"
        >
          <X className="h-4 w-4" strokeWidth={3} />
        </button>
        <h2 id={`${inputId}-title`} className="pr-10 font-display text-2xl leading-tight sm:text-3xl">
          {starting ? "First, who's dreaming?" : initial ? "Change your X username" : "What's your X username?"}
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-700">
          {starting
            ? "Enter your X username to start. Every portrait you make is posted to the public gallery under this name."
            : "Every portrait you make is posted to the public gallery under this name."}
        </p>

        <label htmlFor={inputId} className="mt-6 block text-sm font-bold">
          X / Twitter username
        </label>
        <div className="mt-2 flex items-center rounded-xl border-3 border-ink bg-white shadow-nb focus-within:shadow-nb-hover">
          <span aria-hidden className="pl-4 text-lg font-bold text-neutral-500">
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
            className="w-full rounded-xl bg-transparent px-2 py-3.5 text-lg font-semibold outline-none"
          />
        </div>
        {error && (
          <p id={`${inputId}-err`} className="mt-2 text-sm font-semibold text-pink-deep">
            {error}
          </p>
        )}

        <button type="submit" className="nb-btn-pink mt-7 w-full sm:w-auto">
          {starting ? "Start describing her" : "Save username"}
        </button>
      </form>
    </dialog>
  );
}
