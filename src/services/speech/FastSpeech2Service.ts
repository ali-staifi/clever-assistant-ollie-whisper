
// Cette classe est une implémentation simulée de FastSpeech2
// Dans une implémentation réelle, elle devrait se connecter à un service externe
// qui exécute le modèle FastSpeech2

import { MaryTTSService } from './MaryTTSService';

export class FastSpeech2Service {
  private maryTTS: MaryTTSService;
  private serverUrl: string;
  private modelName: string;
  private defaultParams: FastSpeech2Params;
  
  constructor(
    maryTTSService: MaryTTSService,
    serverUrl: string = 'http://localhost:5000',
    modelName: string = 'fastspeech2'
  ) {
    this.maryTTS = maryTTSService;
    this.serverUrl = serverUrl;
    this.modelName = modelName;
    
    this.defaultParams = {
      speed: 1.0,
      pitch: 1.0,
      energy: 1.0,
      emotionStrength: 0.5,
      emotion: 'neutral'
    };
  }
  
  public async speak(
    text: string,
    params?: Partial<FastSpeech2Params>,
    onEnd?: () => void
  ): Promise<boolean> {
    try {
      console.log("Simulation de synthèse vocale FastSpeech2");
      console.log("Texte:", text);
      console.log("Paramètres:", { ...this.defaultParams, ...params });
      
      // En l'absence d'un vrai service FastSpeech2, nous utilisons MaryTTS
      // Dans une implémentation réelle, nous enverrions les paramètres à un service FastSpeech2
      return await this.maryTTS.speak(text, onEnd);
    } catch (error) {
      console.error("Erreur FastSpeech2:", error);
      return false;
    }
  }
  
  public setServer(url: string): void {
    this.serverUrl = url;
  }
  
  public setModel(name: string): void {
    this.modelName = name;
  }
  
  public setDefaultParams(params: Partial<FastSpeech2Params>): void {
    this.defaultParams = { ...this.defaultParams, ...params };
  }
  
  public async checkConnection(): Promise<boolean> {
    try {
      // Dans une implémentation réelle, vérifiez la connexion au service FastSpeech2
      return true;
    } catch (error) {
      console.error("Erreur de connexion FastSpeech2:", error);
      return false;
    }
  }
}

export interface FastSpeech2Params {
  speed: number;       // Vitesse de parole (0.5 à 2.0)
  pitch: number;       // Hauteur de la voix (0.5 à 2.0)
  energy: number;      // Énergie/volume (0.5 à 2.0)
  emotionStrength: number; // Intensité de l'émotion (0 à 1)
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised'; // Type d'émotion
}
