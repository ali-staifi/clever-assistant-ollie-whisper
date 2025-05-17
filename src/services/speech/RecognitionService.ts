
import { SpeechRecognitionErrorEvent } from './types';

export class RecognitionService {
  private recognition: any; // Using any temporarily to handle browser differences
  private isListening: boolean = false;
  private language: string = 'en-US';
  private sensitivity: number = 1.0;

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
      return false;
    }

    // Configure recognition settings
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      
      console.log("Speech recognition initialized successfully");
      return true;
    }
    
    return false;
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    // Check if recognition is available
    if (!this.recognition) {
      if (!this.setupRecognition()) {
        if (onError) onError("Speech recognition not supported in your browser");
        return false;
      }
    }

    try {
      // Setup event handlers
      this.recognition.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        
        // Apply sensitivity boost to the confidence
        const confidence = Math.min(1, event.results[resultIndex][0].confidence * this.sensitivity);
        
        if (event.results[resultIndex].isFinal) {
          if (confidence > 0.3) { // Apply confidence threshold
            if (onResult) onResult(transcript);
          } else {
            console.log("Discarded low confidence result:", transcript, confidence);
            if (onError) onError("Could not understand audio clearly. Please try again.");
          }
        } else {
          if (onInterimResult) onInterimResult(transcript);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (onError) onError(`Recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Don't automatically restart to avoid infinite loops
      };

      // Start recognition
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      if (onError) onError(`Failed to start speech recognition: ${err}`);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
      this.isListening = false;
    }
  }

  isRecognitionSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  setSensitivity(value: number) {
    this.sensitivity = value;
    console.log("Speech recognition sensitivity set to:", value);
  }
}
