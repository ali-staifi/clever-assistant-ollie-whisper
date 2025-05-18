
import { Message } from './types';
import { formatMessagesToPrompt } from './formatUtils';
import { parseStreamedResponse } from './responseParser';
import { testOllamaConnection, getAvailableModels } from './connectionUtils';

export class OllamaService {
  private baseUrl: string;
  private model: string;
  private controller: AbortController | null = null;
  private language: string = 'french'; // Définir le français comme langue par défaut

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'gemma:7b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return testOllamaConnection(this.baseUrl);
  }

  async listAvailableModels(): Promise<string[]> {
    return getAvailableModels(this.baseUrl);
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
          prompt: formatMessagesToPrompt(messages, enhancedPrompt, true, this.language),
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
            throw new Error(`Le modèle "${this.model}" n'est pas installé sur votre serveur Ollama. Veuillez l'installer avec: ollama pull ${this.model}`);
          }
        }
        
        throw new Error(`Erreur API Ollama: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Le corps de la réponse est vide");
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
      
      // Check for empty response and provide fallback
      if (!fullResponse.trim()) {
        const fallbackMsg = "Je suis désolé, je n'ai pas pu générer de réponse. Veuillez vérifier si le modèle Gemma est correctement installé avec 'ollama pull gemma:7b'";
        if (onProgress) {
          onProgress(fallbackMsg);
        }
        return fallbackMsg;
      }
      
      // Final sanitization to ensure no "undefined" text
      return fullResponse.replace(/undefined/g, '').trim();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return '[Requête annulée]';
      }
      
      console.error('Error calling Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Enhanced error messaging
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        return `Erreur de connexion à Ollama: Problème CORS possible. Assurez-vous qu'Ollama est exécuté avec CORS activé: OLLAMA_ORIGINS="*" ollama serve
        
Si vous obtenez l'erreur "Only one usage of each socket address", cela signifie qu'Ollama est déjà en cours d'exécution. Dans PowerShell:
1. Vérifiez si Ollama est en cours d'exécution: Get-Process -Name ollama
2. Arrêtez le processus existant: Stop-Process -Name ollama
3. Puis redémarrez avec CORS: $env:OLLAMA_ORIGINS="*"; ollama serve
4. Pour Mac/Linux: OLLAMA_ORIGINS="*" ollama serve`;
      }
      
      if (errorMsg.includes("not installed") || errorMsg.includes("not found, try pulling it first")) {
        return `Erreur de modèle: Le modèle "${this.model}" n'est pas installé sur votre serveur Ollama. Veuillez l'installer d'abord avec cette commande:
        
ollama pull ${this.model}`;
      }
      
      return `Erreur de connexion à Ollama: ${errorMsg}`;
    }
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
  
  // Méthode pour définir la langue
  setLanguage(language: string) {
    this.language = language;
  }
}
