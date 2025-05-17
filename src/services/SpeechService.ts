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
    return this.recognitionService.startListening(
      onInterimResult, 
      onResult, 
      (errorMsg) => {
        console.warn("Speech recognition error:", errorMsg);
        if (onError) onError(errorMsg);
      }
    );
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
  
  // Add method to check microphone access
  async checkMicrophoneAccess(): Promise<boolean> {
    if (typeof this.recognitionService.checkMicrophoneAccess === 'function') {
      return await this.recognitionService.checkMicrophoneAccess();
    }
    return false;
  }
  
  // Add method to enable no-microphone mode
  enableNoMicrophoneMode(enable: boolean = true) {
    if (typeof this.recognitionService.enableNoMicrophoneMode === 'function') {
      this.recognitionService.enableNoMicrophoneMode(enable);
    }
  }
  
  // Configuration MaryTTS with corrected parameter handling
  configureMaryTTS(useIt: boolean, serverUrl?: string, voice?: string, locale?: string) {
    if (typeof this.synthesisService.configureMaryTTS === 'function') {
      // Fix: Pass only the supported parameters (up to 3 arguments instead of 4)
      this.synthesisService.configureMaryTTS(useIt, serverUrl, voice);
      
      // Handle locale separately if provided
      if (locale) {
        this.synthesisService.setLanguage(locale);
        // Synchronize recognition language with synthesis language
        if (locale.length >= 5) {
          this.recognitionService.setLanguage(locale.substring(0, 2) + '-' + locale.substring(3, 5));
        }
      }
      
      console.log(`MaryTTS configuré : utilisation=${useIt}, serveur=${serverUrl}, voix=${voice}, locale=${locale}`);
    }
  }
  
  // Tester une connexion MaryTTS
  async testMaryTTSConnection(serverUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/version`, {
        mode: 'cors',
        headers: {
          'Accept': 'text/plain'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur de connexion à MaryTTS:', error);
      return false;
    }
  }
  
  // Obtenir les voix disponibles de MaryTTS
  async getMaryTTSVoices(serverUrl: string): Promise<string[]> {
    try {
      // Implement direct fetch to get MaryTTS voices since the method doesn't exist in SynthesisService
      const response = await fetch(`${serverUrl}/voices`, {
        mode: 'cors', 
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`MaryTTS server error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching MaryTTS voices:', error);
      return [];
    }
  }
}
