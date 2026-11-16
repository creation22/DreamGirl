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

  try {
    const body = await readJson(req);
    const answers = cleanAnswers(body.answers);
    if (!answers) return send(res, 400, { error: "All 10 answers are needed to draw her." });
    const problem = checkAnswers(answers);
    if (problem) return send(res, 422, { error: problem });
    const username = body.username ? normalizeHandle(body.username) : null;
    if (body.username && !username) {
      return send(res, 400, { error: "That doesn't look like an X username. Use letters, numbers and _ (up to 15)." });
    }

    const ipHash = visitorHash(req);
    const now = Date.now();
    const startOfDay = new Date(new Date(now).toISOString().slice(0, 10)).toISOString();
    const [recent, today, spent] = await Promise.all([
      store.countSince(ipHash, new Date(now - 10 * 60_000).toISOString()),
      store.countSince(ipHash, new Date(now - 86_400_000).toISOString()),
      store.spentSince(startOfDay),
    ]);
    if (recent >= PER_10_MIN) return send(res, 429, { error: "That's a lot of portraits at once. Take a breather and try again in a few minutes." });
    if (today >= PER_DAY) return send(res, 429, { error: "You've hit today's portrait limit. Come back tomorrow." });
    if (spent >= DAILY_BUDGET_MICRO) return send(res, 503, { error: "Today's free portraits are used up. Come back tomorrow." });

    const prompt = generatePrompt(answers);
    const drawn = await drawPortrait(prompt.positive);

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
    if (e instanceof SyntaxError) return send(res, 400, { error: "Bad JSON." });
    if (e instanceof GenerateError || e instanceof StoreError) return send(res, e.status, { error: e.message });
    console.error("[generate] unexpected", e);
    return send(res, 500, { error: "Something broke on our side. Try again." });
  }
}
