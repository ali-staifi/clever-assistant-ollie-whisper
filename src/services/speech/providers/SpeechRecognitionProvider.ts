import { RecognitionCallbacks, RecognitionProvider } from '../types/recognition';

export class SpeechRecognitionProvider implements RecognitionProvider {
  private recognition: any; // Using any temporarily to handle browser differences
  private isListening: boolean = false;
  private language: string = 'fr-FR';
  private sensitivity: number = 2.0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private confidenceThreshold: number = 0.01;

  constructor() {
    this.setupRecognition();
  }

  setupRecognition(): boolean {
    // Check if browser supports SpeechRecognition
    if ('webkitSpeechRecognition' in window) {
      const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
      this.recognition = new WebkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
    } else {
      console.warn("Speech recognition not supported in this browser");
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

  isSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  startListening(callbacks: RecognitionCallbacks): boolean {
    // Check if recognition is available
    if (!this.recognition) {
      if (!this.setupRecognition()) {
        if (callbacks.onError) callbacks.onError("La reconnaissance vocale n'est pas prise en charge dans votre navigateur");
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
          // Accept ANY speech with clear text, even with zero confidence
          // Only discard if the text itself is empty or very short
          if (transcript.trim().length > 1) {
            if (callbacks.onResult) callbacks.onResult(transcript);
            console.log("Accepted transcript with text:", transcript);
          } else {
            console.log("Discarded empty or too short result:", transcript);
            if (callbacks.onError) callbacks.onError("Could not understand audio clearly. Please try again.");
          }
        } else {
          if (callbacks.onInterimResult) callbacks.onInterimResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
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
                if (callbacks.onError) callbacks.onError(`Erreur de reconnexion: ${e}`);
              }
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              if (callbacks.onError) callbacks.onError("Plusieurs tentatives d'écoute sans parole détectée. Vérifiez que votre microphone fonctionne correctement.");
            }
          }, 1000);
        } else if (event.error === 'audio-capture') {
          if (callbacks.onError) callbacks.onError("Impossible de détecter un microphone. Vérifiez les permissions et que le microphone est bien connecté.");
        } else if (event.error === 'not-allowed') {
          if (callbacks.onError) callbacks.onError("La permission d'utiliser le microphone a été refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
        } else {
          if (callbacks.onError) callbacks.onError(`Erreur de reconnaissance: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        console.log("Recognition ended");
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
      if (callbacks.onError) callbacks.onError(`Échec du démarrage de la reconnaissance vocale: ${err}`);
      return false;
    }
  }

  stopListening(): void {
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

  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
      console.log("Langue de reconnaissance définie sur:", lang);
    }
  }

  setSensitivity(value: number): void {
    this.sensitivity = value;
    // Adjust the confidence threshold inversely to sensitivity
    // But keep it very low to accept almost any speech
    this.confidenceThreshold = Math.max(0.01, 0.1 / value);
    console.log("Sensibilité de reconnaissance vocale définie sur:", value);
    console.log("Seuil de confiance ajusté à:", this.confidenceThreshold);
  }

  // For testing microphone access
  async checkMicrophoneAccess(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // If request succeeds, microphone is working
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Clean up after testing
      return true;
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      return false;
    }
  }
}
