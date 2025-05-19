
import { OllamaService } from '../ollama';

interface LLaVAResponse {
  description: string;
  entities: string[];
  confidence: number;
}

export class LLaVAService {
  private ollamaService: OllamaService;
  private modelName: string;
  
  constructor(ollamaService: OllamaService, modelName: string = 'llava-llama3') {
    this.ollamaService = ollamaService;
    this.modelName = modelName;
  }

  public setModel(modelName: string): void {
    this.modelName = modelName;
  }

  public async analyzeImage(imageBase64: string, prompt?: string): Promise<string> {
    try {
      const defaultPrompt = "Décris ce que tu vois dans cette image en détail.";
      const userPrompt = prompt || defaultPrompt;
      
      console.log("Analyse d'image avec LLaVA en cours...");
      
      // Format spécifique pour LLaVA avec Ollama
      const response = await this.ollamaService.generateVisionResponse(
        this.modelName,
        userPrompt,
        imageBase64
      );
      
      return response;
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'image:", error);
      throw new Error(`Erreur lors de l'analyse de l'image: ${error}`);
    }
  }
  
  public async analyzeVideo(videoFramesBase64: string[], prompt?: string): Promise<string[]> {
    try {
      const defaultPrompt = "Décris ce qui se passe dans cette séquence vidéo.";
      const userPrompt = prompt || defaultPrompt;
      const results: string[] = [];
      
      console.log(`Analyse de ${videoFramesBase64.length} images de la vidéo avec LLaVA...`);
      
      // Traiter chaque image séparément
      for (const frameBase64 of videoFramesBase64) {
        const frameDescription = await this.analyzeImage(frameBase64, userPrompt);
        results.push(frameDescription);
      }
      
      return results;
    } catch (error) {
      console.error("Erreur lors de l'analyse de la vidéo:", error);
      throw new Error(`Erreur lors de l'analyse de la vidéo: ${error}`);
    }
  }
}
