
import { SpeechRecognitionErrorEvent } from './types';

export class RecognitionService {
  private recognition: any; // Using any temporarily to handle browser differences
  private isListening: boolean = false;
  private language: string = 'fr-FR'; // Définir français par défaut
  private sensitivity: number = 2.0; // Augmenter la sensibilité par défaut
  private noMicrophoneMode: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor() {
    this.setupRecognition();
  }

  setupRecognition() {
    // Check if browser supports SpeechRecognition
    if ('webkitSpeechRecognition' in window) {
      const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
      this.recognition = new WebkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
    } else {
      console.warn("Speech recognition not supported in this browser");
      this.noMicrophoneMode = true;
      return false;
    }

    // Configure recognition settings
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      
      console.log("Speech recognition initialized successfully with language:", this.language);
      return true;
    }
    
    return false;
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    // In no-microphone mode, we'll simulate speech input
    if (this.noMicrophoneMode) {
      console.log("Running in no-microphone mode");
      if (onResult) {
        setTimeout(() => {
          onResult("Mode sans microphone activé. Veuillez saisir votre message via l'interface texte.");
        }, 1000);
      }
      return true;
    }
    
    // Check if recognition is available
    if (!this.recognition) {
      if (!this.setupRecognition()) {
        if (onError) onError("La reconnaissance vocale n'est pas prise en charge dans votre navigateur");
        return false;
      }
    }

    try {
      // Reset reconnect attempts on new start
      this.reconnectAttempts = 0;
      
      // Setup event handlers
      this.recognition.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        
        // Apply sensitivity boost to the confidence
        const confidence = Math.min(1, event.results[resultIndex][0].confidence * this.sensitivity);
        
        console.log(`Transcript reçu: "${transcript}" avec confiance: ${confidence}`);
        
        if (event.results[resultIndex].isFinal) {
          if (confidence > 0.2) { // Réduire le seuil de confiance pour plus de sensibilité
            if (onResult) onResult(transcript);
          } else {
            console.log("Résultat de faible confiance ignoré:", transcript, confidence);
            if (onError) onError("La voix n'a pas été clairement comprise. Veuillez parler plus fort ou approcher le microphone.");
          }
        } else {
          if (onInterimResult) onInterimResult(transcript);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        
        // Custom handling for no-speech error - don't treat it as critical
        if (event.error === 'no-speech') {
          console.log("Aucune parole détectée, continue d'écouter");
          
          // Try to restart recognition after a short delay
          setTimeout(() => {
            if (this.isListening && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              try {
                console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.recognition.stop();
                setTimeout(() => {
                  if (this.isListening) {
                    this.recognition.start();
                  }
                }, 300);
              } catch (e) {
                console.error("Erreur lors du redémarrage de la reconnaissance:", e);
                if (onError) onError(`Erreur de reconnexion: ${e}`);
              }
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              if (onError) onError("Plusieurs tentatives d'écoute sans parole détectée. Vérifiez que votre microphone fonctionne.");
            }
          }, 1000);
        } else if (event.error === 'audio-capture') {
          if (onError) onError("Impossible de détecter un microphone. Vérifiez les permissions et que le microphone est bien connecté.");
        } else if (event.error === 'not-allowed') {
          if (onError) onError("La permission d'utiliser le microphone a été refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
        } else {
          if (onError) onError(`Erreur de reconnaissance: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // Only set isListening to false if we're not trying to restart
        if (this.isListening && this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log("Reconnaissance terminée après plusieurs tentatives");
          this.isListening = false;
        }
      };

      // Start recognition
      console.log("Démarrage de la reconnaissance vocale...");
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.error("Erreur lors du démarrage de la reconnaissance vocale:", err);
      if (onError) onError(`Échec du démarrage de la reconnaissance vocale: ${err}`);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log("Reconnaissance vocale arrêtée manuellement");
      } catch (err) {
        console.error("Erreur lors de l'arrêt de la reconnaissance:", err);
      }
      this.isListening = false;
      this.reconnectAttempts = 0;
    }
  }

  isRecognitionSupported(): boolean {
    return !this.noMicrophoneMode && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));
  }

  setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
      console.log("Langue de reconnaissance définie sur:", lang);
    }
  }

  setSensitivity(value: number) {
    this.sensitivity = value;
    console.log("Sensibilité de reconnaissance vocale définie sur:", value);
  }
  
  // Add a method to enable simulation mode for testing without a microphone
  enableNoMicrophoneMode(enable: boolean = true) {
    this.noMicrophoneMode = enable;
    console.log("Mode sans microphone:", enable ? "activé" : "désactivé");
  }
}
