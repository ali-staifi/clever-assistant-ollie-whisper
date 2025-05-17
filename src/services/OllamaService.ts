
interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class OllamaService {
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
      
      // Check for specific error types
      const errorMsg = error instanceof Error ? error.message : String(error);
      let errorDetails = errorMsg;
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        errorDetails = `Possible CORS issue. Make sure Ollama is running with: OLLAMA_ORIGINS="*" ollama serve
        
Note: If you get "Only one usage of each socket address" error, Ollama is already running. 
Try these steps:
1. Check if Ollama is running with: Get-Process -Name ollama
2. Stop the existing process: Stop-Process -Name ollama
3. Then start again with CORS: $env:OLLAMA_ORIGINS="*"; ollama serve`;
      }
      
      return { 
        success: false, 
        error: errorDetails
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

  async generateResponse(
    prompt: string, 
    messages: Message[] = [],
    onProgress?: (text: string) => void
  ): Promise<string> {
    try {
      // Cancel any ongoing request
      this.abortRequest();
      this.controller = new AbortController();

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [...messages, { role: 'user', content: prompt }],
          stream: true,
        }),
        signal: this.controller.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
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
            const parsedLine = JSON.parse(line) as OllamaResponse;
            const responseText = parsedLine.response;
            fullResponse += responseText;
            onProgress?.(fullResponse);
          } catch (e) {
            console.error('Failed to parse Ollama response line:', e);
          }
        }
      }

      this.controller = null;
      return fullResponse;
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
3. Then start again with CORS: $env:OLLAMA_ORIGINS="*"; ollama serve`;
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
}
