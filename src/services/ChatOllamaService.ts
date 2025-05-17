
import { Message } from '@/services/OllamaService';
import { formatMessagesToPrompt } from './ollama/formatUtils';
import { parseStreamedResponse } from './ollama/responseParser';
import { testOllamaConnection, getAvailableModels } from './ollama/connectionUtils';

export class ChatOllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;
  private language: string = 'french'; // Définir le français comme langue par défaut

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return testOllamaConnection(this.baseUrl);
  }

  async listAvailableModels(): Promise<string[]> {
    return getAvailableModels(this.baseUrl);
  }

  async generateChatResponse(
    prompt: string, 
    messages: Message[] = [],
    onProgress?: (text: string) => void
  ): Promise<string> {
    try {
      // Cancel any ongoing request
      this.abortRequest();
      this.controller = new AbortController();

      console.log(`Sending chat request to: ${this.baseUrl} with model ${this.model}`);
      
      // Determine if we need to use the chat or generate endpoint based on model
      const isQwenModel = this.model.toLowerCase().includes('qwen');
      const endpoint = isQwenModel ? '/api/generate' : '/api/chat';
      
      console.log(`Using ${endpoint} API for ${isQwenModel ? 'Qwen' : 'standard'} model`);
      
      // Prepare request payload based on model type
      let requestPayload;
      
      // Ajouter l'instruction de langue dans le prompt
      const languageInstruction = "Réponds uniquement en français, quelle que soit la langue de la question.";
      const enhancedPrompt = isQwenModel ? `${languageInstruction}\n\n${prompt}` : prompt;
      
      if (isQwenModel) {
        // Format for Qwen models with the generate API
        requestPayload = {
          model: this.model,
          prompt: formatMessagesToPrompt(messages, enhancedPrompt, true, this.language),
          stream: true,
        };
      } else {
        // Add system message for language instruction in chat API
        const systemMessages: Message[] = [
          { role: 'system', content: languageInstruction }
        ];
        
        // Standard format for chat API with system message
        requestPayload = {
          model: this.model,
          messages: [...systemMessages, ...messages, { role: 'user', content: prompt }],
          stream: true,
        };
      }
      
      const requestBody = JSON.stringify(requestPayload);
      console.log('Request payload:', requestBody.substring(0, 200) + (requestBody.length > 200 ? '...' : ''));

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: this.controller.signal
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes("not found, try pulling it first")) {
            throw new Error(`Model "${this.model}" is not installed on your Ollama server. Please install it using: ollama pull ${this.model}`);
          }
        }
        
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      console.log('Starting to process streamed response');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
        
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          const responseText = parseStreamedResponse(line, isQwenModel);
          
          // Make sure we have valid text before adding it
          if (responseText && typeof responseText === 'string') {
            fullResponse += responseText;
            // Only call onProgress if fullResponse is valid
            if (onProgress && fullResponse.trim() !== '') {
              onProgress(fullResponse);
            }
          }
        }
      }

      this.controller = null;
      console.log('Final response length:', fullResponse.length);
      return fullResponse.trim();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return '[Request cancelled]';
      }
      
      console.error('Error calling Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        return `Error connecting to Ollama: Possible CORS issue. Make sure Ollama is running with CORS enabled`;
      }
      
      if (errorMsg.includes("not installed") || errorMsg.includes("not found, try pulling it first")) {
        return `Model Error: The model "${this.model}" is not installed. Please install it first with: ollama pull ${this.model}`;
      }
      
      return `Error connecting to Ollama: ${errorMsg}`;
    }
  }
  
  abortRequest() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  setModel(model: string) {
    this.model = model;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
  
  // Méthode pour définir la langue
  setLanguage(language: string) {
    this.language = language;
  }
}
