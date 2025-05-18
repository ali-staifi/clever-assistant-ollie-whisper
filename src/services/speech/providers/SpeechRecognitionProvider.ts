
import { RecognitionCallbacks, RecognitionProvider } from '../types/recognition';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';

export class SpeechRecognitionProvider implements RecognitionProvider {
  private recognition: SpeechRecognition | null = null;
  private language: string = 'fr-FR';
  private sensitivity: number = 2.0; // Default sensitivity
  private isListening: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

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
    
    // Reset retry count on new listening session
    this.retryCount = 0;
    
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
          // Reset retry count on successful completion
          this.retryCount = 0;
        }
      };
      
      // Error handling with automatic retry for certain errors
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn(`Speech recognition error: ${event.error}`);
        
        const shouldRetry = this.shouldRetryError(event.error);
        
        // Only attempt retry if appropriate
        if (shouldRetry && this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Tentative de reconnexion au micro (${this.retryCount}/${this.maxRetries})...`);
          
          // Wait a moment before retrying
          setTimeout(() => {
            if (this.isListening) {
              this.tryRestartRecognition();
            }
          }, 500);
          
          // Don't propagate the error to the user for retryable errors
          return;
        }
        
        // Only call onError if provided and we're not retrying
        if (callbacks.onError) {
          const friendlyError = this.getFriendlyErrorMessage(event.error);
          callbacks.onError(friendlyError);
        }
        
        // Reset listening state for certain errors
        if (event.error !== 'no-speech') {
          this.isListening = false;
        }
      };
      
      // End of recognition session
      this.recognition.onend = () => {
        // Only handle end event if we were actually listening and it's not a retry situation
        if (this.isListening && this.retryCount >= this.maxRetries) {
          this.isListening = false;
          
          // If we've reached max retries and still have issues, notify user
          if (this.retryCount >= this.maxRetries && callbacks.onError) {
            callbacks.onError("La reconnaissance vocale s'est arrêtée. Veuillez réessayer.");
          }
        }
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
        // Reset retry count when explicitly stopping
        this.retryCount = 0;
      } catch (error) {
        console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", error);
      }
    }
  }
  
  // Helper method to attempt restarting recognition
  private tryRestartRecognition(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      // Try to restart recognition
      this.recognition.abort();
      setTimeout(() => {
        if (this.recognition && this.isListening) {
          this.recognition.start();
        }
      }, 300);
    } catch (error) {
      console.error("Erreur lors de la relance de la reconnaissance vocale:", error);
      this.isListening = false;
    }
  }
  
  // Helper method to determine if we should retry on a specific error
  private shouldRetryError(errorType: string): boolean {
    // Errors that might be temporary and worth retrying
    const retryableErrors = ['network', 'aborted', 'audio-capture', 'service-not-allowed'];
    return retryableErrors.includes(errorType);
  }
  
  // Helper method to create user-friendly error messages
  private getFriendlyErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'aborted':
        return "La reconnaissance vocale a été interrompue. Veuillez réessayer.";
      case 'audio-capture':
        return "Impossible de capturer l'audio. Vérifiez votre microphone.";
      case 'network':
        return "Problème de connexion réseau lors de la reconnaissance vocale.";
      case 'no-speech':
        return "Aucune parole détectée. Parlez plus fort ou vérifiez votre microphone.";
      case 'not-allowed':
        return "La permission d'utiliser le microphone a été refusée.";
      case 'service-not-allowed':
        return "Le service de reconnaissance vocale n'est pas disponible actuellement.";
      default:
        return `Erreur de reconnaissance vocale: ${errorType}`;
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
