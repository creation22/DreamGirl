// GET /api/stats  Totals for the "drawn for $X on Surplus" counters.
import { getStore } from "./_lib/store.js";
import { send } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed." });
  }
  const store = getStore();
  if (!store) return send(res, 503, { error: "Not set up yet." });
  try {
    const s = await store.stats();
    send(
      res,
      200,
      { portraits: Number(s.portraits) || 0, costMicro: Number(s.cost_micro) || 0, listMicro: Number(s.list_micro) || 0 },
      { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    );
  } catch (e) {
    console.error("[stats]", e?.message);
    send(res, 502, { error: "Couldn't load totals." });
  }
}
