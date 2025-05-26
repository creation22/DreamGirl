// utils/promptGenerator.js

/**
 * Generates a prompt string based on the provided answers.
 * This prompt is not shown to the user but can be used for image generation or AI purposes.
 *
 * @param {Object} answers - Object containing user answers keyed by question IDs.
 * @returns {string} - The final generated prompt.
 */
export function generatePrompt(answers) {
  return `
A ${answers.skinTone || "[skin tone]"} woman of ${answers.race || "[race]"} origin with a ${answers.bodyType || "[body type]"} figure and a ${answers.facialStructure || "[facial structure]"} face. 
She has ${answers.hairstyle || "[hairstyle]"} hair and is wearing a ${answers.outfit || "[outfit]"} outfit. 
Her aura is ${answers.aura || "[aura]"} and she has a ${answers.facialExpression || "[facial expression]"} expression. 
Accessories include ${answers.accessories || "[accessories]"}. 
The image should be in ${answers.imageGenerationStyle || "[image generation style]"} style.
  `.trim();
}
