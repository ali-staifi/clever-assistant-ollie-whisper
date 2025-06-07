
export interface LumenSession {
  id: string;
  type: 'reasoning' | 'analysis' | 'learning' | 'planning';
  query: string;
  response: string;
  reasoning_steps: string[];
  confidence: number;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

export interface KnowledgeEntry {
  id: string;
  concept: string;
  description: string;
  relations: string[];
  examples: string[];
  timestamp: Date;
}
