// GET    /api/portraits?user=<handle>&before=<iso>&limit=<n>  list the public gallery
// PATCH  /api/portraits {id, token, username}                post a portrait drawn before a username was set
// DELETE /api/portraits {id, token}                          remove your own portrait
import { getStore, StoreError } from "./_lib/store.js";
import { queryOf, readJson, send, sha256 } from "./_lib/http.js";
import { normalizeHandle } from "../src/utils/moderation.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validOwner = (id, token) => UUID_RE.test(String(id)) && typeof token === "string" && token.length <= 100;

async function list(req, res, store) {
  const q = queryOf(req);
  const rawUser = q.get("user");
  const username = rawUser ? normalizeHandle(rawUser) : null;
  if (rawUser && !username) return send(res, 400, { error: "That isn't a valid X username." });
  const before = q.get("before");
  if (before && Number.isNaN(Date.parse(before))) return send(res, 400, { error: "Bad cursor." });
  const limit = Math.min(Math.max(Number(q.get("limit")) || 24, 1), 48);

  const items = await store.list({ username, before: before && new Date(before).toISOString(), limit });
  send(res, 200, { items, nextBefore: items.length === limit ? items[items.length - 1].createdAt : null }, {
    "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
  });
}

async function attach(req, res, store) {
  const { id, token, username: raw } = await readJson(req);
  if (!validOwner(id, token)) return send(res, 400, { error: "Bad request." });
  const username = normalizeHandle(raw);
  if (!username) return send(res, 400, { error: "That doesn't look like an X username. Use letters, numbers and _ (up to 15)." });
  const item = await store.attachUsername(id, sha256(token), username);
  if (!item) return send(res, 409, { error: "That portrait is already posted, or wasn't drawn in this browser." });
  send(res, 200, { item });
}

async function remove(req, res, store) {
  const { id, token } = await readJson(req);
  if (!validOwner(id, token)) return send(res, 400, { error: "Bad request." });
  const removed = await store.remove(id, sha256(token));
  if (!removed) return send(res, 404, { error: "That portrait is already gone, or wasn't drawn in this browser." });
  send(res, 200, { ok: true });
}

export default async function handler(req, res) {
  const store = getStore();
  if (!store) return send(res, 503, { error: "The gallery isn't set up yet." });
  try {
    if (req.method === "GET") return await list(req, res, store);
    if (req.method === "PATCH") return await attach(req, res, store);
    if (req.method === "DELETE") return await remove(req, res, store);
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return send(res, 405, { error: "Method not allowed." });
  } catch (e) {
    if (e instanceof SyntaxError) return send(res, 400, { error: "Bad JSON." });
    if (e instanceof StoreError) return send(res, e.status, { error: e.message, code: e.code });
    if (e?.status === 413) return send(res, 413, { error: "Too large." });
    console.error("[gallery] unexpected", e);
    return send(res, 500, { error: "Something broke on our side." });
  }
}
