
export interface MemoryEntry {
  id: string;
  content: string;
  metadata: {
    type: 'conversation' | 'knowledge' | 'context' | 'user_preference';
    source: string; // page or component source
    timestamp: Date;
    tags: string[];
    importance: number; // 1-10 scale
  };
  embedding?: number[]; // Vector embedding for similarity search
}

export interface MemoryQuery {
  text: string;
  type?: MemoryEntry['metadata']['type'];
  source?: string;
  limit?: number;
  threshold?: number; // Similarity threshold
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  similarity: number;
}

export interface MemoryContext {
  entries: MemoryEntry[];
  addMemory: (content: string, metadata: Partial<MemoryEntry['metadata']>) => Promise<void>;
  searchMemory: (query: MemoryQuery) => Promise<MemorySearchResult[]>;
  getRelevantContext: (query: string, source?: string) => Promise<string>;
  clearMemory: () => void;
  getMemoryStats: () => {
    totalEntries: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  };
}
