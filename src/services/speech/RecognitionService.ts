
import { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from './types';

export class RecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private lang: string = 'en-US';

  constructor() {
    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true; // Set to true to get interim results
      this.recognition.lang = this.lang;
      
      console.log("Speech recognition initialized successfully");
    } else {
      console.warn("Speech recognition not supported in this browser");
    }
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
          errorMessage = "No speech detected. Please speak more loudly or check your microphone.";
        } else if (event.error === 'network') {
          errorMessage = "Network error occurred. Please check your internet connection.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        }
        
        if (onError) onError(errorMessage);
      };

      this.recognition.onend = () => {
        console.log("Speech recognition ended");
        this.isListening = false;
      };
      
      // Log when recognition starts
      this.recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      console.log("Starting speech recognition...");
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      const errorMsg = `Failed to start speech recognition: ${error}`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      console.log("Stopping speech recognition");
      this.recognition.stop();
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
    }
  }
}
