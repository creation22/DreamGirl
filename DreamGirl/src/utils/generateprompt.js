/**
 * Builds the image prompt from the quiz answers.
 * Known options expand into richer descriptors; anything typed in
 * "Something else" is passed through as written.
 *
 * @param {Object} answers - keyed by the `key` of each question.
 * @returns {{positive: string, negative: string} | null}
 */
export function generatePrompt(answers) {
  if (!answers || Object.keys(answers).length === 0) {
    return null;
  }

  const auraMap = {
    "confident & classy": "confident, elegant, sophisticated, poised, graceful",
    "sporty & rational": "athletic, determined, focused, strong, energetic",
    "mysterious & magnetic": "enigmatic, alluring, captivating, intriguing, mesmerizing",
    "charming & irresistible": "charming, warm, magnetic smile, approachable, radiant",
  };

  const raceMap = {
    indian: "South Asian, Indian features, beautiful brown skin",
    "white/caucasian": "Caucasian, European features",
    "black/african": "African, beautiful dark skin, strong features",
    asian: "East Asian features, smooth skin, elegant bone structure",
    latina: "Latina, Latin American features, warm complexion",
    "middle eastern": "Middle Eastern features, striking dark eyes",
  };

  const bodyTypeMap = {
    slim: "slender, lean, graceful figure, elegant proportions",
    athletic: "fit, toned, healthy athletic build",
    curvy: "curvaceous, hourglass figure, well-proportioned",
    thick: "full figure, beautiful curves, confident posture",
    "plus size": "full-figured, beautiful curves, confident, radiant",
  };

  const skinToneMap = {
    "fair/light": "fair skin, porcelain complexion, smooth texture",
    "medium/olive": "olive skin tone, warm undertones, healthy glow",
    tan: "sun-kissed skin, golden tan, warm glow",
    brown: "beautiful brown skin, rich complexion, natural radiance",
    dark: "gorgeous dark skin, deep rich tone, luminous complexion",
  };

  const facialStructureMap = {
    oval: "oval face shape, balanced proportions, classic beauty",
    round: "round face, soft features, youthful appearance",
    "heart shaped": "heart-shaped face, delicate chin, prominent cheekbones",
    diamond: "diamond face shape, high cheekbones, elegant angles",
    square: "strong jawline, defined features, striking bone structure",
    angular: "angular face, sharp cheekbones, chiseled features",
  };

  const outfitMap = {
    elegant: "elegant dress, sophisticated attire, refined fashion, luxurious fabric",
    casual: "stylish casual wear, comfortable yet fashionable, modern outfit",
    trendy: "trendy fashion, contemporary style, modern design",
    "traditional/cultural": "traditional attire, cultural dress, authentic heritage fashion",
    sporty: "sporty athleisure outfit, fitted jacket, sneakers style",
  };

  const hairstyleMap = {
    "long & straight": "long straight hair, silky smooth texture, flowing locks",
    curly: "beautiful curly hair, natural curls, voluminous texture",
    wavy: "soft wavy hair, loose beach waves",
    "short bob": "stylish bob cut, modern short hairstyle, sleek and chic",
    braided: "intricate braids, detailed hair work, textured style",
    ponytail: "high sleek ponytail",
  };

  const expressionMap = {
    smiling: "warm genuine smile, bright eyes, joyful expression",
    serious: "serious expression, focused gaze, intense eyes",
    shy: "shy smile, gentle expression, soft eyes",
    playful: "playful expression, mischievous smile, lively eyes",
  };

  const accessoryMap = {
    none: "",
    glasses: "stylish eyewear, fashionable glasses",
    jewelry: "elegant jewelry, delicate earrings and necklace",
    "piercings/tattoos": "artistic tattoos, stylish piercings",
    "hat/cap": "stylish hat",
  };

  const pick = (map, value, fallback) => {
    if (!value || !value.trim()) return fallback;
    return map[value.trim().toLowerCase()] ?? value.trim();
  };

  const aura = pick(auraMap, answers.aura, "confident, beautiful");
  const race = pick(raceMap, answers.race, "mixed heritage");
  const bodyType = pick(bodyTypeMap, answers.bodyType, "athletic build");
  const skinTone = pick(skinToneMap, answers.skinTone, "healthy skin tone");
  const facialStructure = pick(facialStructureMap, answers.facialStructure, "beautiful face shape");
  const outfit = pick(outfitMap, answers.outfit, "stylish clothing");
  const hairstyle = pick(hairstyleMap, answers.hairstyle, "beautiful hairstyle");
  const facialExpression = pick(expressionMap, answers.facialExpression, "pleasant expression");
  const accessories = pick(accessoryMap, answers.accessories, "");
  const style = (answers.imageGenerationStyle || "realistic").toLowerCase();

  let prompt = `Portrait of a stunning beautiful woman, ${aura}, ${race}, ${bodyType}, ${skinTone}, ${facialStructure}, wearing ${outfit}, ${hairstyle}, ${facialExpression}`;

  if (accessories) {
    prompt += `, ${accessories}`;
  }

  const styleMods = {
    realistic:
      "photorealistic, professional photography, studio lighting, sharp focus, DSLR quality, natural skin texture",
    "semi-realistic":
      "semi-realistic digital painting, soft realistic style, detailed illustration, beautiful rendering",
    anime:
      "anime art style, detailed anime illustration, cel shading, vibrant colors, studio quality",
    "3d render":
      "3D render, octane render, unreal engine, soft lighting, subsurface scattering, detailed textures",
    cartoon:
      "cartoon illustration, stylized character design, clean lines, vibrant colors, expressive features",
    fantasy:
      "fantasy art, ethereal glow, magical atmosphere, intricate details, painterly, enchanted setting",
  };

  prompt += `, ${styleMods[style] ?? `${style} style, high quality artwork`}`;
  // Portraits go to a public gallery, so keep every one clothed and safe for work.
  prompt += ", fully clothed, tasteful, safe for work, perfect composition, beautiful lighting, high detail, masterpiece";

  const negative =
    "ugly, deformed, blurry, low quality, pixelated, distorted, bad anatomy, extra limbs, missing features, watermark, text";

  return { positive: prompt, negative };
}
