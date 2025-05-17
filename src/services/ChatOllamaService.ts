
import { Message } from '@/services/OllamaService';

interface ChatOllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  message?: {
    role: string;
    content: string;
  };
}

export class ChatOllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `Status: ${response.status} ${response.statusText}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error testing Ollama connection:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Extract model names from the response
      if (data && data.models) {
        return data.models.map((model: any) => model.name);
      }
      return [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
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
      
      if (isQwenModel) {
        // Format for Qwen models with the generate API
        requestPayload = {
          model: this.model,
          prompt: this.formatMessagesToPrompt(messages, prompt),
          stream: true,
        };
      } else {
        // Standard format for chat API
        requestPayload = {
          model: this.model,
          messages: [...messages, { role: 'user', content: prompt }],
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
          try {
            const parsedLine = JSON.parse(line);
            
            // Handle response based on API endpoint
            let responseText;
            if (isQwenModel) {
              // For generate API
              responseText = parsedLine.response || '';
              console.log('Qwen response text:', responseText.substring(0, 50) + (responseText.length > 50 ? '...' : ''));
            } else {
              // For chat API
              responseText = parsedLine.message?.content || parsedLine.response || '';
              console.log('Standard response text:', responseText.substring(0, 50) + (responseText.length > 50 ? '...' : ''));
            }
            
            // Make sure we have valid text before adding it
            if (responseText && typeof responseText === 'string') {
              fullResponse += responseText;
              // Only call onProgress if fullResponse is valid
              if (onProgress && fullResponse.trim() !== '') {
                onProgress(fullResponse);
              }
            }
          } catch (e) {
            console.error('Failed to parse Ollama response line:', line, e);
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
  
  // Helper method to format chat messages into a prompt string for models that need it
  private formatMessagesToPrompt(messages: Message[], currentPrompt: string): string {
    let formattedPrompt = '';
    
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
}
