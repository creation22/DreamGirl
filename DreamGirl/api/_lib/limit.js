/**
 * The one limit DreamHer has: how many portraits a single IP may ever draw.
 * A visitor is the salted hash of their IP (see visitorHash in http.js) — the raw
 * address is never stored.
 */
export const PER_IP = Number(process.env.LIMIT_PER_IP) || 3;
