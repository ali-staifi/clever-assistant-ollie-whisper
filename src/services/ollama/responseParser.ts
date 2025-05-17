
import { ChatOllamaResponse } from './types';

/**
 * Parses the streaming response from Ollama API
 */
export function parseStreamedResponse(line: string, isQwenModel: boolean): string {
  try {
    const parsedLine = JSON.parse(line) as ChatOllamaResponse;
    
    // Handle response based on API endpoint
    if (isQwenModel) {
      // For generate API
      const responseText = parsedLine.response || '';
      if (responseText.trim()) {
        console.log('Qwen response token:', responseText);
      }
      return responseText;
    } else {
      // For chat API
      const responseText = parsedLine.message?.content || parsedLine.response || '';
      if (responseText.trim()) {
        console.log('Standard response token:', responseText);
      }
      return responseText;
    }
  } catch (e) {
    console.error('Failed to parse Ollama response line:', line, e);
    return '';
  }
}
