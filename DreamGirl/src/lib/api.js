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

/** Draws a portrait through Surplus. Posts it to the gallery when a username is given. */
export const generatePortrait = (answers, username) =>
  call("/api/generate", { method: "POST", body: { answers, username: username || undefined } });

export function listPortraits({ user, before, limit = 24 } = {}) {
  const q = new URLSearchParams({ limit: String(limit) });
  if (user) q.set("user", user);
  if (before) q.set("before", before);
  return call(`/api/portraits?${q}`);
}

export const attachUsername = (id, token, username) =>
  call("/api/portraits", { method: "PATCH", body: { id, token, username } });

export const removePortrait = (id, token) => call("/api/portraits", { method: "DELETE", body: { id, token } });

export const reportPortrait = (id) => call("/api/report", { method: "POST", body: { id } });

export const getStats = () => call("/api/stats");
