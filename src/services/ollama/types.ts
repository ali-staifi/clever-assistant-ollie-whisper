
// Types for Ollama Chat responses
export interface ChatOllamaResponse {
  model: string;
  created_at: string;
  response?: string;
  content?: string;
  text?: string;
  output?: string;
  done: boolean;
  message?: {
    role: string;
    content: string;
  };
  [key: string]: any; // Pour gérer des champs dynamiques potentiels
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
