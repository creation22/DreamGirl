// POST /api/generate {answers, username?}
// Draws a portrait through Surplus, stores the image, and (with a username) posts it to the
// public gallery. Returns the image URL, the receipt, and a private key for removing it.
import { randomBytes, randomUUID } from "node:crypto";
import { getStore, StoreError } from "./_lib/store.js";
import { drawPortrait, GenerateError, modelLabel } from "./_lib/surplus.js";
import { readJson, send, sha256, visitorHash } from "./_lib/http.js";
import { checkAnswers, normalizeHandle } from "../src/utils/moderation.js";
import { generatePrompt } from "../src/utils/generateprompt.js";
import { captionFor, questions } from "../src/constants/question.js";

const PER_10_MIN = Number(process.env.LIMIT_PER_10_MIN) || 6;
const PER_DAY = Number(process.env.LIMIT_PER_DAY) || 30;
const DAILY_BUDGET_MICRO = Math.round((Number(process.env.DAILY_BUDGET_USD) || 5) * 1e6);

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
    const username = body.username ? normalizeHandle(body.username) : null;
    if (body.username && !username) {
      return reply("invalid", 400, "That doesn't look like an X username. Use letters, numbers and _ (up to 15).");
    }
    entry.username = username;

    const now = Date.now();
    const startOfDay = new Date(new Date(now).toISOString().slice(0, 10)).toISOString();
    const [recent, today, spent] = await Promise.all([
      store.countSince(ipHash, new Date(now - 10 * 60_000).toISOString()),
      store.countSince(ipHash, new Date(now - 86_400_000).toISOString()),
      store.spentSince(startOfDay),
    ]);
    if (recent >= PER_10_MIN) return reply("limited", 429, "That's a lot of portraits at once. Take a breather and try again in a few minutes.");
    if (today >= PER_DAY) return reply("limited", 429, "You've hit today's portrait limit. Come back tomorrow.");
    if (spent >= DAILY_BUDGET_MICRO) return reply("limited", 503, "Today's free portraits are used up. Come back tomorrow.");

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
    });
  } catch (e) {
    if (e instanceof SyntaxError) return reply("invalid", 400, "Bad JSON.");
    if (e instanceof GenerateError || e instanceof StoreError) return reply("failed", e.status, e.message);
    console.error("[generate] unexpected", e);
    return reply("failed", 500, "Something broke on our side. Try again.");
  }
}
