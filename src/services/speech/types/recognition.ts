
// Type declarations for speech recognition specific interfaces
export interface RecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export interface RecognitionCallbacks {
  onInterimResult?: (text: string) => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface RecognitionProvider {
  isSupported(): boolean;
  startListening(callbacks: RecognitionCallbacks): boolean;
  stopListening(): void;
  setLanguage(lang: string): void;
}
