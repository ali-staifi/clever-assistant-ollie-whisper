
import { ChatOllamaResponse } from './types';

/**
 * Parses the streaming response from Ollama API
 */
export function parseStreamedResponse(line: string, isQwenModel: boolean): string {
  try {
    // Log pour le debug
    console.log('Raw response line:', line);
    
    if (!line || line.trim() === '') {
      return '';
    }
    
    const parsedLine = JSON.parse(line) as ChatOllamaResponse;
    
    // Log the entire parsed response for debugging
    console.log('Parsed response:', parsedLine);
    
    // Handle response based on API endpoint
    if (isQwenModel) {
      // For generate API (used by Qwen models)
      const responseText = parsedLine.response || '';
      if (responseText.trim()) {
        console.log('Qwen response token:', responseText);
      }
      return responseText;
    } else {
      // For chat API (used by other models like Llama, Gemma, etc.)
      // Handle both formats that might be returned from different Ollama versions
      if (parsedLine.message && typeof parsedLine.message === 'object') {
        const responseText = parsedLine.message?.content || '';
        if (responseText) console.log('Standard response token:', responseText);
        return responseText;
      } else if (parsedLine.content && typeof parsedLine.content === 'string') {
        // Format pour certaines versions d'Ollama
        const responseText = parsedLine.content || '';
        if (responseText) console.log('Content-based token:', responseText);
        return responseText;
      } else if (parsedLine.response) {
        // Format standard de réponse
        const responseText = parsedLine.response || '';
        if (responseText) console.log('Alternative response token:', responseText);
        return responseText;
      }
    }
    
    // Si rien n'a correspondu, essayer de trouver n'importe quel texte dans la réponse
    const possibleTextFields = ['response', 'content', 'text', 'output'];
    for (const field of possibleTextFields) {
      if (parsedLine[field] && typeof parsedLine[field] === 'string') {
        const responseText = parsedLine[field];
        console.log(`Found text in field '${field}':`, responseText);
        return responseText;
      }
    }
    
    return '';
  } catch (e) {
    console.error('Failed to parse Ollama response line:', e);
    console.log('Raw line that failed to parse:', line);
    
    // Essayer de récupérer du texte si le JSON est malformé mais contient du texte
    if (typeof line === 'string' && line.includes('"response":')) {
      try {
        const responseMatch = line.match(/"response"\s*:\s*"([^"]*)"/);
        if (responseMatch && responseMatch[1]) {
          console.log('Extracted response from malformed JSON:', responseMatch[1]);
          return responseMatch[1];
        }
      } catch (extractError) {
        console.error('Failed to extract response from malformed JSON:', extractError);
      }
    }
    
    return '';
  }
}
