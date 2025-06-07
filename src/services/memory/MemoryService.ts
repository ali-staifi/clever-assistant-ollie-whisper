import { MemoryEntry, MemoryQuery, MemorySearchResult } from '@/types/memory';

export class MemoryService {
  private entries: MemoryEntry[] = [];
  private storageKey = 'app-memory-system';

  constructor() {
    this.loadFromStorage();
  }

  // Simple text embedding using character frequency (for demo - in production use proper embeddings)
  private generateEmbedding(text: string): number[] {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 ';
    const embedding = new Array(chars.length).fill(0);
    
    const normalizedText = text.toLowerCase();
    for (const char of normalizedText) {
      const index = chars.indexOf(char);
      if (index !== -1) {
        embedding[index]++;
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  // Calculate cosine similarity between two embeddings
  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  async addMemory(content: string, metadata: Partial<MemoryEntry['metadata']>): Promise<void> {
    const entry: MemoryEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      metadata: {
        type: metadata.type || 'context',
        source: metadata.source || 'unknown',
        timestamp: new Date(),
        tags: metadata.tags || [],
        importance: metadata.importance || 5,
      },
      embedding: this.generateEmbedding(content),
    };

    this.entries.push(entry);
    
    // Keep only the most recent 1000 entries to manage memory
    if (this.entries.length > 1000) {
      this.entries = this.entries
        .sort((a, b) => b.metadata.importance - a.metadata.importance)
        .slice(0, 1000);
    }
    
    this.saveToStorage();
  }

  async searchMemory(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const queryEmbedding = this.generateEmbedding(query.text);
    const threshold = query.threshold || 0.1;
    const limit = query.limit || 10;

    let filteredEntries = this.entries;

    // Filter by type if specified
    if (query.type) {
      filteredEntries = filteredEntries.filter(entry => entry.metadata.type === query.type);
    }

    // Filter by source if specified
    if (query.source) {
      filteredEntries = filteredEntries.filter(entry => entry.metadata.source === query.source);
    }

    // Calculate similarities and filter by threshold
    const results: MemorySearchResult[] = filteredEntries
      .map(entry => ({
        entry,
        similarity: this.calculateSimilarity(queryEmbedding, entry.embedding || []),
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => {
        // Sort by similarity first, then by importance, then by recency
        if (Math.abs(a.similarity - b.similarity) > 0.01) {
          return b.similarity - a.similarity;
        }
        if (a.entry.metadata.importance !== b.entry.metadata.importance) {
          return b.entry.metadata.importance - a.entry.metadata.importance;
        }
        return b.entry.metadata.timestamp.getTime() - a.entry.metadata.timestamp.getTime();
      })
      .slice(0, limit);

    return results;
  }

  async getRelevantContext(query: string, source?: string): Promise<string> {
    const results = await this.searchMemory({
      text: query,
      source,
      limit: 5,
      threshold: 0.1,
    });

    if (results.length === 0) {
      return "Aucun contexte pertinent trouvé dans la mémoire.";
    }

    const contextParts = results.map(result => 
      `[${result.entry.metadata.type}] ${result.entry.content} (similarité: ${(result.similarity * 100).toFixed(1)}%)`
    );

    return `Contexte pertinent de la mémoire :\n${contextParts.join('\n')}`;
  }

  getEntries(): MemoryEntry[] {
    return [...this.entries];
  }

  clearMemory(): void {
    this.entries = [];
    this.saveToStorage();
  }

  getMemoryStats() {
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.entries.forEach(entry => {
      byType[entry.metadata.type] = (byType[entry.metadata.type] || 0) + 1;
      bySource[entry.metadata.source] = (bySource[entry.metadata.source] || 0) + 1;
    });

    return {
      totalEntries: this.entries.length,
      byType,
      bySource,
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la mémoire:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.entries = parsed.map((entry: any) => ({
          ...entry,
          metadata: {
            ...entry.metadata,
            timestamp: new Date(entry.metadata.timestamp),
          },
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la mémoire:', error);
      this.entries = [];
    }
  }
}
