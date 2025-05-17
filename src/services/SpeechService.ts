
import { RecognitionService } from './speech/RecognitionService';
import { SynthesisService } from './speech/SynthesisService';

export class SpeechService {
  private recognitionService: RecognitionService;
  private synthesisService: SynthesisService;
  
  constructor() {
    this.recognitionService = new RecognitionService();
    this.synthesisService = new SynthesisService();
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    return this.recognitionService.startListening(onInterimResult, onResult, onError);
  }

  stopListening() {
    this.recognitionService.stopListening();
  }

  async speak(text: string, onEnd?: () => void): Promise<boolean> {
    return await this.synthesisService.speak(text, onEnd);
  }

  isRecognitionSupported(): boolean {
    return this.recognitionService.isRecognitionSupported();
  }

  isSynthesisSupported(): boolean {
    return this.synthesisService.isSynthesisSupported();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesisService.getAvailableVoices();
  }

  setLanguage(lang: string) {
    this.recognitionService.setLanguage(lang);
    this.synthesisService.setLanguage(lang);
  }
  
  // Add sensitivity method
  setSensitivity(value: number) {
    if (typeof this.recognitionService.setSensitivity === 'function') {
      this.recognitionService.setSensitivity(value);
    }
  }
  
  // Add method to enable no-microphone mode
  enableNoMicrophoneMode(enable: boolean = true) {
    if (typeof this.recognitionService.enableNoMicrophoneMode === 'function') {
      this.recognitionService.enableNoMicrophoneMode(enable);
    }
  }
  
  // Configuration MaryTTS avec plus d'options
  configureMaryTTS(useIt: boolean, serverUrl?: string, voice?: string, locale?: string) {
    if (typeof this.synthesisService.configureMaryTTS === 'function') {
      this.synthesisService.configureMaryTTS(useIt, serverUrl, voice);
      
      // Si une locale est fournie, configurer également la langue
      if (locale) {
        this.synthesisService.setLanguage(locale);
      }
      
      console.log(`MaryTTS configuré : utilisation=${useIt}, serveur=${serverUrl}, voix=${voice}, locale=${locale}`);
    }
  }
  
  // Tester une connexion MaryTTS
  async testMaryTTSConnection(serverUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/version`);
      return response.ok;
    } catch (error) {
      console.error('Erreur de connexion à MaryTTS:', error);
      return false;
    }
  }
}
