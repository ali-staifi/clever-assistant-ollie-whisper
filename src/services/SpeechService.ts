
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
  
  // Improved voice setting that properly synchronizes language across all services
  setVoice(voiceName: string) {
    // First, get the voice details
    const voices = this.getAvailableVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    
    if (!selectedVoice) {
      console.warn(`Voix non trouvée: ${voiceName}`);
      return;
    }
    
    // Set the voice in the synthesis service
    this.synthesisService.setVoice(voiceName);
    
    // CRITICAL: Always sync languages across all services when voice changes
    console.log(`Synchronisation de la langue avec la voix sélectionnée: ${selectedVoice.lang}`);
    
    // Update synthesis language to exactly match the voice's language
    this.synthesisService.setLanguage(selectedVoice.lang);
    
    // Format the language code for recognition (which often needs a specific format)
    const langCode = selectedVoice.lang.split('-')[0];
    const countryCode = selectedVoice.lang.split('-')[1] || '';
    
    // Set recognition language in the format it expects
    if (countryCode) {
      const recognitionLang = `${langCode}-${countryCode.toUpperCase()}`;
      this.recognitionService.setLanguage(recognitionLang);
      console.log(`Langue de reconnaissance définie sur: ${recognitionLang}`);
    } else {
      this.recognitionService.setLanguage(langCode);
      console.log(`Langue de reconnaissance définie sur: ${langCode}`);
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
