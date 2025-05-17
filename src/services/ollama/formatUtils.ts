
import { Message } from '@/services/OllamaService';

/**
 * Formats chat messages into a prompt string for models that need it
 */
export function formatMessagesToPrompt(
  messages: Message[], 
  currentPrompt: string, 
  includeLanguageInstruction: boolean = false,
  language: string = 'french'
): string {
  let formattedPrompt = '';
  
  // Add language instruction at the beginning if requested
  if (includeLanguageInstruction) {
    formattedPrompt += `System: Réponds uniquement en ${language}, quelle que soit la langue de la question.\n\n`;
  }
  
  // Add previous messages
  for (const msg of messages) {
    if (msg.role === 'user') {
      formattedPrompt += `Human: ${msg.content}\n\n`;
    } else {
      formattedPrompt += `Assistant: ${msg.content}\n\n`;
    }
  }
  
  // Add current prompt
  formattedPrompt += `Human: ${currentPrompt}\n\nAssistant:`;
  
  return formattedPrompt;
}
