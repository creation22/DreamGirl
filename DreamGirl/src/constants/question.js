// The ten questions. Each writes one field of the answers object that generatePrompt reads;
// every option has a matching phrase in utils/generateprompt.js.
// `custom: true` adds a "Something else" choice with a free-text box.
// Age has no free text on purpose: every portrait is of an adult woman.
export const questions = [
  {
    key: "aura",
    question: "What's her vibe?",
    options: [
      "Soft & sweet",
      "Confident & classy",
      "Mysterious",
      "Playful & bubbly",
      "Artsy & dreamy",
      "Smart & bookish",
      "Sporty & bold",
      "Edgy & rebellious",
      "Calm & grounded",
      "Glamorous",
    ],
    custom: true,
  },
  {
    key: "race",
    question: "Where's her family from?",
    options: [
      "South Asian",
      "East Asian",
      "Southeast Asian",
      "Black / African",
      "White / European",
      "Latina",
      "Middle Eastern",
      "Mixed heritage",
    ],
    custom: true,
  },
  {
    key: "age",
    question: "How old is she?",
    options: ["Early twenties", "Mid twenties", "Late twenties", "Thirties", "Forties"],
  },
  {
    key: "skinTone",
    question: "What's her skin tone?",
    options: ["Porcelain", "Fair", "Light olive", "Golden tan", "Warm brown", "Deep brown", "Ebony"],
  },
  {
    key: "hairstyle",
    question: "How does she wear her hair?",
    options: [
      "Long & straight",
      "Long waves",
      "Curly",
      "Coily afro",
      "Braids",
      "High ponytail",
      "Messy bun",
      "Bob",
      "Pixie cut",
      "With bangs",
    ],
    custom: true,
  },
  {
    key: "hairColor",
    question: "And its colour?",
    options: ["Jet black", "Dark brown", "Chestnut", "Auburn", "Copper red", "Honey blonde", "Platinum", "Silver", "Pastel pink"],
    custom: true,
  },
  {
    key: "outfit",
    question: "What's she wearing?",
    options: [
      "Sundress",
      "Saree",
      "Lehenga",
      "Cosy knit sweater",
      "Leather jacket",
      "Little black dress",
      "Denim & white tee",
      "Tailored suit",
      "Athleisure",
      "Evening gown",
    ],
    custom: true,
  },
  {
    key: "facialExpression",
    question: "How is she looking at you?",
    options: ["Warm smile", "Laughing", "Shy glance", "Playful smirk", "Dreamy", "Serious", "Confident", "Mid-wink"],
    custom: true,
  },
  {
    key: "setting",
    question: "Where do you see her?",
    options: [
      "Café by the window",
      "Beach at golden hour",
      "Rainy city street",
      "Rooftop at night",
      "Flower garden",
      "Old library",
      "Snowy mountains",
      "Neon-lit city",
      "Cosy reading nook",
      "Plain studio backdrop",
    ],
    custom: true,
  },
  {
    key: "imageGenerationStyle",
    question: "How should she be painted?",
    options: [
      "Realistic photo",
      "Cinematic film still",
      "Vintage film photo",
      "Soft oil painting",
      "Watercolour",
      "Pencil sketch",
      "Anime",
      "3D animated",
      "Comic book",
      "Fantasy art",
    ],
  },
];

// A short caption for the portrait, e.g. "auburn long waves, laughing, sundress,
// beach at golden hour, watercolour". Pass `all` to list every answer (the quiz's notes).
const CAPTION_KEYS = ["hairColor", "hairstyle", "facialExpression", "outfit", "setting", "imageGenerationStyle"];
export function captionFor(answers, { all = false } = {}) {
  const keys = all ? questions.map((q) => q.key) : CAPTION_KEYS;
  const parts = keys.map((k) => answers?.[k]?.trim()).filter(Boolean).map((v) => v.toLowerCase());
  // "auburn" + "long waves" read better as one item
  if (!all && answers?.hairColor && answers?.hairstyle) {
    parts.splice(0, 2, `${answers.hairColor.trim().toLowerCase()} ${answers.hairstyle.trim().toLowerCase()}`);
  }
  return parts.join(", ");
}
