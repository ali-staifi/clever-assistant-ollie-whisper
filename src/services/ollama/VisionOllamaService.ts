
import { ChatOllamaService } from './chat/ChatOllamaService';

interface VisionResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class VisionOllamaService {
  private baseUrl: string;
  private model: string;
  private chatService: ChatOllamaService;
  
  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llava-llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
    this.chatService = new ChatOllamaService(baseUrl, model);
  }
  
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.chatService.setBaseUrl(url);
  }
  
  public setModel(model: string): void {
    this.model = model;
  }
  
  public async generateVisionResponse(
    model: string, 
    prompt: string, 
    imageBase64: string,
    stream: boolean = false,
  ): Promise<string> {
    try {
      // Formater la requête pour l'API Ollama Vision
      const body = {
        model: model || this.model,
        prompt: prompt,
        images: [imageBase64],
        stream: stream,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40
        }
      };
      
      // Envoyer la requête à l'API Ollama
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: VisionResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating vision response:', error);
      throw error;
    }
  }
  
  // Fonction pour récupérer tous les modèles disponibles
  public async getAvailableModels(): Promise<string[]> {
    try {
      // Récupérer la liste des modèles depuis l'API
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filtrer les modèles qui supportent la vision
      const allModels = data.models.map((model: any) => model.name);
      // Pour l'instant, retournez tous les modèles car nous ne pouvons pas facilement
      // déterminer lesquels supportent la vision sans information supplémentaire
      return allModels;
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  }
}
