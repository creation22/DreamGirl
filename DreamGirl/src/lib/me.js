// Per-browser state: the visitor's X username and the remove keys for portraits they posted.
// Storage can be blocked (private mode), so every access is guarded and the app still works.
import { useSyncExternalStore } from "react";

const HANDLE_KEY = "dreamher:handle";
const ASKED_KEY = "dreamher:askedHandle";
const OWNED_KEY = "dreamher:owned";

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
let asked = read(ASKED_KEY) === "1" || !!handle;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));

export function useHandle() {
  return useSyncExternalStore(subscribe, () => handle);
}

export function setHandle(next) {
  handle = next || null;
  asked = true;
  write(HANDLE_KEY, handle);
  write(ASKED_KEY, "1");
  emit();
}

export const wasAsked = () => asked;

export function skipHandle() {
  asked = true;
  write(ASKED_KEY, "1");
  emit();
}

function owned() {
  try {
    return JSON.parse(read(OWNED_KEY) || "{}");
  } catch {
    return {};
  }
}

export function rememberOwned(id, token) {
  write(OWNED_KEY, JSON.stringify({ ...owned(), [id]: token }));
}

export const ownedToken = (id) => owned()[id];

export function forgetOwned(id) {
  const all = owned();
  delete all[id];
  write(OWNED_KEY, JSON.stringify(all));
}
