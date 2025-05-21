
import { VisionOllamaService } from '../ollama/VisionOllamaService';

interface LLaVAResponse {
  description: string;
  entities: string[];
  confidence: number;
}

export class LLaVAService {
  private ollamaService: VisionOllamaService;
  private modelName: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1500;
  
  constructor(ollamaService: VisionOllamaService, modelName: string = 'llava:34b') {
    this.ollamaService = ollamaService;
    this.modelName = modelName;
  }

  public setModel(modelName: string): void {
    this.modelName = modelName;
    console.log(`LLaVA model set to: ${this.modelName}`);
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries: number = this.maxRetries): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts left...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  public async analyzeImage(imageBase64: string, prompt?: string): Promise<string> {
    try {
      const defaultPrompt = "Décris ce que tu vois dans cette image en détail.";
      const userPrompt = prompt || defaultPrompt;
      
      console.log(`Analyse d'image avec LLaVA en cours... (modèle: ${this.modelName})`);
      
      // Format spécifique pour LLaVA avec Ollama avec mécanisme de retry
      const response = await this.retryOperation(async () => {
        return await this.ollamaService.generateVisionResponse(
          this.modelName,
          userPrompt,
          imageBase64
        );
      });
      
      console.log("Analyse d'image terminée avec succès");
      return response;
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'image:", error);
      throw new Error(`Erreur lors de l'analyse de l'image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  public async analyzeVideo(videoFramesBase64: string[], prompt?: string): Promise<string[]> {
    try {
      const defaultPrompt = "Décris ce qui se passe dans cette séquence vidéo.";
      const userPrompt = prompt || defaultPrompt;
      const results: string[] = [];
      
      console.log(`Analyse de ${videoFramesBase64.length} images de la vidéo avec LLaVA (modèle: ${this.modelName})...`);
      
      // Traiter chaque image séparément avec mécanisme de retry
      for (let i = 0; i < videoFramesBase64.length; i++) {
        console.log(`Traitement de l'image ${i+1}/${videoFramesBase64.length}`);
        const frameBase64 = videoFramesBase64[i];
        const frameDescription = await this.analyzeImage(frameBase64, userPrompt);
        results.push(frameDescription);
      }
      
      return results;
    } catch (error) {
      console.error("Erreur lors de l'analyse de la vidéo:", error);
      throw new Error(`Erreur lors de l'analyse de la vidéo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Méthode pour vérifier la disponibilité du modèle
  public async checkModelAvailability(): Promise<boolean> {
    try {
      const models = await this.ollamaService.getAvailableModels();
      const isAvailable = models.includes(this.modelName);
      
      if (!isAvailable) {
        console.log(`Le modèle ${this.modelName} n'est pas disponible. Modèles disponibles: ${models.join(', ')}`);
      } else {
        console.log(`Le modèle ${this.modelName} est disponible.`);
      }
      
      return isAvailable;
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité du modèle:", error);
      return false;
    }
  }
  
  // Méthode pour essayer des modèles alternatifs en cas d'échec
  public async tryAlternativeModels(): Promise<string | null> {
    const alternativeModels = ['llava-llama3', 'llava', 'llava:13b', 'llava:7b', 'bakllava', 'llava-llama2'];
    
    for (const model of alternativeModels) {
      if (model === this.modelName) continue;
      
      try {
        const models = await this.ollamaService.getAvailableModels();
        if (models.includes(model)) {
          console.log(`Modèle alternatif trouvé: ${model}`);
          return model;
        }
      } catch (error) {
        console.error(`Erreur lors de la recherche du modèle alternatif ${model}:`, error);
      }
    }
    
    return null;
  }
}
