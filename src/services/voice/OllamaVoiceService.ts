import { FastSpeech2Params } from '../speech/FastSpeech2Service';

export interface OllamaVoiceRequest {
  prompt: string;
  voiceParams: FastSpeech2Params;
  context?: string;
}

export interface OllamaVoiceResponse {
  text: string;
  adjustedParams?: Partial<FastSpeech2Params>;
  emotionalContext?: string;
}

export class OllamaVoiceService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setModel(model: string) {
    this.model = model;
  }

  // Générer une réponse adaptée aux paramètres vocaux
  async generateVoiceResponse(request: OllamaVoiceRequest): Promise<OllamaVoiceResponse> {
    try {
      // Créer un prompt enrichi avec les paramètres vocaux
      const enrichedPrompt = this.createEmotionalPrompt(request.prompt, request.voiceParams, request.context);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: enrichedPrompt,
          stream: false,
          options: {
            temperature: this.getTemperatureFromEmotion(request.voiceParams.emotion),
            top_p: 0.9,
            top_k: 40,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama: ${response.status}`);
      }

      const data = await response.json();
      
      // Analyser la réponse et ajuster les paramètres si nécessaire
      const adjustedParams = this.analyzeResponseForVoiceAdjustments(data.response, request.voiceParams);

      return {
        text: data.response,
        adjustedParams,
        emotionalContext: this.getEmotionalContext(request.voiceParams.emotion)
      };
    } catch (error) {
      console.error('Erreur lors de la génération avec Ollama:', error);
      throw error;
    }
  }

  // Créer un prompt enrichi avec le contexte émotionnel
  private createEmotionalPrompt(userPrompt: string, voiceParams: FastSpeech2Params, context?: string): string {
    const emotionInstructions = this.getEmotionInstructions(voiceParams.emotion, voiceParams.emotionStrength);
    const speedInstructions = this.getSpeedInstructions(voiceParams.speed);
    const energyInstructions = this.getEnergyInstructions(voiceParams.energy);

    return `Tu es un assistant vocal intelligent nommé Jarvis. Réponds à la demande suivante en adaptant ton style de réponse selon ces paramètres:

PARAMÈTRES VOCAUX:
- Émotion: ${voiceParams.emotion} (intensité: ${Math.round(voiceParams.emotionStrength * 100)}%)
- Vitesse: ${voiceParams.speed} (${speedInstructions})
- Énergie: ${voiceParams.energy} (${energyInstructions})
- Hauteur: ${voiceParams.pitch}

INSTRUCTIONS ÉMOTIONNELLES:
${emotionInstructions}

${context ? `CONTEXTE ADDITIONNEL: ${context}` : ''}

DEMANDE DE L'UTILISATEUR: ${userPrompt}

Réponds de manière naturelle en français, en adaptant ton ton, ta formulation et ton style selon l'émotion et les paramètres spécifiés. Sois expressif et authentique.`;
  }

  // Instructions spécifiques pour chaque émotion
  private getEmotionInstructions(emotion: FastSpeech2Params['emotion'], strength: number): string {
    const intensityText = strength > 0.7 ? 'très' : strength > 0.4 ? 'modérément' : 'légèrement';

    switch (emotion) {
      case 'happy':
        return `Sois ${intensityText} joyeux et enthousiaste. Utilise un langage positif, des exclamations appropriées, et montre de l'optimisme.`;
      case 'sad':
        return `Adopte un ton ${intensityText} mélancolique et compatissant. Utilise un langage plus doux et empathique.`;
      case 'angry':
        return `Exprime une ${intensityText === 'très' ? 'forte' : intensityText} frustration ou fermeté. Sois direct mais professionnel.`;
      case 'surprised':
        return `Montre de la ${intensityText === 'très' ? 'grande' : intensityText} surprise et curiosité. Utilise des expressions d'étonnement.`;
      case 'neutral':
      default:
        return `Maintiens un ton professionnel et équilibré. Sois informatif et serviable.`;
    }
  }

  // Instructions pour la vitesse
  private getSpeedInstructions(speed: number): string {
    if (speed > 1.5) return 'réponse concise et dynamique';
    if (speed < 0.8) return 'réponse détaillée et posée';
    return 'rythme normal';
  }

  // Instructions pour l'énergie
  private getEnergyInstructions(energy: number): string {
    if (energy > 1.5) return 'haute énergie, expressif';
    if (energy < 0.8) return 'calme et mesuré';
    return 'énergie équilibrée';
  }

  // Obtenir la température basée sur l'émotion
  private getTemperatureFromEmotion(emotion: FastSpeech2Params['emotion']): number {
    switch (emotion) {
      case 'happy': return 0.9;
      case 'surprised': return 0.95;
      case 'angry': return 0.7;
      case 'sad': return 0.6;
      case 'neutral': return 0.7;
      default: return 0.7;
    }
  }

  // Analyser la réponse pour ajuster les paramètres vocaux
  private analyzeResponseForVoiceAdjustments(response: string, currentParams: FastSpeech2Params): Partial<FastSpeech2Params> {
    const adjustments: Partial<FastSpeech2Params> = {};

    // Analyser le contenu pour des ajustements automatiques
    if (response.includes('!') && response.split('!').length > 3) {
      adjustments.energy = Math.min(currentParams.energy + 0.2, 2.0);
    }

    if (response.includes('...') || response.includes('hmmm')) {
      adjustments.speed = Math.max(currentParams.speed - 0.1, 0.5);
    }

    return adjustments;
  }

  // Obtenir le contexte émotionnel
  private getEmotionalContext(emotion: FastSpeech2Params['emotion']): string {
    switch (emotion) {
      case 'happy': return 'Réponse générée avec un ton joyeux et optimiste';
      case 'sad': return 'Réponse générée avec un ton compatissant et doux';
      case 'angry': return 'Réponse générée avec un ton ferme et direct';
      case 'surprised': return 'Réponse générée avec un ton curieux et étonné';
      case 'neutral': return 'Réponse générée avec un ton professionnel et équilibré';
      default: return 'Réponse générée avec les paramètres standards';
    }
  }

  // Tester la connexion Ollama
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Obtenir les modèles disponibles
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      return [];
    }
  }
}
