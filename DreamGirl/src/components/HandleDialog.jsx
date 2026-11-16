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
      className="w-[min(92vw,460px)] rounded-2xl border-3 border-ink bg-white p-0 text-ink shadow-nb-lg backdrop:bg-ink/40"
    >
      <form onSubmit={save} className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={skip}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border-3 border-ink bg-white hover:bg-pink-wash"
        >
          <X className="h-4 w-4" strokeWidth={3} />
        </button>
        <h2 id={`${inputId}-title`} className="pr-10 font-display text-2xl leading-tight sm:text-3xl">
          {editing ? "Change your X username" : "What's your X username?"}
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-700">
          Every portrait you make goes in the public gallery under this name, so friends can see who
          you dreamed up.
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

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button type="submit" className="nb-btn-pink">
            Save username
          </button>
          {editing ? (
            <button type="button" onClick={stopPosting} className="text-sm font-semibold underline decoration-2 underline-offset-4">
              Stop posting my portraits
            </button>
          ) : (
            <button type="button" onClick={skip} className="text-sm font-semibold underline decoration-2 underline-offset-4">
              Skip, don't post my portraits
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
