import { getTurnstileToken } from "./turnstile";

async function call(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Couldn't reach DreamHer. Check your connection."), { status: 0 });
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw Object.assign(new Error(data.error || "Something went wrong. Try again."), { status: res.status, code: data.code });
  return data;
}

/** Draws a portrait through Surplus and posts it to the gallery under the username. */
export async function generatePortrait(answers, username) {
  const turnstileToken = (await getTurnstileToken()) || undefined;
  return call("/api/generate", { method: "POST", body: { answers, username, turnstileToken } });
}

export function listPortraits({ user, before, limit = 24 } = {}) {
  const q = new URLSearchParams({ limit: String(limit) });
  if (user) q.set("user", user);
  if (before) q.set("before", before);
  return call(`/api/portraits?${q}`);
}


export const reportPortrait = (id) => call("/api/report", { method: "POST", body: { id } });

export const getStats = () => call("/api/stats");
