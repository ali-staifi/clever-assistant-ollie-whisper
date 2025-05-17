
import { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from './types';

export class RecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private lang: string = 'en-US';
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
      // Reset retry counter on each new start
      this.retryCount = 0;
      
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
          
          errorMessage = "No speech detected. Try speaking louder or moving closer to your microphone.";
        } else if (event.error === 'network') {
          errorMessage = "Network error occurred. Please check your internet connection.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "No microphone was found or microphone is not working properly.";
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
      };
      
      // Set higher audio level for recognition
      if ((this.recognition as any).audioThreshold !== undefined) {
        (this.recognition as any).audioThreshold = 0.2;
      }

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
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
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
    }
  }
}
