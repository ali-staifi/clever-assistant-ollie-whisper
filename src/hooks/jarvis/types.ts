
import { Message } from '@/services/OllamaService';

export type OllamaStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface JarvisState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  showSettings: boolean;
  messages: Message[];
  ollamaUrl: string;
  ollamaModel: string;
  ollamaStatus: OllamaStatus;
  errorMessage: string;
  speechRecognitionAvailable: boolean;
}
