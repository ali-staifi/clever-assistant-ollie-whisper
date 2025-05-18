
import { Message, ChatOllamaResponse } from './types';
import { formatMessagesToPrompt } from './formatUtils';
import { parseStreamedResponse } from './responseParser';
import { testOllamaConnection, getAvailableModels } from './connectionUtils';

export class ChatOllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;
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

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return testOllamaConnection(this.baseUrl);
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      return await getAvailableModels(this.baseUrl);
    } catch (error) {
      console.error("Error listing available models:", error);
      return [];
    }
  }

  private isGenerateAPIModel(modelName: string): boolean {
    const lowerModelName = modelName.toLowerCase();
    return lowerModelName.includes('qwen');
  }

  async generateChatResponse(
    prompt: string,
    messages: Message[],
    onProgress: (token: string) => void
  ): Promise<void> {
    try {
      this.abortRequest();
      this.controller = new AbortController();
      
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const isQwenModel = this.isGenerateAPIModel(this.model);
      const endpoint = isQwenModel ? '/api/generate' : '/api/chat';
      
      console.log(`Using ${endpoint} endpoint for model ${this.model}`);
      
      let requestBody;
      
      if (isQwenModel) {
        const formattedPrompt = formatMessagesToPrompt(messages, prompt, true, 'french');
        console.log("Formatted Qwen prompt:", formattedPrompt.substring(0, 100) + "...");
        
        requestBody = JSON.stringify({
          model: this.model,
          prompt: formattedPrompt,
          stream: true,
          options: this.options
        });
      } else {
        let systemMessage = 'Vous êtes un assistant intelligent et serviable. Répondez de façon claire, concise et utile.';
        
        // If prompt contains language instructions, use them for system message too
        if (prompt.includes('réponse doit être en français')) {
          systemMessage = 'Réponds uniquement en français, quelle que soit la langue de la question. Sois clair, précis et utile.';
        } else if (prompt.includes('response must be in English')) {
          systemMessage = 'Always respond in English, regardless of the question language. Be clear, concise and helpful.';
        } else if (prompt.includes('باللغة العربية')) {
          systemMessage = 'أجب دائمًا باللغة العربية بغض النظر عن لغة السؤال. كن واضحًا، موجزًا ومفيدًا.';
        }
        
        requestBody = JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemMessage },
            ...formattedMessages,
            { role: 'user', content: prompt }
          ],
          stream: true,
          options: this.options
        });
      }

      console.log("Sending request to Ollama:", this.baseUrl + endpoint);
      console.log("Request body:", requestBody);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: this.controller.signal
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = `Ollama error: ${errorData.error}`;
            
            if (errorData.error.includes('not found') || errorData.error.includes('no model loaded')) {
              errorMsg += `\nPlease install model "${this.model}" with command: ollama pull ${this.model}`;
            }
          }
        } catch (e) {
          // If we can't parse the error, just use the HTTP status
        }
        
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is empty');
      }

      let partialResponse = '';
      const decoder = new TextDecoder();
      let responseText = '';

      // Add a watchdog timer to ensure we don't get stuck
      const watchdogTimer = setTimeout(() => {
        console.warn('Response watchdog timer triggered after 60 seconds');
        if (this.controller) this.controller.abort();
      }, 60000);

      try {
        while (true) {
          const { done, value } = await reader.read();
  
          if (done) {
            break;
          }
  
          const chunk = decoder.decode(value);
          console.log("Received chunk:", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
          
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedToken = parseStreamedResponse(line, isQwenModel);
                if (parsedToken) {
                  responseText += parsedToken;
                  partialResponse += parsedToken;
                  onProgress(partialResponse);
                }
              } catch (e) {
                console.error('Error parsing response line:', e);
                console.error('Line content:', line);
              }
            }
          }
        }
      } finally {
        clearTimeout(watchdogTimer);
      }
      
      if (!partialResponse.trim()) {
        console.warn('Empty response received from model');
        const fallbackMsg = "Je suis désolé, je n'ai pas pu générer de réponse. Veuillez vérifier si le modèle est correctement installé.";
        onProgress(fallbackMsg);
      }
      
      this.controller = null;
      
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        onProgress("Je suis désolé, la requête a été interrompue. Veuillez réessayer.");
        return;
      }
      
      const errorMsg = error instanceof Error ? error.message : "Une erreur s'est produite lors de la communication avec Ollama";
      onProgress(`Erreur: ${errorMsg}`);
      
      throw error;
    }
  }
}
