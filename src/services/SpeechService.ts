
// Add type declarations for the Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Speech Recognition API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private lang: string = 'en-US';
  private voice: SpeechSynthesisVoice | null = null;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    
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
    
    // Select a good voice if available
    this.setupVoice();
  }

  setupVoice() {
    if (!this.synthesis) return;
    
    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectVoice();
      };
    } else {
      this.selectVoice();
    }
  }

  selectVoice() {
    const voices = this.synthesis.getVoices();
    
    // Prefer high-quality voices in this order
    const preferredVoices = [
      // English premium voices
      "Google UK English Male", 
      "Microsoft Mark - English (United States)",
      "Microsoft Guy Online (Natural) - English (United States)",
      // Fallback to any voice that matches our language
      ...voices.filter(voice => voice.lang.startsWith(this.lang.split('-')[0]))
    ];
    
    for (const preferred of preferredVoices) {
      const match = voices.find(v => v.name === preferred);
      if (match) {
        this.voice = match;
        console.log(`Using voice: ${match.name}`);
        return;
      }
    }
    
    // Fallback to any English voice
    const anyEnglishVoice = voices.find(v => v.lang.startsWith('en'));
    if (anyEnglishVoice) {
      this.voice = anyEnglishVoice;
      console.log(`Using fallback voice: ${anyEnglishVoice.name}`);
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
      this.recognition.onresult = (event) => {
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

      this.recognition.onerror = (event) => {
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

  speak(text: string, onEnd?: () => void): boolean {
    if (!this.synthesis) return false;

    // Clear any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    console.log("Speaking:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
    this.synthesis.speak(utterance);
    return true;
  }

  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    // Refresh voice selection for the new language
    this.setupVoice();
  }
}

// Type declarations for browsers that don't have these types defined
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
