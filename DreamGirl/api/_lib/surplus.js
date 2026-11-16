// Draws a portrait through Surplus Intelligence's marketplace and reports what it cost.
// Docs: POST /v1/images/generations (OpenAI-compatible, synchronous). The exact charge
// comes back in the x-si-buyer-cost-micro header (USD microdollars).
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const BASE = (process.env.SURPLUS_BASE_URL || "https://api.surplusintelligence.ai").replace(/\/+$/, "");
const SIZE = "1024x1024";
const MEGAPIXELS = (1024 * 1024) / 1e6;
// First model that answers wins. Override with SURPLUS_IMAGE_MODELS="a,b,c".
const MODELS = (process.env.SURPLUS_IMAGE_MODELS || "venice-flux-2-pro,flux.2-klein-4b")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const TIMEOUT_MS = 50_000;

export class GenerateError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

// Friendly model names for the receipt.
const LABELS = {
  "venice-flux-2-pro": "FLUX.2 Pro",
  "venice-flux-2-max": "FLUX.2 Max",
  "flux.2-klein-4b": "FLUX.2 Klein 4B",
  "flux.2-flex": "FLUX.2 Flex",
  "seedream-4.5": "Seedream 4.5",
  "venice-z-image-turbo": "Z-Image Turbo",
};
export const modelLabel = (id) => LABELS[id] || id;

// List prices from the public /v1/models catalog, cached for 10 minutes per instance.
let catalog = { at: 0, prices: new Map() };
async function listPriceMicro(model) {
  if (Date.now() - catalog.at > 10 * 60_000) {
    try {
      const res = await fetch(`${BASE}/v1/models`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      const prices = new Map();
      for (const m of data.data || data) {
        const price = Number(m.pricing?.image);
        const unit = m.media_unit || m.pricing?.media_unit;
        if (price > 0) prices.set(m.id, { price, unit });
      }
      catalog = { at: Date.now(), prices };
    } catch (e) {
      console.warn("[surplus] couldn't refresh list prices", e?.message);
    }
  }
  const p = catalog.prices.get(model);
  if (!p) return 0;
  const units = p.unit === "megapixel" ? MEGAPIXELS : 1;
  return Math.round(p.price * units * 1e6);
}

function sniffType(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

async function callModel(model, prompt, key) {
  const started = Date.now();
  let res;
  try {
    res = await fetch(`${BASE}/v1/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, n: 1, size: SIZE, response_format: "b64_json" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    return { retry: true, reason: e?.name === "TimeoutError" ? "timeout" : "network" };
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json()).slice(0, 300);
    } catch {
      /* not JSON */
    }
    console.error("[surplus]", model, res.status, detail, "attempts:", res.headers.get("x-si-attempts") || "");
    if (res.status === 402) throw new GenerateError("Today's free portraits are used up. Come back tomorrow.", 503);
    if (res.status === 400 && /moderat|safety|policy|nsfw/i.test(detail)) {
      throw new GenerateError("The image service refused that description. Try changing a typed answer.", 422);
    }
    // 404 = no sellers for this model, 5xx = provider failed: try the next model.
    return { retry: true, reason: String(res.status) };
  }

  const data = await res.json();
  const item = data.data?.[0] || {};
  let bytes;
  if (item.b64_json) bytes = Buffer.from(item.b64_json, "base64");
  else if (item.url) bytes = Buffer.from(await (await fetch(item.url, { signal: AbortSignal.timeout(15000) })).arrayBuffer());
  if (!bytes?.length) return { retry: true, reason: "empty" };

  return {
    bytes,
    contentType: sniffType(bytes) || "image/png",
    model,
    costMicro: Number(res.headers.get("x-si-buyer-cost-micro")) || 0,
    ms: Date.now() - started,
  };
}

// Local dev without a key: return a sample picture and a made-up price so the UI can be tried.
async function devSample() {
  const files = ["braids-gold", "bob-glasses", "cartoon-classic", "indian-smile", "serious-dark"];
  const name = files[Math.floor(Math.random() * files.length)];
  await new Promise((r) => setTimeout(r, 1500));
  const bytes = await readFile(resolve(process.cwd(), "scripts", "dev-samples", `${name}.webp`));
  return { bytes, contentType: "image/webp", model: "venice-flux-2-pro", costMicro: 7500 + Math.floor(Math.random() * 3000), ms: 1500 };
}

export async function drawPortrait(prompt) {
  const key = process.env.SURPLUS_API_KEY;
  let out;
  if (!key) {
    if (process.env.DREAMHER_DEV_STORE !== "memory") throw new GenerateError("Image generation isn't set up yet.", 503);
    out = await devSample();
  } else {
    const reasons = [];
    for (const model of MODELS) {
      const r = await callModel(model, prompt, key);
      if (!r.retry) {
        out = r;
        break;
      }
      reasons.push(`${model}:${r.reason}`);
    }
    if (!out) {
      console.error("[surplus] all models failed", reasons.join(", "));
      throw new GenerateError("The drawing service is busy right now. Try again in a minute.", 502);
    }
  }
  out.listMicro = await listPriceMicro(out.model);
  return out;
}
