// Shared by the quiz (instant feedback) and the API (the real check).
// Only typed "Something else" answers can contain these; the fixed options never do.

const MINOR_TERMS = [
  "child", "children", "kid", "kids", "minor", "minors", "underage", "under age", "under-age",
  "teen", "teens", "teenage", "teenager", "preteen", "pre-teen", "tween", "adolescent",
  "young girl", "little girl", "schoolgirl", "school girl", "school uniform", "highschool", "high school",
  "middle school", "elementary", "loli", "lolita", "shota", "toddler", "baby", "infant", "jailbait",
  "petite girl", "girl child",
];

const EXPLICIT_TERMS = [
  "nude", "nudes", "naked", "nsfw", "topless", "bottomless", "porn", "porno", "pornographic", "sex",
  "sexual", "explicit", "nipple", "nipples", "genital", "genitals", "vagina", "penis", "lingerie",
  "bikini", "underwear", "panties", "thong", "see-through", "see through", "fetish", "bdsm", "hentai",
  "erotic", "xxx", "onlyfans",
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (terms) => new RegExp(`\\b(?:${terms.map(escape).join("|")})\\b`, "i");

const MINOR_RE = wordRe(MINOR_TERMS);
const EXPLICIT_RE = wordRe(EXPLICIT_TERMS);
// "16", "16 yo", "16 years old", "age 15": any stated age under 18.
const AGE_RE = /\b(?:age\s*)?(1[0-7]|[1-9])\s*(?:yo|y\/o|y\.o\.|yrs?|years?(?:\s*old)?)\b|\bage[ds]?\s*(1[0-7]|[1-9])\b/i;

/** Returns a message if the text can't be drawn, otherwise null. */
export function checkText(text) {
  if (!text) return null;
  const t = String(text).normalize("NFKC");
  if (MINOR_RE.test(t) || AGE_RE.test(t)) {
    return "DreamHer only draws adult women. Describe her look or style without age words.";
  }
  if (EXPLICIT_RE.test(t)) {
    return "The public gallery keeps things clothed and safe for work. Try another description.";
  }
  return null;
}

/** First problem across all answers, or null. */
export function checkAnswers(answers) {
  for (const value of Object.values(answers || {})) {
    const problem = checkText(value);
    if (problem) return problem;
  }
  return null;
}

/**
 * Turns "@Name", "name", "x.com/name" or "https://twitter.com/name" into "Name".
 * Returns null unless it's a valid X username (letters, numbers, _; up to 15).
 */
export function normalizeHandle(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  const fromUrl = s.match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x|twitter)\.com\/([^/?#\s]+)/i);
  if (fromUrl) s = fromUrl[1];
  s = s.replace(/^@+/, "");
  return /^[A-Za-z0-9_]{1,15}$/.test(s) ? s : null;
}
