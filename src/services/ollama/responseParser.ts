
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
      console.log('Qwen response text:', responseText.substring(0, 50) + (responseText.length > 50 ? '...' : ''));
      return responseText;
    } else {
      // For chat API
      const responseText = parsedLine.message?.content || parsedLine.response || '';
      console.log('Standard response text:', responseText.substring(0, 50) + (responseText.length > 50 ? '...' : ''));
      return responseText;
    }
  } catch (e) {
    console.error('Failed to parse Ollama response line:', line, e);
    return '';
  }
}
