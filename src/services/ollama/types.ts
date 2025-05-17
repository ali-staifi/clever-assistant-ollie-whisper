
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

// General Ollama Response
export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// Message type for both services
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
