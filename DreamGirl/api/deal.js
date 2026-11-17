// GET /api/deal  Today's best Claude Opus 5.5 price on Surplus, for the banner on the
// result page. Read from Surplus's public market data and cached for 5 minutes, so
// every visitor shares one call. Change the model with DEAL_MODEL.
import { send } from "./_lib/http.js";

const MODEL = process.env.DEAL_MODEL || "claude-opus-5.5";
const MARKETS = "https://api.surplusintelligence.ai/api/markets";
const FRESH_MS = 5 * 60 * 1000;
let cached = null; // { deal, at } kept while this instance is warm

// Market prices are USD micro-dollars per 1M tokens.
const dollars = (micro) => Math.round(Number(micro)) / 1e6;

function toDeal(m) {
  const listIn = dollars(m.direct_input_per_1m);
  const listOut = dollars(m.direct_output_per_1m);
  const bestIn = dollars(m.best_input_per_1m);
  const bestOut = dollars(m.best_output_per_1m);
  // The best offer someone can actually buy right now ("live"), not an old outlier.
  let pct = Number(m.best_live_discount_pct);
  if (!(pct > 0 && pct < 100) && listIn > 0 && bestIn > 0) pct = (1 - bestIn / listIn) * 100;
  if (!(listIn > 0 && bestIn > 0 && pct > 0 && pct < 100)) return null;
  return {
    model: m.model,
    listIn,
    listOut,
    bestIn,
    bestOut,
    pct: Math.floor(pct),
    medianPct: Math.round(Number(m.median_live_discount_pct) || 0),
    sellers: Number(m.healthy_seller_count) || 0,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed." });
  }
  const headers = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" };
  if (cached && Date.now() - cached.at < FRESH_MS) return send(res, 200, cached.deal, headers);

  try {
    const r = await fetch(MARKETS, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`markets ${r.status}`);
    const data = await r.json();
    const list = Array.isArray(data) ? data : data.markets || data.data || Object.values(data);
    const market = list.find((m) => m?.model === MODEL);
    const deal = market && toDeal(market);
    if (!deal) throw new Error(`no usable market for ${MODEL}`);
    cached = { deal, at: Date.now() };
    send(res, 200, deal, headers);
  } catch (e) {
    console.error("[deal]", e?.message);
    if (cached) return send(res, 200, { ...cached.deal, stale: true }, { "Cache-Control": "public, s-maxage=60" });
    send(res, 502, { error: "Couldn't load the deal." });
  }
}
