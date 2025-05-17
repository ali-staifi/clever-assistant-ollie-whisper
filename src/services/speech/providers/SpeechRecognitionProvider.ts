
import { RecognitionCallbacks, RecognitionProvider } from '../types/recognition';

export class SpeechRecognitionProvider implements RecognitionProvider {
  private recognition: SpeechRecognition | null = null;
  private language: string = 'fr-FR';
  private sensitivity: number = 2.0; // Default sensitivity
  private isListening: boolean = false;

  constructor() {
    // Check browser support
    if (typeof window !== 'undefined' && 
        (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      // Modern browsers support
      const SpeechRecogClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecogClass();
      
      // Configure recognition
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
    } else {
      this.recognition = null;
      console.warn("Ce navigateur ne prend pas en charge la reconnaissance vocale.");
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(callbacks: RecognitionCallbacks): boolean {
    if (!this.isSupported()) {
      console.error("La reconnaissance vocale n'est pas supportée sur ce navigateur");
      if (callbacks.onError) callbacks.onError("La reconnaissance vocale n'est pas supportée sur ce navigateur");
      return false;
    }

    if (!this.recognition) return false;
    
    try {
      // Reset recognition object to clear previous handlers
      const SpeechRecogClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecogClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      
      // Set up callbacks
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        
        // Provide interim result during recognition
        if (!result.isFinal && callbacks.onInterimResult) {
          callbacks.onInterimResult(transcript);
        }
        
        // Final result
        if (result.isFinal && callbacks.onResult) {
          callbacks.onResult(transcript);
          this.isListening = false;
        }
      };
      
      // Error handling
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn(`Speech recognition error: ${event.error}`);
        
        // Only call onError if provided
        if (callbacks.onError) {
          callbacks.onError(event.error);
        }
        
        // Reset listening state for certain errors
        if (event.error !== 'no-speech') {
          this.isListening = false;
        }
      };
      
      // End of recognition session
      this.recognition.onend = () => {
        this.isListening = false;
      };
      
      // Start listening
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Erreur lors du démarrage de la reconnaissance vocale:", error);
      if (callbacks.onError) {
        callbacks.onError(`Erreur de reconnaissance vocale: ${error instanceof Error ? error.message : String(error)}`);
      }
      this.isListening = false;
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", error);
      }
    }
  }

  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  setSensitivity(value: number): void {
    this.sensitivity = Math.max(0.5, Math.min(5.0, value));
    // Note: Web Speech API doesn't directly support sensitivity adjustment
    // This is kept for interface consistency with other providers
  }
}
