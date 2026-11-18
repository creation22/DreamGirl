// GET /api/quota — how many portraits this visitor has left.
// Called when the site loads, which is also where the visit is noted: the IP is hashed
// with IP_HASH_SALT and counted in the `visitors` table. The raw address is never stored.
import { getStore } from "./_lib/store.js";
import { PER_IP } from "./_lib/limit.js";
import { send, visitorHash } from "./_lib/http.js";

const open = { used: 0, limit: PER_IP, remaining: PER_IP };

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed." });
  }
  const headers = { "Cache-Control": "no-store" };
  const store = getStore();
  if (!store) return send(res, 200, open, headers);

  const ipHash = visitorHash(req);
  try {
    // The visit is best effort; the count is what the answer is about.
    const [used] = await Promise.all([
      store.countForIp(ipHash),
      store.trackVisit(ipHash).catch((e) => console.error("[quota] visit", e?.message)),
    ]);
    return send(res, 200, { used, limit: PER_IP, remaining: Math.max(0, PER_IP - used) }, headers);
  } catch (e) {
    // Never hold up the site for this — /api/generate does the real check.
    console.error("[quota]", e?.message);
    return send(res, 200, open, headers);
  }
}
