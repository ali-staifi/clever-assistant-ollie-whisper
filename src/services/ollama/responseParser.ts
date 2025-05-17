
import { ChatOllamaResponse } from './types';

/**
 * Parses the streaming response from Ollama API
 */
export function parseStreamedResponse(line: string, isQwenModel: boolean): string {
  try {
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
