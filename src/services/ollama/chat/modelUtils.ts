
/**
 * Checks if the model should use the generate API instead of the chat API
 */
export function isGenerateAPIModel(modelName: string): boolean {
  const lowerModelName = modelName.toLowerCase();
  return lowerModelName.includes('qwen');
}

/**
 * Creates an appropriate system message based on language preferences
 */
export function createSystemMessage(prompt: string): string {
  let systemMessage = 'Vous êtes un assistant intelligent et serviable. Répondez de façon claire, concise et utile.';
  
  // If prompt contains language instructions, use them for system message too
  if (prompt.includes('réponse doit être en français')) {
    systemMessage = 'Réponds uniquement en français, quelle que soit la langue de la question. Sois clair, précis et utile.';
  } else if (prompt.includes('response must be in English')) {
    systemMessage = 'Always respond in English, regardless of the question language. Be clear, concise and helpful.';
  } else if (prompt.includes('باللغة العربية')) {
    systemMessage = 'أجب دائمًا باللغة العربية بغض النظر عن لغة السؤال. كن واضحًا، موجزًا ومفيدًا.';
  }
  
  return systemMessage;
}
