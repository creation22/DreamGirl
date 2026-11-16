// Cloudflare Turnstile: a free, usually invisible "are you human" check, so scripts can't
// call /api/generate in a loop. Off unless VITE_TURNSTILE_SITE_KEY is set at build time
// (with TURNSTILE_SECRET_KEY on the server).
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading = null;
let widget = null; // { id, el }
let waiting = null; // { resolve, reject } for the token being fetched

function loadScript() {
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => {
      loading = null;
      reject(new Error("The human check didn't load. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** A fresh one-use token, or null when the check is off. Shows a box only if Cloudflare needs a click. */
export async function getTurnstileToken() {
  if (!SITE_KEY) return null;
  const turnstile = await loadScript();
  return new Promise((resolve, reject) => {
    waiting = { resolve, reject };
    const timer = setTimeout(() => {
      waiting = null;
      reject(new Error("The human check timed out. Try again."));
    }, 60_000);
    const done = (fn) => (v) => {
      clearTimeout(timer);
      const w = waiting;
      waiting = null;
      w?.[fn](v);
    };
    if (widget) {
      widget.done = done;
      turnstile.reset(widget.id);
      return;
    }
    const el = document.createElement("div");
    el.className = "fixed bottom-4 left-1/2 z-50 -translate-x-1/2";
    document.body.appendChild(el);
    widget = { el, done };
    widget.id = turnstile.render(el, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      action: "generate",
      callback: (token) => widget.done("resolve")(token),
      "error-callback": () => widget.done("reject")(new Error("The human check failed. Reload the page and try again.")),
      "expired-callback": () => turnstile.reset(widget.id),
    });
  });
}
