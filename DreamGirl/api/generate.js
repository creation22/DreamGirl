// POST /api/generate {answers, username?}
// Draws a portrait through Surplus, stores the image, and (with a username) posts it to the
// public gallery. Returns the image URL, the receipt, and a private key for removing it.
import { randomBytes, randomUUID } from "node:crypto";
import { getStore, StoreError } from "./_lib/store.js";
import { drawPortrait, GenerateError, modelLabel } from "./_lib/surplus.js";
import { readJson, send, sha256, visitorHash } from "./_lib/http.js";
import { PER_IP } from "./_lib/limit.js";
import { checkAnswers, normalizeHandle } from "../src/utils/moderation.js";
import { generatePrompt } from "../src/utils/generateprompt.js";
import { captionFor, questions } from "../src/constants/question.js";

// There's no login, so a visitor is the salted hash of their IP: three portraits per IP,
// for good. Every portrait ever drawn from that IP counts, including ones since removed or
// hidden. An optional bot check (Cloudflare Turnstile, when TURNSTILE_SECRET_KEY is set)
// keeps scripts from calling this straight.
async function passesBotCheck(token, req) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const form = new URLSearchParams({ secret, response: token });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (ip) form.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    return (await r.json())?.success === true;
  } catch (e) {
    console.error("[generate] turnstile", e?.message);
    return false;
  }
}

function cleanAnswers(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  for (const { key } of questions) {
    const v = raw[key];
    if (typeof v !== "string") return null;
    const t = v.trim();
    if (!t || t.length > 120) return null;
    out[key] = t;
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed." });
  }
  const store = getStore();
  if (!store) return send(res, 503, { error: "DreamHer isn't fully set up yet." });

  const ipHash = visitorHash(req);
  // Every request goes into the prompt log, whatever happens to it. Awaited (serverless
  // functions can freeze once the response is sent), but a log failure never stops a portrait.
  const entry = { ip_hash: ipHash, username: null, answers: null, prompt: null };
  const log = (status, extra = {}) =>
    store.logPrompt({ ...entry, status, ...extra }).catch((e) => console.error("[generate] prompt log", e?.message));
  const reply = async (status, code, error) => {
    await log(status, { reason: error });
    return send(res, code, { error });
  };

  try {
    const body = await readJson(req);
    if (typeof body.username === "string") entry.username = body.username.trim().slice(0, 40) || null;
    if (body.answers && typeof body.answers === "object") entry.answers = body.answers;
    const answers = cleanAnswers(body.answers);
    if (!answers) return reply("invalid", 400, "All 10 answers are needed to draw her.");
    entry.answers = answers;
    const prompt = generatePrompt(answers);
    entry.prompt = prompt.positive;
    const problem = checkAnswers(answers);
    if (problem) return reply("blocked", 422, problem);
    // Every portrait goes in the public gallery, so a username is required.
    const username = typeof body.username === "string" ? normalizeHandle(body.username) : null;
    if (!username) {
      return reply("invalid", 400, body.username
        ? "That doesn't look like an X username. Use letters, numbers and _ (up to 15)."
        : "Add your X username first.");
    }
    entry.username = username;
    if (!(await passesBotCheck(body.turnstileToken, req))) {
      return reply("limited", 403, "We couldn't check that you're human. Reload the page and try again.");
    }

    const used = await store.countForIp(ipHash);
    if (used >= PER_IP) {
      return reply("limited", 429, `That's all ${PER_IP} of your portraits. Thanks for dreaming with DreamHer.`);
    }

    const drawn = await drawPortrait(prompt.positive);
    // Kept on the entry so a failure after this point still logs what Surplus charged.
    entry.model = drawn.model;
    entry.cost_micro = drawn.costMicro;

    const id = randomUUID();
    const image = await store.uploadImage(id, drawn.bytes, drawn.contentType);
    const token = randomBytes(24).toString("base64url");
    const item = await store.insert({
      id,
      username,
      image_url: image.url,
      storage_path: image.path,
      caption: captionFor(answers) || "dream girl",
      style: answers.imageGenerationStyle,
      model: drawn.model,
      cost_micro: drawn.costMicro,
      list_micro: drawn.listMicro,
      gen_ms: drawn.ms,
      delete_token_hash: sha256(token),
      ip_hash: ipHash,
    });
    await log("drawn", { portrait_id: id, model: drawn.model, cost_micro: drawn.costMicro });

    send(res, 201, {
      item,
      token,
      posted: !!username,
      receipt: {
        model: drawn.model,
        modelLabel: modelLabel(drawn.model),
        costMicro: drawn.costMicro,
        listMicro: drawn.listMicro,
        seconds: Math.round(drawn.ms / 100) / 10,
      },
      prompt: prompt.positive,
      quota: { used: used + 1, limit: PER_IP, remaining: Math.max(0, PER_IP - used - 1) },
    });
  } catch (e) {
    if (e instanceof SyntaxError) return reply("invalid", 400, "Bad JSON.");
    if (e instanceof GenerateError || e instanceof StoreError) return reply("failed", e.status, e.message);
    console.error("[generate] unexpected", e);
    return reply("failed", 500, "Something broke on our side. Try again.");
  }
}
