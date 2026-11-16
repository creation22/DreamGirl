// GET /api/stars  The GitHub repo's star count, for the "Star" button.
// One shared, CDN-cached answer, so visitors don't each spend GitHub's
// 60-calls-an-hour unauthenticated limit. Set GITHUB_TOKEN (any token, no scopes
// needed for a public repo) to raise the server's own limit to 5,000 an hour.
import { send } from "./_lib/http.js";

const REPO = process.env.GITHUB_REPO || "creation22/DreamGirl";
const FRESH_MS = 60 * 1000;
let cached = null; // { stars, at } kept while this instance is warm

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed." });
  }
  const headers = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" };
  if (cached && Date.now() - cached.at < FRESH_MS) return send(res, 200, { stars: cached.stars }, headers);

  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dreamher-stars",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    const stars = (await r.json())?.stargazers_count;
    if (typeof stars !== "number") throw new Error("No star count in GitHub's answer");
    cached = { stars, at: Date.now() };
    send(res, 200, { stars }, headers);
  } catch (e) {
    console.error("[stars]", e?.message);
    // An older number beats none.
    if (cached) return send(res, 200, { stars: cached.stars, stale: true }, { "Cache-Control": "public, s-maxage=30" });
    send(res, 502, { error: "Couldn't reach GitHub." });
  }
}
