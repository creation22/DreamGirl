import { createHash } from "node:crypto";

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export function queryOf(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

const MAX_BODY = 16 * 1024;

export async function readJson(req) {
  // Vercel parses JSON bodies already; plain Node (local dev) doesn't.
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  }
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw Object.assign(new Error("Body too large"), { status: 413 });
  }
  return raw ? JSON.parse(raw) : {};
}

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** A salted hash of the caller's IP, for rate limits and one-report-per-visitor. */
export function visitorHash(req) {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  return sha256(`${process.env.IP_HASH_SALT || "dreamher"}:${ip}`);
}
