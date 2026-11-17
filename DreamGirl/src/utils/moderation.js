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
  "nude", "nudes", "nudity", "naked", "nakid", "nekkid", "nsfw", "topless", "bottomless", "porn", "porno",
  "pornographic", "sex", "sexy", "sexual", "explicit", "nipple", "nipples", "areola", "genital", "genitals",
  "vagina", "pussy", "penis", "breast", "breasts", "boob", "boobs", "tits", "titties", "butt", "ass",
  "lingerie", "bikini", "bra", "bralette", "underwear", "undies", "panties", "thong", "g-string", "gstring",
  "see-through", "see through", "sheer", "transparent", "fetish", "bdsm", "bondage", "hentai", "ecchi",
  "erotic", "xxx", "onlyfans", "unclothed", "undressed", "undressing", "unclad", "disrobed", "bare-chested",
  "barechested", "strip", "stripping", "stripper", "striptease", "skinny dip", "skinny dipping",
  "birthday suit", "au naturel", "in the buff", "body paint", "bodypaint", "towel", "bathtub", "shower",
  "bed sheet", "bedsheet", "covered by", "covering herself", "censored", "seductive", "seducing", "aroused",
  "lewd", "horny", "slutty", "slut", "provocative", "revealing", "skimpy", "cleavage", "spread legs",
];

// "wearing nothing", "no clothes", "without a top", "nothing on", "bare skin" and the like.
const UNDRESSED_RE = new RegExp(
  [
    String.raw`\b(?:wearing|wears|wear|in|with|has|having)\s+(?:absolutely\s+|just\s+|only\s+)?(?:nothing|none|no\s*thing)\b`,
    String.raw`\bnothing\s+(?:on|at\s+all|but|except|else)\b`,
    String.raw`\b(?:no|without|zero|minus|lacking|missing)\s+(?:any\s+|a\s+|her\s+|the\s+)?(?:clothes|clothing|clothed|garments?|outfit|dress|top|tops|shirt|blouse|bra|pants|trousers|skirt|bottoms?|underwear|panties|cover(?:ing)?|fabric)\b`,
    String.raw`\b(?:takes?|taking|took|pulls?|pulling|slips?|slipping)\s+(?:off|down)\b`,
    String.raw`\b(?:bare|exposed|uncovered)\s+(?:skin|body|chest|breasts?|bust|torso|butt|bottom|hips|naked)\b`,
    String.raw`\bnot\s+wearing\b`,
  ].join("|"),
  "i",
);

// Spelled-out or disguised words: "n u d e", "n.a.k.e.d", "nak3d", "p0rn".
const SQUASHED_TERMS = ["nude", "naked", "nsfw", "topless", "porn", "hentai", "nipple", "lingerie", "unclothed", "undressed"];
const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s", "!": "i" };
const squash = (t) =>
  t
    .toLowerCase()
    .replace(/[013457@$!]/g, (c) => LEET[c])
    .replace(/[^a-z]/g, "");

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
  const squashed = squash(t);
  if (MINOR_RE.test(t) || AGE_RE.test(t) || /(?:loli|teen|underage|schoolgirl|child)/.test(squashed)) {
    return "DreamHer only draws adult women. Describe her look or style without age words.";
  }
  if (EXPLICIT_RE.test(t) || UNDRESSED_RE.test(t) || SQUASHED_TERMS.some((w) => squashed.includes(w))) {
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
