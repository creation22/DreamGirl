// Per-browser state: the visitor's X username. Needed to enter the app.
// Storage can be blocked (private mode), so every access is guarded and the app still works.
import { useSyncExternalStore } from "react";

const HANDLE_KEY = "dreamher:handle";

const read = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k, v) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* blocked: keep the in-memory value */
  }
};

let handle = read(HANDLE_KEY);
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));

export function useHandle() {
  return useSyncExternalStore(subscribe, () => handle);
}

export function setHandle(next) {
  handle = next || null;
  write(HANDLE_KEY, handle);
  emit();
}
