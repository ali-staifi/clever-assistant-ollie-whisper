import { Message, ChatOllamaResponse } from './types';
import { formatMessages } from './formatUtils';
import { parseResponse } from './responseParser';
import { testConnection } from './connectionUtils';

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
    return testConnection(this.baseUrl);
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
      const formattedMessages = formatMessages(messages);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
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

        partialResponse += decoder.decode(value);
        const chunk = parseResponse(partialResponse);

        if (chunk) {
          onProgress(chunk);
        }
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }
}
