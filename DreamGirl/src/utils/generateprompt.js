/**
 * Generates a prompt string based on the provided answers.
 * This prompt is used for AI image generation.
 *
 * @param {Object} answers - Object containing user answers.
 * @returns {string} - The final generated prompt.
 */
export function generatePrompt(answers) {
  if (!answers || Object.keys(answers).length === 0) {
    return null;
  }

  // Fallback values for missing answers
  const aura = answers.aura || "confident";
  const race = answers.race || "mixed";
  const bodyType = answers.bodyType || "athletic";
  const skinTone = answers.skinTone || "medium";
  const facialStructure = answers.facialStructure || "oval";
  const outfit = answers.outfit || "casual";
  const hairstyle = answers.hairstyle || "long";
  const facialExpression = answers.facialExpression || "smiling";
  const accessories = answers.accessories || "none";
  const style = answers.imageGenerationStyle || "realistic";

  // Build the prompt
  let prompt = `A beautiful woman with ${aura.toLowerCase()} aura, ${race.toLowerCase()} ethnicity, ${bodyType.toLowerCase()} body type, ${skinTone.toLowerCase()} skin tone, ${facialStructure.toLowerCase()} face shape, wearing ${outfit.toLowerCase()} outfit, ${hairstyle.toLowerCase()} hairstyle, ${facialExpression.toLowerCase()} expression`;

  // Add accessories if not "none"
  if (accessories.toLowerCase() !== "none") {
    prompt += `, with ${accessories.toLowerCase()}`;
  }

  // Add style specification
  prompt += `, ${style.toLowerCase()} style, high quality, detailed, professional photography`;

  // Add additional quality modifiers based on style
  switch (style.toLowerCase()) {
    case "anime":
      prompt += ", anime art style, cel shading, vibrant colors";
      break;
    case "3d render":
      prompt += ", 3D rendered, digital art, smooth lighting";
      break;
    case "cartoon":
      prompt += ", cartoon style, stylized, colorful";
      break;
    case "realistic":
      prompt += ", photorealistic, natural lighting, sharp focus";
      break;
    case "semi-realistic":
      prompt += ", semi-realistic, artistic, soft rendering";
      break;
    default:
      prompt += ", artistic, high quality";
  }

  return prompt.trim();
}