
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
    console.log(`Définition de la langue système: ${lang}`);
    this.recognitionService.setLanguage(lang);
    this.synthesisService.setLanguage(lang);
  }
  
  // Méthode pour définir la voix
  setVoice(voiceName: string) {
    // Définir d'abord la voix
    this.synthesisService.setVoice(voiceName);
    
    // Obtenir les voix disponibles
    const voices = this.getAvailableVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    
    // Si une voix correspondante est trouvée, synchroniser la langue
    if (selectedVoice) {
      console.log(`Synchronisation de la langue avec la voix sélectionnée: ${selectedVoice.lang}`);
      
      // Mettre à jour la langue de synthèse
      this.synthesisService.setLanguage(selectedVoice.lang);
      
      // Adapter la langue de reconnaissance si possible
      // Note: la reconnaissance a généralement besoin d'un format 'fr-FR', 'en-US', etc.
      const langParts = selectedVoice.lang.split('-');
      if (langParts.length >= 2) {
        const recognitionLang = `${langParts[0]}-${langParts[1].toUpperCase()}`;
        this.recognitionService.setLanguage(recognitionLang);
        console.log(`Langue de reconnaissance définie sur: ${recognitionLang}`);
      }
    }
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
    // Fix: Pass only the supported parameters
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
  
  // Tester une connexion MaryTTS
  async testMaryTTSConnection(serverUrl: string): Promise<boolean> {
    return await this.synthesisService.testMaryTTSConnection(serverUrl);
  }
  
  // Obtenir les voix disponibles de MaryTTS
  async getMaryTTSVoices(serverUrl: string): Promise<string[]> {
    return await this.synthesisService.getMaryTTSVoices(serverUrl);
  }
  
  // Méthodes pour configurer la voix du navigateur
  setRate(rate: number) {
    this.synthesisService.setRate(rate);
  }
  
  setPitch(pitch: number) {
    this.synthesisService.setPitch(pitch);
  }
  
  setVolume(volume: number) {
    this.synthesisService.setVolume(volume);
  }
  
  setRoboticEffect(effect: number) {
    if (typeof this.synthesisService.setRoboticEffect === 'function') {
      this.synthesisService.setRoboticEffect(effect);
    }
  }
  
  // Add method to explicitly stop speech
  stopSpeaking() {
    this.synthesisService.stopSpeaking();
  }
}
