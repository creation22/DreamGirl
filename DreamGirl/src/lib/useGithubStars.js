import { useEffect, useState } from "react";
import { LINKS } from "../constants/links";

// "owner/repo" from the GitHub link, for the direct fallback.
const REPO = new URL(LINKS.github).pathname.replace(/^\/|\/$/g, "");
const CACHE_KEY = "dreamher:githubStars";
// How often an open page checks for new stars.
const POLL_MS = 60 * 1000;

function readCache() {
  try {
    const n = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    return typeof n === "number" ? n : null;
  } catch {
    return null;
  }
}

async function fetchStars(signal) {
  // Our own endpoint first: one CDN-cached answer shared by every visitor.
  try {
    const r = await fetch("/api/stars", { signal });
    if (r.ok) {
      const { stars } = await r.json();
      if (typeof stars === "number") return stars;
    }
  } catch (e) {
    if (e?.name === "AbortError") throw e;
  }
  // Fallback: ask GitHub directly (60 calls an hour per visitor).
  const r = await fetch(`https://api.github.com/repos/${REPO}`, { signal, headers: { Accept: "application/vnd.github+json" } });
  const count = r.ok ? (await r.json())?.stargazers_count : null;
  return typeof count === "number" ? count : null;
}

/**
 * The repo's live star count, or null until it arrives. Starts from the last number
 * this tab saw, then checks every minute while the page is visible, and right away
 * when you come back to the tab.
 */
export function useGithubStars() {
  const [stars, setStars] = useState(readCache);

  useEffect(() => {
    const ctrl = new AbortController();
    let timer;
    const load = async () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") {
        try {
          const n = await fetchStars(ctrl.signal);
          if (n !== null) {
            setStars(n);
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(n));
            } catch {
              // storage blocked: nothing to remember
            }
          }
        } catch {
          if (ctrl.signal.aborted) return;
        }
      }
      timer = setTimeout(load, POLL_MS);
    };
    const onVisible = () => document.visibilityState === "visible" && load();
    load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return stars;
}

/** 1234 -> "1.2k" */
export function formatStars(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n);
}
