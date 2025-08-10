
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private controller: AbortController | null = null;

  constructor(apiKey: string, model: string = 'microsoft/phi-3-mini-4k-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setModel(model: string) {
    this.model = model;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Jarvis Assistant'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur de connexion' };
    }
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Jarvis Assistant'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Filtrer pour ne montrer que les modèles gratuits
      const freeModels = data.data
        .filter((model: any) => model.pricing?.prompt === '0' || model.id.includes(':free'))
        .map((model: any) => model.id);

      return freeModels;
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  async generateResponse(
    prompt: string, 
    messages: OpenRouterMessage[] = [],
    onProgress?: (text: string) => void,
    options: OpenRouterOptions = {}
  ): Promise<string> {
    try {
      this.abortRequest();
      this.controller = new AbortController();

      console.log(`Generating response using model ${this.model}`);

      const systemMessage: OpenRouterMessage = {
        role: 'system',
        content: 'Tu es un assistant IA utile qui répond toujours en français. Sois précis et informatif.'
      };

      const requestPayload = {
        model: this.model,
        messages: [systemMessage, ...messages, { role: 'user', content: prompt }],
        stream: !!onProgress,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Jarvis Assistant'
        },
        body: JSON.stringify(requestPayload),
        signal: this.controller.signal
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenRouter: ${response.status} ${response.statusText}`);
      }

      if (onProgress && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  onProgress(fullResponse);
                }
              } catch (e) {
                console.error('Failed to parse streaming response:', e);
              }
            }
          }
        }

        return fullResponse;
      } else {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Pas de réponse reçue';
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return '[Requête annulée]';
      }
      
      console.error('Error calling OpenRouter:', error);
      throw error;
    } finally {
      this.controller = null;
    }
  }

  abortRequest() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}
