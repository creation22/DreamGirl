import { useSyncExternalStore } from "react";

// Three addresses: "/" (landing, quiz, result), "/gallery", "/u/<username>".
const listeners = new Set();
const subscribe = (l) => {
  listeners.add(l);
  window.addEventListener("popstate", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("popstate", l);
  };
};

export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

export function navigate(path) {
  if (path === window.location.pathname) return;
  window.history.pushState({}, "", path);
  listeners.forEach((l) => l());
  window.scrollTo({ top: 0 });
}

export function matchRoute(path) {
  if (path === "/gallery" || path === "/gallery/") return { name: "gallery" };
  const m = path.match(/^\/u\/([^/]+)\/?$/);
  if (m) return { name: "user", handle: decodeURIComponent(m[1]) };
  return { name: "home" };
}

export const userPath = (handle) => `/u/${encodeURIComponent(handle)}`;

/** An <a> that changes page without a reload, but still opens in a new tab on ctrl/cmd-click. */
export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    />
  );
}
