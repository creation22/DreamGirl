// Shared by the quiz (instant feedback) and the API (the real check).
// Only typed "Something else" answers can contain these; the fixed options never do.
//
// DreamHer draws whatever outfit or scene people ask for, nudity included. The one
// thing it never draws is anyone who is, or looks like, a minor. That check stays.

const MINOR_TERMS = [
  "child", "children", "childlike", "child-like", "kid", "kids", "minor", "minors", "underage", "under age",
  "under-age", "teen", "teens", "teenage", "teenager", "preteen", "pre-teen", "tween", "adolescent",
  "young girl", "little girl", "schoolgirl", "school girl", "school uniform", "highschool", "high school",
  "middle school", "elementary", "loli", "lolita", "shota", "toddler", "baby", "infant", "jailbait",
  "petite girl", "girl child", "barely legal", "young-looking", "young looking", "looks young", "flat chest",
  "flat chested", "flat-chested", "babyface", "baby face", "baby-faced", "tiny body", "small body",
  "child body", "childish body", "daughter", "student", "school", "pigtails",
];

// Disguised spellings: "t33n", "l0li", "s c h o o l g i r l", "s.c.h.o.o.l.g.i.r.l".
// Digits become letters and spaced-out letters are joined, then words are checked whole,
// so "canteen" or "fifteen minutes" aren't caught by the "teen" inside them.
const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s", "!": "i" };
const undisguise = (t) =>
  t
    .toLowerCase()
    .replace(/[013457@$!]/g, (c) => LEET[c])
    .replace(/\b([a-z])[\s.\-_*]+(?=[a-z]\b)/g, "$1");

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (terms) => new RegExp(`\\b(?:${terms.map(escape).join("|")})\\b`, "i");

const MINOR_RE = wordRe(MINOR_TERMS);
// "16", "16 yo", "16 years old", "age 15": any stated age under 18.
const AGE_RE = /\b(?:age\s*)?(1[0-7]|[1-9])\s*(?:yo|y\/o|y\.o\.|yrs?|years?(?:\s*old)?)\b|\bage[ds]?\s*(1[0-7]|[1-9])\b/i;

/** Returns a message if the text can't be drawn, otherwise null. */
export function checkText(text) {
  if (!text) return null;
  const t = String(text).normalize("NFKC");
  if (MINOR_RE.test(t) || AGE_RE.test(t) || MINOR_RE.test(undisguise(t))) {
    return "DreamHer only draws adult women. Describe her look or style without age words.";
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
