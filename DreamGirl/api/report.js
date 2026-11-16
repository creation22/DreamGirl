// POST /api/report {id}  One report per visitor; three reports hide the portrait.
import { getStore, StoreError } from "./_lib/store.js";
import { readJson, send, visitorHash } from "./_lib/http.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed." });
  }
  const store = getStore();
  if (!store) return send(res, 503, { error: "The gallery isn't set up yet." });
  try {
    const { id } = await readJson(req);
    if (!UUID_RE.test(String(id))) return send(res, 400, { error: "Bad request." });
    await store.report(id, visitorHash(req));
    send(res, 200, { ok: true });
  } catch (e) {
    if (e instanceof SyntaxError) return send(res, 400, { error: "Bad JSON." });
    if (e instanceof StoreError) return send(res, e.status, { error: e.message });
    console.error("[gallery] report failed", e);
    send(res, 500, { error: "Something broke on our side." });
  }
}
