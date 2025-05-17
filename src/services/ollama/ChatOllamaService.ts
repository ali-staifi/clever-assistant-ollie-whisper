
import { Message, ChatOllamaResponse } from './types';
import { formatMessagesToPrompt } from './formatUtils';
import { parseStreamedResponse } from './responseParser';
import { testOllamaConnection } from './connectionUtils';

export class ChatOllamaService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setModel(model: string) {
    this.model = model;
  }

  // Test the connection to the Ollama server
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return testOllamaConnection(this.baseUrl);
  }

  // List available models on the Ollama server
  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.models) {
        return data.models.map((model: any) => model.name);
      } else {
        return [];
      }
    } catch (error: any) {
      console.error("Error listing available models:", error);
      return [];
    }
  }

  // Generate a chat response from the Ollama API with streaming
  async generateChatResponse(
    prompt: string,
    messages: Message[],
    onProgress: (token: string) => void
  ): Promise<void> {
    try {
      // Format messages to the format expected by the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Détermine si on doit utiliser l'API chat ou generate basé sur le modèle
      const isQwenModel = this.model.toLowerCase().includes('qwen');
      const endpoint = isQwenModel ? '/api/generate' : '/api/chat';
      
      // Préparer la charge utile de la requête en fonction du type de modèle
      let requestBody;
      
      if (isQwenModel) {
        // Pour les modèles Qwen avec l'API generate
        const formattedPrompt = formatMessagesToPrompt(messages, prompt, true, 'french');
        console.log("Formatted Qwen prompt:", formattedPrompt.substring(0, 100) + "...");
        
        requestBody = JSON.stringify({
          model: this.model,
          prompt: formattedPrompt,
          stream: true,
        });
      } else {
        // Pour les autres modèles avec l'API chat
        requestBody = JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          stream: true,
        });
      }
      
      console.log(`Using ${endpoint} endpoint for model ${this.model}`);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (!response.ok) {
        // Gestion des erreurs spécifiques
        if (response.status === 404 || response.status === 400) {
          let errorText;
          try {
            const errorData = await response.json();
            errorText = errorData.error || `Erreur HTTP ${response.status}`;
          } catch (e) {
            errorText = `Erreur HTTP ${response.status}`;
          }
          
          throw new Error(`Erreur API Ollama: ${errorText}. Assurez-vous que le modèle "${this.model}" est installé.`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is empty');
      }

      let partialResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsedToken = parseStreamedResponse(line, isQwenModel);
              if (parsedToken) {
                partialResponse += parsedToken;
                onProgress(partialResponse);
              }
            } catch (e) {
              console.error('Error parsing response line:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }
}
