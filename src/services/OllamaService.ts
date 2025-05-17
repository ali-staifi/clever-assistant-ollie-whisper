interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';  // Ajout de 'system' comme type possible
  content: string;
}

export class OllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;
  private language: string = 'french'; // Définir le français comme langue par défaut

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Testing connection to Ollama at ${this.baseUrl}`);
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        console.error(`Ollama connection failed with status: ${response.status}`);
        return { 
          success: false, 
          error: `Status: ${response.status} ${response.statusText}` 
        };
      }
      
      console.log("Ollama connection successful");
      return { success: true };
    } catch (error) {
      console.error('Error testing Ollama connection:', error);
      
      // Check for specific error types
      const errorMsg = error instanceof Error ? error.message : String(error);
      let errorDetails = errorMsg;
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        errorDetails = `Possible CORS issue. Make sure Ollama is running with: OLLAMA_ORIGINS="*" ollama serve
        
Note: If you get "Only one usage of each socket address" error, Ollama is already running. 
Try these steps:
1. Check if Ollama is running with: Get-Process -Name ollama
2. Stop the existing process: Stop-Process -Name ollama
3. Then start again with CORS: $env:OLLAMA_ORIGINS="*"; ollama serve
4. Or for Mac/Linux: OLLAMA_ORIGINS="*" ollama serve`;
      }
      
      return { 
        success: false, 
        error: errorDetails
      };
    }
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      console.log(`Fetching available models from Ollama at ${this.baseUrl}`);
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
        console.log(`Found ${data.models.length} models`);
        return data.models.map((model: any) => model.name);
      }
      return [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  async generateResponse(
    prompt: string, 
    messages: Message[] = [],
    onProgress?: (text: string) => void
  ): Promise<string> {
    try {
      // Cancel any ongoing request
      this.abortRequest();
      this.controller = new AbortController();
      
      console.log(`Generating response using model ${this.model} at ${this.baseUrl}`);
      console.log(`Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);

      // Determine if we need to use the chat or generate endpoint based on model
      const isQwenModel = this.model.toLowerCase().includes('qwen');
      const endpoint = isQwenModel ? '/api/generate' : '/api/chat';
      
      // Ajouter l'instruction de langue
      const languageInstruction = "Réponds uniquement en français, quelle que soit la langue de la question.";
      const enhancedPrompt = isQwenModel ? `${languageInstruction}\n\n${prompt}` : prompt;
      
      // Prepare request payload based on model type
      let requestPayload;
      
      if (isQwenModel) {
        // Format for Qwen models with the generate API
        requestPayload = {
          model: this.model,
          prompt: this.formatMessagesToPrompt(messages, enhancedPrompt, true),
          stream: true,
        };
      } else {
        // Add system message for language instruction
        const systemMessages: Message[] = [
          { role: 'system', content: languageInstruction }
        ];
        
        // Standard format for chat API
        requestPayload = {
          model: this.model,
          messages: [...systemMessages, ...messages, { role: 'user', content: prompt }],
          stream: true,
        };
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsedLine = JSON.parse(line);
            // Handle both generate and chat API response formats
            const responseText = isQwenModel ? parsedLine.response : parsedLine.message?.content || parsedLine.response;
            
            // Make sure we have valid text before adding it
            if (responseText && typeof responseText === 'string') {
              fullResponse += responseText;
              // Only call onProgress if fullResponse is valid
              if (onProgress && fullResponse.trim() !== '') {
                onProgress(fullResponse);
              }
            }
          } catch (e) {
            console.error('Failed to parse Ollama response line:', e);
          }
        }
      }

      this.controller = null;
      console.log("Response generation complete");
      // Final sanitization to ensure no "undefined" text
      return fullResponse.replace(/undefined/g, '').trim();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return '[Request cancelled]';
      }
      
      console.error('Error calling Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Enhanced error messaging
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        return `Error connecting to Ollama: Possible CORS issue. Make sure Ollama is running with CORS enabled: OLLAMA_ORIGINS="*" ollama serve
        
If you get "Only one usage of each socket address" error, this means Ollama is already running. In PowerShell:
1. Check if Ollama is running: Get-Process -Name ollama
2. Stop the existing process: Stop-Process -Name ollama
3. Then start again with CORS: $env:OLLAMA_ORIGINS="*"; ollama serve
4. For Mac/Linux: OLLAMA_ORIGINS="*" ollama serve`;
      }
      
      if (errorMsg.includes("not installed") || errorMsg.includes("not found, try pulling it first")) {
        return `Model Error: The model "${this.model}" is not installed on your Ollama server. Please install it first with this command:
        
ollama pull ${this.model}`;
      }
      
      return `Error connecting to Ollama: ${errorMsg}`;
    }
  }
  
  // Helper method to format chat messages into a prompt string for models that need it
  private formatMessagesToPrompt(
    messages: Message[], 
    currentPrompt: string,
    includeLanguageInstruction: boolean = false
  ): string {
    let formattedPrompt = '';
    
    // Add language instruction at the beginning if requested
    if (includeLanguageInstruction) {
      formattedPrompt += `System: Réponds uniquement en français, quelle que soit la langue de la question.\n\n`;
    }
    
    // Add previous messages
    for (const msg of messages) {
      if (msg.role === 'user') {
        formattedPrompt += `Human: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        formattedPrompt += `Assistant: ${msg.content}\n\n`;
      }
      // Ignorer les messages système car ils sont déjà ajoutés au début
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
    console.log(`Setting Ollama model to: ${model}`);
    this.model = model;
  }

  setBaseUrl(url: string) {
    console.log(`Setting Ollama base URL to: ${url}`);
    this.baseUrl = url;
  }
  
  // Nouvelle méthode pour définir la langue
  setLanguage(language: string) {
    this.language = language;
  }
}
