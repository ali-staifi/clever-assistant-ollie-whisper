
import { ChatOllamaResponse } from './types';

/**
 * Parses the streaming response from Ollama API
 */
export function parseStreamedResponse(line: string, isQwenModel: boolean): string {
  try {
    // Log for debugging
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
      
      // Case 1: Standard message object format
      if (parsedLine.message && typeof parsedLine.message === 'object') {
        const responseText = parsedLine.message?.content || '';
        if (responseText) console.log('Standard response token:', responseText);
        return responseText;
      } 
      // Case 2: Direct content field
      else if (parsedLine.content !== undefined && typeof parsedLine.content === 'string') {
        const responseText = parsedLine.content || '';
        if (responseText) console.log('Content-based token:', responseText);
        return responseText;
      } 
      // Case 3: Direct response field
      else if (parsedLine.response) {
        const responseText = parsedLine.response || '';
        if (responseText) console.log('Alternative response token:', responseText);
        return responseText;
      }
    }
    
    // If none of the expected formats matched, try to find any text in the response
    const possibleTextFields = ['response', 'content', 'text', 'output'];
    for (const field of possibleTextFields) {
      if (parsedLine[field as keyof ChatOllamaResponse] && 
          typeof parsedLine[field as keyof ChatOllamaResponse] === 'string') {
        const responseText = parsedLine[field as keyof ChatOllamaResponse] as string;
        console.log(`Found text in field '${field}':`, responseText);
        return responseText;
      }
    }
    
    // If we get here, we couldn't extract any text
    console.warn('No text found in response:', parsedLine);
    return '';
  } catch (e) {
    console.error('Failed to parse Ollama response line:', e);
    console.log('Raw line that failed to parse:', line);
    
    // Try to extract text if JSON is malformed but contains text
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
