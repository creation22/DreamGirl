/**
 * Builds the image prompt from the quiz answers, as plain sentences (FLUX-style models
 * follow natural language better than tag lists). Every option in constants/question.js
 * has a phrase here; anything typed in "Something else" is used as written.
 *
 * The angle, framing and light are picked at random each call (see shotFor), so the same
 * answers don't give the same picture twice. Everything a visitor chose is kept exactly.
 *
 * @param {Object} answers - keyed by the `key` of each question.
 * @returns {{positive: string, negative: string} | null}
 */

const AURA = {
  "soft & sweet": "soft and sweet",
  "confident & classy": "confident and classy",
  mysterious: "quietly mysterious",
  "playful & bubbly": "playful and bubbly",
  "artsy & dreamy": "artsy and dreamy",
  "smart & bookish": "smart and bookish",
  "sporty & bold": "sporty and bold",
  "edgy & rebellious": "edgy and rebellious",
  "calm & grounded": "calm and grounded",
  glamorous: "effortlessly glamorous",
};

const HERITAGE = {
  "south asian": "South Asian",
  "east asian": "East Asian",
  "southeast asian": "Southeast Asian",
  "black / african": "Black African",
  "white / european": "white European",
  latina: "Latina",
  "middle eastern": "Middle Eastern",
  "mixed heritage": "mixed-heritage",
};

const AGE = {
  "early twenties": "in her early twenties",
  "mid twenties": "in her mid twenties",
  "late twenties": "in her late twenties",
  thirties: "in her thirties",
  forties: "in her forties",
};

const SKIN = {
  porcelain: "porcelain skin",
  fair: "fair skin",
  "light olive": "light olive skin",
  "golden tan": "golden tanned skin",
  "warm brown": "warm brown skin",
  "deep brown": "deep brown skin",
  ebony: "rich ebony skin",
};

// {c} is where the hair colour goes ("long, sleek auburn straight hair").
const HAIR = {
  "long & straight": "long, sleek {c}straight hair",
  "long waves": "long, loose {c}waves",
  curly: "voluminous {c}curls",
  "coily afro": "a full {c}coily afro",
  braids: "long {c}braids",
  "high ponytail": "{c}hair in a high ponytail",
  "messy bun": "{c}hair in a messy bun with loose strands",
  bob: "a chin-length {c}bob",
  "pixie cut": "a {c}pixie cut",
  "with bangs": "{c}hair with soft bangs",
};

const HAIR_COLOR = {
  "jet black": "jet-black",
  "dark brown": "dark brown",
  chestnut: "chestnut",
  auburn: "auburn",
  "copper red": "copper-red",
  "honey blonde": "honey-blonde",
  platinum: "platinum",
  silver: "silver",
  "pastel pink": "pastel pink",
};

const OUTFIT = {
  sundress: "a flowing sundress",
  saree: "an elegant silk saree",
  lehenga: "an embroidered lehenga",
  "cosy knit sweater": "a cosy oversized knit sweater",
  "leather jacket": "a black leather jacket",
  "little black dress": "a little black dress",
  "denim & white tee": "a white tee and denim jacket",
  "tailored suit": "a sharply tailored suit",
  athleisure: "stylish athleisure",
  "evening gown": "an elegant evening gown",
};

const EXPRESSION = {
  "warm smile": "smiling warmly",
  laughing: "mid-laugh, eyes crinkled with joy",
  "shy glance": "glancing shyly, half smiling",
  "playful smirk": "smirking playfully",
  dreamy: "lost in a dreamy, faraway look",
  serious: "holding a serious, steady gaze",
  confident: "looking confidently straight at the camera",
  "mid-wink": "caught mid-wink",
};

const SETTING = {
  "café by the window": "sitting by a café window with soft daylight",
  "beach at golden hour": "on a beach at golden hour, warm sunset light",
  "rainy city street": "on a rainy city street, reflections on wet pavement",
  "rooftop at night": "on a rooftop at night with city lights behind her",
  "flower garden": "in a blooming flower garden",
  "old library": "among tall shelves in an old library",
  "snowy mountains": "in snowy mountains, crisp winter light",
  "neon-lit city": "in a neon-lit city at night",
  "cosy reading nook": "in a cosy reading nook with warm lamplight",
  "plain studio backdrop": "against a plain studio backdrop",
};

// [how the picture is made, finishing details]
const STYLE = {
  "realistic photo": ["A realistic portrait photograph", "shot on a full-frame camera with an 85mm lens, natural skin texture, shallow depth of field"],
  "cinematic film still": ["A cinematic film still", "anamorphic lens, moody colour grading, soft film grain, shallow depth of field"],
  "vintage film photo": ["A vintage 35mm film photograph", "warm faded colours, gentle light leaks, analog grain"],
  "soft oil painting": ["A soft oil painting portrait", "visible brushstrokes, painterly light, classical composition"],
  watercolour: ["A delicate watercolour portrait", "soft washes of colour, textured paper, loose edges"],
  "pencil sketch": ["A detailed pencil sketch portrait", "graphite shading on textured paper, fine linework"],
  anime: ["An anime illustration", "clean line art, cel shading, expressive eyes, vibrant colours"],
  "3d animated": ["A stylised 3D animated character portrait", "soft global illumination, expressive features, polished render"],
  "comic book": ["A comic book illustration", "bold ink lines, halftone shading, vivid flat colours"],
  "fantasy art": ["A fantasy art portrait", "ethereal glow, intricate detail, rich painterly colour"],
};

// Two people who answer the quiz the same way should still get different pictures, and
// "draw her again" should be worth pressing. Nothing else can vary the draw: no image
// model on Surplus accepts a seed (all 85 checked, Nov 2026), so an identical prompt
// returns an identical picture. One angle, one framing and one light are picked at
// random per request -- hundreds of combinations, and the quiz answers still decide
// everything that matters about her.
const PHOTO_SHOT = {
  angle: [
    "Shot straight on at eye level",
    "Shot from a slightly high angle",
    "Shot from just below eye level",
    "Shot in three-quarter profile",
    "Caught as she turns back over her shoulder",
    "Shot from the side as she looks away",
  ],
  framing: [
    "head and shoulders filling the frame",
    "framed from the waist up",
    "a loose frame with room around her",
    "a close crop on her face",
    "framed off-centre, with space on one side",
  ],
  light: [
    "lit by window light from the left",
    "backlit, a warm rim around her hair",
    "in soft overcast light",
    "in low golden sunlight",
    "lit by a single warm lamp to one side",
    "in cool, even daylight",
  ],
};

const DRAWN_SHOT = {
  angle: [
    "Drawn straight on at eye level",
    "Drawn from a slightly high angle",
    "Drawn from just below eye level",
    "Drawn in three-quarter view",
    "Drawn as she turns back over her shoulder",
    "Drawn from the side as she looks away",
  ],
  framing: [
    "head and shoulders filling the frame",
    "framed from the waist up",
    "a loose frame with room around her",
    "a close crop on her face",
    "framed off-centre, with space on one side",
  ],
  light: [
    "light falling from the left",
    "a bright rim of light behind her",
    "soft, even light",
    "warm low light and long shadows",
    "strong contrast between light and shadow",
    "gentle, diffused light",
  ],
};

// Styles made with a camera; everything else is drawn or painted.
const PHOTO_STYLES = new Set(["realistic photo", "cinematic film still", "vintage film photo"]);

const one = (list) => list[Math.floor(Math.random() * list.length)];

/** One sentence of angle, framing and light, in the right vocabulary for the style. */
function shotFor(style) {
  const shot = PHOTO_STYLES.has(style) ? PHOTO_SHOT : DRAWN_SHOT;
  return `${one(shot.angle)}, ${one(shot.framing)}, ${one(shot.light)}.`;
}

const pick = (map, value, fallback) => {
  const v = value?.trim();
  if (!v) return fallback;
  return map[v.toLowerCase()] ?? v;
};

export function generatePrompt(answers) {
  if (!answers || Object.keys(answers).length === 0) {
    return null;
  }

  const [medium, finish] = STYLE[answers.imageGenerationStyle?.trim().toLowerCase()] ?? [
    `A ${answers.imageGenerationStyle?.trim() || "beautiful"} portrait`,
    "high quality, detailed",
  ];
  const heritage = pick(HERITAGE, answers.race, "");
  const age = pick(AGE, answers.age, "in her twenties");
  const skin = pick(SKIN, answers.skinTone, "");
  const color = pick(HAIR_COLOR, answers.hairColor, "");
  const styleKey = answers.hairstyle?.trim().toLowerCase();
  const hair = HAIR[styleKey]
    ? HAIR[styleKey].replace("{c}", color ? `${color} ` : "")
    : `${color ? `${color} hair, ` : ""}${answers.hairstyle?.trim() || "beautiful hair"}`;
  const outfit = pick(OUTFIT, answers.outfit, "a stylish outfit");
  const expression = pick(EXPRESSION, answers.facialExpression, "smiling softly");
  const aura = pick(AURA, answers.aura, "warm");
  const setting = pick(SETTING, answers.setting, "");

  const who = ["a beautiful", heritage, "woman"].filter(Boolean).join(" ");
  const sentences = [
    `${medium} of ${who} ${age}${skin ? `, with ${skin}` : ""}.`,
    `She has ${hair}, and she is ${expression}.`,
    `She is wearing ${outfit}${setting ? `, ${setting}` : ""}.`,
    `Her vibe is ${aura}.`,
    // The framing and the light come from here now, so they differ from one draw to the next.
    shotFor(answers.imageGenerationStyle?.trim().toLowerCase()),
    // Always an adult; otherwise she's drawn as described.
    `Adult woman. ${finish.charAt(0).toUpperCase()}${finish.slice(1)}, high detail.`,
  ];

  const negative =
    "child, minor, teenager, nudity, ugly, deformed, blurry, low quality, bad anatomy, extra limbs, missing features, watermark, text";

  return { positive: sentences.join(" "), negative };
}
