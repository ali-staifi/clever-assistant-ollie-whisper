
import { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from './types';

export class RecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private lang: string = 'fr-FR'; // Changé par défaut en français
  private sensitivity: number = 1.5; // Default higher sensitivity
  private retryCount: number = 0;
  private maxRetries: number = 3; // Allow automatic retries

  constructor() {
    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Set to true to keep listening even after silence
      this.recognition.interimResults = true; // Set to true to get interim results
      this.recognition.lang = this.lang;
      
      // Set longer speech timeout (in milliseconds)
      if ((this.recognition as any).speechTimeout !== undefined) {
        (this.recognition as any).speechTimeout = 5000; // 5 seconds
      }
      
      console.log("Speech recognition initialized successfully");
    } else {
      console.warn("Speech recognition not supported in this browser");
    }
  }

  setSensitivity(value: number): void {
    this.sensitivity = value;
    console.log("Speech recognition sensitivity set to:", value);
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      const errorMsg = 'Speech recognition is not supported in this browser';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }

    try {
      // Important: Si déjà en cours d'écoute, arrêter d'abord
      if (this.isListening) {
        console.log("Recognition already active, stopping before restart");
        this.stopListening();
        
        // Petit délai pour s'assurer que le service est complètement arrêté
        setTimeout(() => {
          this.startListeningInternal(onInterimResult, onResult, onError);
        }, 300); // Augmenter le délai à 300ms
        return true;
      }
      
      return this.startListeningInternal(onInterimResult, onResult, onError);
    } catch (error) {
      const errorMsg = `Failed to start speech recognition: ${error}`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }
  }
  
  private startListeningInternal(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    // Reset retry counter on each new start
    this.retryCount = 0;
    
    if (!this.recognition) return false;
    
    // S'assurer que les écouteurs sont correctement configurés
    this.setupRecognitionListeners(onInterimResult, onResult, onError);
    
    console.log("Starting speech recognition...");
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Error starting recognition:", error);
      return false;
    }
  }
  
  private setupRecognitionListeners(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ) {
    if (!this.recognition) return;
    
    // Supprimer les anciens écouteurs pour éviter les doublons
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
    this.recognition.onstart = null;
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        if (event.results[0].isFinal && onResult) {
          console.log("Final transcript:", transcript);
          onResult(transcript);
        } else if (onInterimResult) {
          console.log("Interim transcript:", transcript);
          onInterimResult(transcript);
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = `Speech recognition error: ${event.error}`;
      // Provide more helpful messages for common errors
      if (event.error === 'no-speech') {
        // Auto-retry for no-speech errors
        if (this.retryCount < this.maxRetries) {
          console.log(`No speech detected, retrying (${this.retryCount + 1}/${this.maxRetries})...`);
          this.retryCount++;
          
          // Don't report the error, just restart recognition
          setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition?.abort();
                setTimeout(() => {
                  this.recognition?.start();
                }, 500);
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }
          }, 1000);
          
          return; // Skip the error callback
        }
        
        errorMessage = "Pas de voix détectée. Essayez de parler plus fort ou rapprochez-vous du microphone.";
      } else if (event.error === 'network') {
        errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Accès au microphone refusé. Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "Aucun microphone trouvé ou le microphone ne fonctionne pas correctement.";
      }
      
      // Only call onError if we're not going to retry
      if (onError) onError(errorMessage);
    };

    this.recognition.onend = () => {
      console.log("Speech recognition ended");
      
      // Restart recognition if it's still supposed to be listening
      // and we haven't exceeded retry attempts
      if (this.isListening && this.retryCount < this.maxRetries) {
        console.log("Restarting speech recognition...");
        try {
          this.recognition?.start();
        } catch (e) {
          console.error('Error restarting recognition:', e);
          this.isListening = false;
        }
      } else {
        this.isListening = false;
      }
    };
    
    // Log when recognition starts
    this.recognition.onstart = () => {
      console.log("Speech recognition started");
      this.isListening = true;
    };
    
    // Set higher audio level for recognition
    if ((this.recognition as any).audioThreshold !== undefined) {
      (this.recognition as any).audioThreshold = 0.2;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      console.log("Stopping speech recognition");
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
        
        // Si l'arrêt échoue, essayer d'utiliser abort()
        try {
          this.recognition.abort();
        } catch (e2) {
          console.error('Error aborting recognition:', e2);
        }
      }
      this.isListening = false;
    }
  }

  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
      console.log(`Speech recognition language set to: ${lang}`);
    }
  }
}
