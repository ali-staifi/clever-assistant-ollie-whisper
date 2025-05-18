
import { Message } from '../types';
import { ChatOllamaCore } from './ChatOllamaCore';
import { isGenerateAPIModel } from './modelUtils';
import { buildRequestBody } from './requestBuilder';
import { handleStreamedResponse, handleErrorResponse } from './responseHandler';
import { testOllamaConnection, getAvailableModels } from '../connectionUtils';

export class ChatOllamaService extends ChatOllamaCore {
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

  async generateChatResponse(
    prompt: string,
    messages: Message[],
    onProgress: (token: string) => void
  ): Promise<void> {
    try {
      this.abortRequest();
      this.controller = new AbortController();
      
      const isQwenModel = isGenerateAPIModel(this.model);
      const { body: requestBody, endpoint } = buildRequestBody(
        this.model, 
        prompt, 
        messages, 
        this.options
      );

      console.log(`Using ${endpoint} endpoint for model ${this.model}`);
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
        const errorMsg = await handleErrorResponse(response);
        throw new Error(errorMsg);
      }

      await handleStreamedResponse(
        response, 
        onProgress, 
        isQwenModel, 
        this.controller
      );
      
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
  
  // For backward compatibility with OllamaService
  async generateResponse(
    prompt: string,
    messages: Message[],
    onProgress: (token: string) => void
  ): Promise<void> {
    return this.generateChatResponse(prompt, messages, onProgress);
  }
}
