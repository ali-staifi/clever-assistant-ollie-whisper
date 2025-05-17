
import { SpeechRecognitionErrorEvent } from './types';
import { RecognitionCallbacks } from './types/recognition';
import { SpeechRecognitionProvider } from './providers/SpeechRecognitionProvider';
import { NoMicrophoneProvider } from './providers/NoMicrophoneProvider';
import { testMicrophoneAccess } from './MicrophoneUtils';

export class RecognitionService {
  private provider: SpeechRecognitionProvider | NoMicrophoneProvider;
  private browserProvider: SpeechRecognitionProvider;
  private noMicProvider: NoMicrophoneProvider;
  private language: string = 'fr-FR';
  private sensitivity: number = 2.0;
  private noMicrophoneMode: boolean = false;

  constructor() {
    // Initialize both providers
    this.browserProvider = new SpeechRecognitionProvider();
    this.noMicProvider = new NoMicrophoneProvider();
    
    // Set the active provider based on browser support
    this.provider = this.browserProvider.isSupported() ? 
      this.browserProvider : this.noMicProvider;
      
    // If browser recognition isn't supported, enable no-microphone mode
    if (!this.browserProvider.isSupported()) {
      this.noMicrophoneMode = true;
    }
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    // Choose the appropriate provider
    const activeProvider = this.noMicrophoneMode ? this.noMicProvider : this.provider;
    
    // Create callbacks object
    const callbacks: RecognitionCallbacks = {
      onInterimResult,
      onResult,
      onError
    };
    
    return activeProvider.startListening(callbacks);
  }

  stopListening() {
    const activeProvider = this.noMicrophoneMode ? this.noMicProvider : this.provider;
    activeProvider.stopListening();
  }

  async checkMicrophoneAccess(): Promise<boolean> {
    return await testMicrophoneAccess();
  }

  isRecognitionSupported(): boolean {
    return this.browserProvider.isSupported();
  }

  setLanguage(lang: string) {
    this.language = lang;
    // Update language for both providers
    this.browserProvider.setLanguage(lang);
    this.noMicProvider.setLanguage(lang);
  }

  setSensitivity(value: number) {
    this.sensitivity = value;
    // Only browser provider has sensitivity setting
    if (this.browserProvider instanceof SpeechRecognitionProvider) {
      this.browserProvider.setSensitivity(value);
    }
  }
  
  enableNoMicrophoneMode(enable: boolean = true) {
    this.noMicrophoneMode = enable;
    console.log("Mode sans microphone:", enable ? "activé" : "désactivé");
  }
}
