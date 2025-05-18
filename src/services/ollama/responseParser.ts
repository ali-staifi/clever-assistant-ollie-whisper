
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
    
    // Try to parse JSON response
    let parsedLine: ChatOllamaResponse;
    try {
      parsedLine = JSON.parse(line) as ChatOllamaResponse;
      console.log('Parsed response:', parsedLine);
    } catch (e) {
      console.error('JSON parse error:', e);
      
      // Try to salvage content if possible from malformed JSON
      if (line.includes('"response":"')) {
        const match = line.match(/"response"\s*:\s*"([^"]*)"/);
        if (match && match[1]) {
          console.log('Extracted response from malformed JSON:', match[1]);
          return match[1];
        }
      }
      
      return '';
    }
    
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
      if (parsedLine.message && typeof parsedLine.message === 'object' && parsedLine.message.content) {
        const responseText = parsedLine.message.content || '';
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
      // Case 4: Try to find content in the response even if it doesn't match expected structure
      else {
        const stringifiedResponse = JSON.stringify(parsedLine);
        console.log('Searching for content in:', stringifiedResponse);
        
        // Look for any string field that might contain content
        for (const key in parsedLine) {
          if (typeof parsedLine[key as keyof ChatOllamaResponse] === 'string') {
            const value = parsedLine[key as keyof ChatOllamaResponse] as string;
            if (value && value.length > 2) {
              console.log(`Found potential content in field ${key}:`, value);
              return value;
            }
          }
        }
      }
    }
    
    // If none of the expected formats matched, try to find any text in the response
    const possibleTextFields = ['response', 'content', 'text', 'output', 'message'];
    for (const field of possibleTextFields) {
      if (parsedLine[field as keyof ChatOllamaResponse] && 
          typeof parsedLine[field as keyof ChatOllamaResponse] === 'string') {
        const responseText = parsedLine[field as keyof ChatOllamaResponse] as string;
        console.log(`Found text in field '${field}':`, responseText);
        return responseText;
      }
      
      // Check nested message.content
      if (field === 'message' && 
          parsedLine[field as keyof ChatOllamaResponse] && 
          typeof parsedLine[field as keyof ChatOllamaResponse] === 'object') {
        const message = parsedLine[field as keyof ChatOllamaResponse] as any;
        if (message.content && typeof message.content === 'string') {
          console.log('Found text in nested message.content:', message.content);
          return message.content;
        }
      }
    }
    
    // If we get here, we couldn't extract any text
    console.warn('No text found in response:', parsedLine);
    return '';
  } catch (e) {
    console.error('Failed to parse Ollama response line:', e);
    console.log('Raw line that failed to parse:', line);
    
    // Try to extract text if JSON is malformed but contains text
    if (typeof line === 'string') {
      // Try multiple patterns
      const patterns = [
        /"response"\s*:\s*"([^"]*)"/,
        /"content"\s*:\s*"([^"]*)"/,
        /"message"\s*:\s*\{\s*"content"\s*:\s*"([^"]*)"/
      ];
      
      for (const pattern of patterns) {
        try {
          const match = line.match(pattern);
          if (match && match[1]) {
            console.log(`Extracted text using pattern ${pattern}:`, match[1]);
            return match[1];
          }
        } catch (extractError) {
          console.error('Pattern extraction failed:', extractError);
        }
      }
      
      // Last resort: try to find any quoted text that might be the response
      try {
        const quotedTextMatch = line.match(/"([^"]{5,})"/);
        if (quotedTextMatch && quotedTextMatch[1]) {
          console.log('Found potential quoted response text:', quotedTextMatch[1]);
          return quotedTextMatch[1];
        }
      } catch (quoteError) {
        console.error('Quoted text extraction failed:', quoteError);
      }
    }
    
    return '';
  }
}
