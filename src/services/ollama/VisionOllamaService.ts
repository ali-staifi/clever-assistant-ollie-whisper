
import { ChatOllamaService } from './chat/ChatOllamaService';

export class VisionOllamaService {
  private chatService: ChatOllamaService;
  
  constructor(baseUrl: string, model: string = 'llava-llama3') {
    this.chatService = new ChatOllamaService(baseUrl, model);
  }
  
  async generateVisionResponse(
    model: string,
    prompt: string,
    imageBase64: string,
    onProgress?: (token: string) => void
  ): Promise<string> {
    try {
      // Déterminer si l'image est déjà encodée en base64
      const base64String = imageBase64.startsWith('data:image') 
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      
      // Formatage de la requête pour les modèles de vision
      // Format compatible avec Llava via Ollama
      const body = {
        model: model,
        prompt: prompt,
        stream: true,
        images: [base64String]
      };
      
      console.log(`Envoi de requête vision à Ollama avec le modèle ${model}`);
      
      const endpoint = '/api/generate';
      let result = '';
      
      const onToken = (token: string) => {
        result = token;
        if (onProgress) onProgress(token);
      };
      
      // Convertir en JSON puis envoyer
      const requestBody = JSON.stringify(body);
      
      // Utiliser une requête directe plutôt que la méthode chat
      const controller = new AbortController();
      const response = await fetch(`${this.chatService.getBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is empty');
      }
      
      const decoder = new TextDecoder();
      let completeResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsedData = JSON.parse(line);
              if (parsedData && parsedData.response) {
                completeResponse += parsedData.response;
                if (onProgress) onProgress(completeResponse);
              }
            } catch (e) {
              console.error('Error parsing response line:', e);
            }
          }
        }
      }
      
      return completeResponse;
    } catch (error) {
      console.error('Erreur lors de la génération de réponse vision:', error);
      throw error;
    }
  }
  
  setModel(model: string) {
    this.chatService.setModel(model);
  }
  
  getBaseUrl(): string {
    return this.chatService.getBaseUrl();
  }
}
