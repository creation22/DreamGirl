/**
 * Generates a high-quality prompt string based on the provided answers.
 * This prompt is optimized for AI image generation with detailed descriptors.
 *
 * @param {Object} answers - Object containing user answers.
 * @returns {string} - The final generated prompt.
 */
export function generatePrompt(answers) {
  if (!answers || Object.keys(answers).length === 0) {
    return null;
  }

  // Enhanced mappings for better prompt quality
  const auraMap = {
    "confident & classy": "confident, elegant, sophisticated, poised, graceful",
    "sporty & rational": "athletic, determined, focused, strong, energetic",
    "mysterious & magnetic": "enigmatic, alluring, captivating, intriguing, mesmerizing",
    "sexy & alluring": "sensual, attractive, charming, seductive, gorgeous"
  };

  const raceMap = {
    "indian": "South Asian, Indian features, beautiful brown skin",
    "white/caucasian": "Caucasian, European features, fair complexion",
    "black/african": "African, beautiful dark skin, strong features",
    "asian": "East Asian features, smooth skin, elegant bone structure"
  };

  const bodyTypeMap = {
    "slim": "slender, lean, graceful figure, elegant proportions",
    "athletic": "fit, toned, muscular definition, healthy athletic build",
    "curvy": "curvaceous, hourglass figure, feminine curves, well-proportioned",
    "thick": "voluptuous, full figure, beautiful curves, confident posture",
    "plus size": "full-figured, beautiful curves, confident, radiant"
  };

  const skinToneMap = {
    "fair/light": "fair skin, porcelain complexion, smooth texture",
    "medium/olive": "olive skin tone, warm undertones, healthy glow",
    "brown": "beautiful brown skin, rich complexion, natural radiance",
    "dark": "gorgeous dark skin, deep rich tone, luminous complexion",
    "tan": "sun-kissed skin, golden tan, warm glow"
  };

  const facialStructureMap = {
    "oval": "oval face shape, balanced proportions, classic beauty",
    "round": "round face, soft features, youthful appearance",
    "square": "strong jawline, defined features, striking bone structure",
    "diamond": "diamond face shape, high cheekbones, elegant angles",
    "heart shaped": "heart-shaped face, delicate chin, prominent cheekbones"
  };

  const outfitMap = {
    "elegant": "elegant dress, sophisticated attire, refined fashion, luxurious fabric",
    "casual": "stylish casual wear, comfortable yet fashionable, modern outfit",
    "trendy": "trendy fashion, contemporary style, fashionable clothing, modern design",
    "traditional": "traditional attire, cultural dress, authentic style, heritage fashion"
  };

  const hairstyleMap = {
    "long & straight": "long straight hair, silky smooth texture, flowing locks",
    "curly": "beautiful curly hair, natural curls, voluminous texture, bouncy waves",
    "short bob": "stylish bob cut, modern short hairstyle, sleek and chic",
    "braided": "intricate braids, detailed hair work, artistic braiding, textured style"
  };

  const expressionMap = {
    "smiling": "warm genuine smile, bright eyes, joyful expression, radiant happiness",
    "serious": "serious expression, focused gaze, determined look, intense eyes",
    "shy": "shy smile, gentle expression, soft eyes, modest demeanor",
    "playful": "playful expression, mischievous smile, lively eyes, fun personality"
  };

  const accessoryMap = {
    "glasses": "stylish eyewear, fashionable glasses, intellectual charm",
    "jewelry": "elegant jewelry, beautiful accessories, sparkling details",
    "piercing/tattoos": "artistic tattoos, stylish piercings, body art, unique style",
    "none": ""
  };

  // Get enhanced descriptions
  const aura = auraMap[answers.aura?.toLowerCase()] || answers.aura || "confident, beautiful";
  const race = raceMap[answers.race?.toLowerCase()] || answers.race || "mixed heritage, beautiful features";
  const bodyType = bodyTypeMap[answers.bodyType?.toLowerCase()] || answers.bodyType || "athletic build";
  const skinTone = skinToneMap[answers.skinTone?.toLowerCase()] || answers.skinTone || "healthy skin tone";
  const facialStructure = facialStructureMap[answers.facialStructure?.toLowerCase()] || answers.facialStructure || "beautiful face shape";
  const outfit = outfitMap[answers.outfit?.toLowerCase()] || answers.outfit || "stylish clothing";
  const hairstyle = hairstyleMap[answers.hairstyle?.toLowerCase()] || answers.hairstyle || "beautiful hairstyle";
  const facialExpression = expressionMap[answers.facialExpression?.toLowerCase()] || answers.facialExpression || "pleasant expression";
  const accessories = accessoryMap[answers.accessories?.toLowerCase()] || answers.accessories || "";
  const style = answers.imageGenerationStyle || "realistic";

  // Build the enhanced prompt
  let prompt = `A stunning beautiful woman, ${aura}, ${race}, ${bodyType}, ${skinTone}, ${facialStructure}, wearing ${outfit}, ${hairstyle}, ${facialExpression}`;

  // Add accessories if present
  if (accessories && accessories.trim() !== "") {
    prompt += `, ${accessories}`;
  }

  // Add style-specific quality modifiers
  switch (style.toLowerCase()) {
    case "anime":
      prompt += `, anime art style, detailed anime illustration, cel shading, vibrant colors, studio quality, masterpiece, highly detailed, beautiful anime girl, perfect anatomy, flawless skin`;
      break;
    case "3d render":
      prompt += `, 3D rendered, high-quality digital art, octane render, unreal engine, smooth lighting, perfect subsurface scattering, detailed textures, photorealistic 3D model`;
      break;
    case "cartoon":
      prompt += `, cartoon style illustration, stylized art, vibrant colors, clean lines, professional cartoon art, detailed character design, expressive features`;
      break;
    case "realistic":
      prompt += `, photorealistic, ultra-realistic, professional photography, studio lighting, sharp focus, high resolution, DSLR quality, perfect skin texture, natural lighting, masterpiece quality`;
      break;
    case "semi-realistic":
      prompt += `, semi-realistic art, digital painting, artistic rendering, soft realistic style, detailed illustration, professional digital art, beautiful rendering`;
      break;
    default:
      prompt += `, high quality artwork, detailed, professional, masterpiece`;
  }

  // Add universal quality enhancers
  prompt += `, perfect composition, beautiful lighting, high detail, 8K resolution, trending on artstation, award-winning, flawless, stunning, gorgeous, breathtaking beauty`;

  // Add negative prompt elements to avoid
  const negativeElements = "ugly, deformed, blurry, low quality, pixelated, distorted, amateur, bad anatomy, weird proportions, extra limbs, missing features";

  return {
    positive: prompt.trim(),
    negative: negativeElements
  };
}