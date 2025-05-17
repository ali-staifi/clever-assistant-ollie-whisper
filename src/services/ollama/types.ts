
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
export { Message } from '@/services/OllamaService';
