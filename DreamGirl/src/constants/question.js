// Each question writes one field of the answers object that generatePrompt reads.
// `custom: true` adds a "Something else" choice with a free-text box.
export const questions = [
  {
    key: "aura",
    question: "What vibe does she give off?",
    options: ["Confident & Classy", "Sporty & Rational", "Mysterious & Magnetic", "Charming & Irresistible"],
    custom: true,
  },
  {
    key: "race",
    question: "What's her ethnic background?",
    options: ["Indian", "White/Caucasian", "Black/African", "Asian", "Latina", "Middle Eastern"],
    custom: true,
  },
  {
    key: "bodyType",
    question: "What's her body type?",
    options: ["Slim", "Athletic", "Curvy", "Thick", "Plus Size"],
  },
  {
    key: "skinTone",
    question: "What's her skin tone?",
    options: ["Fair/Light", "Medium/Olive", "Tan", "Brown", "Dark"],
  },
  {
    key: "facialStructure",
    question: "What shape is her face?",
    options: ["Oval", "Round", "Heart Shaped", "Diamond", "Square", "Angular"],
  },
  {
    key: "outfit",
    question: "What is she wearing?",
    options: ["Elegant", "Casual", "Trendy", "Traditional/Cultural", "Sporty"],
    custom: true,
  },
  {
    key: "hairstyle",
    question: "How is her hair?",
    options: ["Long & Straight", "Curly", "Wavy", "Short Bob", "Braided", "Ponytail"],
    custom: true,
  },
  {
    key: "facialExpression",
    question: "What's her expression?",
    options: ["Smiling", "Serious", "Shy", "Playful"],
    custom: true,
  },
  {
    key: "accessories",
    question: "Any accessories?",
    options: ["None", "Glasses", "Jewelry", "Piercings/Tattoos", "Hat/Cap"],
    custom: true,
  },
  {
    key: "imageGenerationStyle",
    question: "How should she be drawn?",
    options: ["Realistic", "Semi-Realistic", "Anime", "3D Render", "Cartoon", "Fantasy"],
  },
];

// A short handwritten-style caption built from the answers, e.g.
// "curly, smiling, glasses, anime"
// Pass `all` to note every answer (the quiz's running notes).
const CAPTION_KEYS = ["hairstyle", "facialExpression", "accessories", "outfit", "imageGenerationStyle"];
export function captionFor(answers, { all = false } = {}) {
  const keys = all ? questions.map((q) => q.key) : CAPTION_KEYS;
  return keys
    .map((k) => answers?.[k]?.trim())
    .filter((v) => v && v.toLowerCase() !== "none")
    .map((v) => v.toLowerCase())
    .join(", ");
}
