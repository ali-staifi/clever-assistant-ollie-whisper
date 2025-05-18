
import { Message, ChatOllamaResponse } from './types';
import { formatMessagesToPrompt } from './formatUtils';
import { parseStreamedResponse } from './responseParser';
import { testOllamaConnection } from './connectionUtils';

export class ChatOllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;
  // Ajout des paramètres de configuration avancés
  private options: {
    temperature?: number;
    numPredict?: number;
    topK?: number;
    topP?: number;
  };

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.options = {
      temperature: 0.7,
      numPredict: 256,
      topK: 40,
      topP: 0.9
    };
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setModel(model: string) {
    this.model = model;
  }

  // Méthode pour configurer les options avancées
  setOptions(options: {
    temperature?: number;
    numPredict?: number;
    topK?: number;
    topP?: number;
  }) {
    this.options = { ...this.options, ...options };
  }

  abortRequest() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
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
        console.error("No models found in response:", data);
        return [];
      }
    } catch (error: any) {
      console.error("Error listing available models:", error);
      return [];
    }
  }

  // Determine if we're using a Qwen model or similar that requires the generate API
  private isGenerateAPIModel(modelName: string): boolean {
    const lowerModelName = modelName.toLowerCase();
    // Detect models that need the generate API instead of chat API
    return lowerModelName.includes('qwen');
  }

  // Generate a chat response from the Ollama API with streaming
  async generateChatResponse(
    prompt: string,
    messages: Message[],
    onProgress: (token: string) => void
  ): Promise<void> {
    try {
      // Cancel any previous requests
      this.abortRequest();
      this.controller = new AbortController();
      
      // Format messages to the format expected by the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Determine if we should use the generate API or chat API based on the model
      const isQwenModel = this.isGenerateAPIModel(this.model);
      const endpoint = isQwenModel ? '/api/generate' : '/api/chat';
      
      console.log(`Using ${endpoint} endpoint for model ${this.model}`);
      
      // Prepare request body based on the API endpoint type
      let requestBody;
      
      if (isQwenModel) {
        // For generate API (Qwen models)
        const formattedPrompt = formatMessagesToPrompt(messages, prompt, true, 'french');
        console.log("Formatted Qwen prompt:", formattedPrompt.substring(0, 100) + "...");
        
        requestBody = JSON.stringify({
          model: this.model,
          prompt: formattedPrompt,
          stream: true,
          options: this.options
        });
      } else {
        // For chat API (standard models like Llama, Gemma, etc.)
        requestBody = JSON.stringify({
          model: this.model,
          messages: [
            // Add a system message to ensure response in French
            { role: 'system', content: 'Réponds uniquement en français, quelle que soit la langue de la question.' },
            ...formattedMessages
          ],
          stream: true,
          options: this.options
        });
      }

      // Make the API request
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: this.controller.signal
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        
        // Try to extract more detailed error information
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = `Erreur Ollama: ${errorData.error}`;
            
            // Add specific guidance for common errors
            if (errorData.error.includes('not found') || errorData.error.includes('no model loaded')) {
              errorMsg += `\nVeuillez installer le modèle "${this.model}" avec la commande: ollama pull ${this.model}`;
            }
          }
        } catch (e) {
          // If we can't parse the error, just use the HTTP status
        }
        
        throw new Error(errorMsg);
      }

      // Read the streaming response
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
      
      // If we got no content after all processing, provide a fallback message
      if (!partialResponse.trim()) {
        const fallbackMsg = "Je suis désolé, je n'ai pas pu générer de réponse. Veuillez vérifier si le modèle est correctement installé.";
        onProgress(fallbackMsg);
      }
      
      this.controller = null;
      
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      // Provide an error message to display to the user
      const errorMsg = error instanceof Error ? error.message : "Une erreur s'est produite lors de la communication avec Ollama";
      onProgress(`Erreur: ${errorMsg}`);
      
      throw error;
    }
  }
}
