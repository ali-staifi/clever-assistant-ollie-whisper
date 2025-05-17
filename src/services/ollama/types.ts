
// Types for Ollama Chat responses
export interface ChatOllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  message?: {
    role: string;
    content: string;
  };
}

// Re-export Message type from OllamaService
// Using 'export type' instead of just 'export' to fix the isolatedModules error
export type { Message } from '@/services/OllamaService';
