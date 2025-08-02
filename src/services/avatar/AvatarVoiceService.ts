import { SynthesisService } from '../speech/SynthesisService';

export interface FastSpeech2Params {
  speed: number;
  pitch: number;
  energy: number;
  emotionStrength: number;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
}

export interface AvatarPersonality {
  name: string;
  emotionalRange: {
    enthusiasm: number;
    empathy: number;
    confidence: number;
    warmth: number;
  };
  speechPattern: {
    pauseDuration: number;
    emphasis: number;
    rhythm: 'steady' | 'dynamic' | 'calm';
  };
}

export interface AvatarVoiceConfig {
  personality: AvatarPersonality;
  voiceParams: FastSpeech2Params;
  typicalPhrases: string[];
}

export class AvatarVoiceService extends SynthesisService {
  private currentPersonality: AvatarPersonality;
  private emotionalState: 'neutral' | 'encouraging' | 'supportive' | 'energetic' = 'neutral';

  constructor(personality: AvatarPersonality) {
    super();
    this.currentPersonality = personality;
  }

  async speakAsAvatar(text: string, emotion: 'encouraging' | 'supportive' | 'energetic' | 'neutral' = 'neutral', onEnd?: () => void): Promise<boolean> {
    this.emotionalState = emotion;
    
    // Ajuster les paramètres vocaux selon l'émotion
    const voiceParams = this.getVoiceParamsForEmotion(emotion);
    
    // Ajouter des pauses naturelles et des inflexions
    const processedText = this.processTextForPersonality(text);
    
    return await this.speak(processedText, onEnd);
  }

  private getVoiceParamsForEmotion(emotion: string): FastSpeech2Params {
    const base = {
      speed: 1.0,
      pitch: 1.0,
      energy: 0.7,
      emotionStrength: 0.6,
      emotion: emotion as FastSpeech2Params['emotion']
    };

    switch (emotion) {
      case 'encouraging':
        return { ...base, speed: 1.1, pitch: 1.1, energy: 0.8, emotionStrength: 0.7 };
      case 'supportive':
        return { ...base, speed: 0.9, pitch: 0.95, energy: 0.6, emotionStrength: 0.5 };
      case 'energetic':
        return { ...base, speed: 1.2, pitch: 1.2, energy: 0.9, emotionStrength: 0.8 };
      default:
        return base;
    }
  }

  private processTextForPersonality(text: string): string {
    // Ajouter des pauses naturelles pour Alex
    let processed = text;
    
    // Ajouter des pauses après les points
    processed = processed.replace(/\./g, '... ');
    
    // Ajouter une inflexion chaleureuse
    if (this.currentPersonality.emotionalRange.warmth > 0.7) {
      processed = processed.replace(/^/, 'Alors, ');
    }
    
    return processed;
  }

  setEmotionalState(emotion: typeof this.emotionalState) {
    this.emotionalState = emotion;
  }

  getEmotionalState() {
    return this.emotionalState;
  }

  getPersonality() {
    return this.currentPersonality;
  }
}

// Configuration par défaut pour Alex
export const AlexPersonality: AvatarPersonality = {
  name: "Alex",
  emotionalRange: {
    enthusiasm: 0.8,
    empathy: 0.9,
    confidence: 0.8,
    warmth: 0.9
  },
  speechPattern: {
    pauseDuration: 0.5,
    emphasis: 0.7,
    rhythm: 'dynamic'
  }
};

export const AlexVoiceConfig: AvatarVoiceConfig = {
  personality: AlexPersonality,
  voiceParams: {
    speed: 1.0,
    pitch: 1.0,
    energy: 0.7,
    emotionStrength: 0.6,
    emotion: 'neutral'
  },
  typicalPhrases: [
    "Parfait ! Continuons ensemble.",
    "Je suis là pour t'accompagner.",
    "C'est exactement ça ! Tu progresses bien.",
    "Prends ton temps, on y va étape par étape.",
    "Je suis fier de toi, tu fais du super travail !",
    "Comment te sens-tu maintenant ?",
    "Respirons ensemble un instant."
  ]
};