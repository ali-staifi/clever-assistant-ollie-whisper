
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
      } else if (parsedLine.response) {
        const responseText = parsedLine.response || '';
        if (responseText) console.log('Alternative response token:', responseText);
        return responseText;
      }
    }
    
    return '';
  } catch (e) {
    console.error('Failed to parse Ollama response line:', e);
    return '';
  }
}
