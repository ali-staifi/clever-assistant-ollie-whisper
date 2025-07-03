interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
}

export class MCPCacheService {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number = 1000; // Maximum cache entries
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  constructor(maxSize?: number, defaultTTL?: number) {
    if (maxSize) this.maxSize = maxSize;
    if (defaultTTL) this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(endpoint: string, params: any): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Get data from cache
   */
  get<T>(endpoint: string, params: any): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);
    
    this.stats.totalRequests++;
    
    if (!entry || !this.isValid(entry)) {
      this.stats.misses++;
      if (entry) {
        this.cache.delete(key); // Remove expired entry
      }
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    console.log(`Cache HIT pour ${endpoint}`);
    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  set(endpoint: string, params: any, data: any, ttl?: number): void {
    const key = this.generateKey(endpoint, params);
    const now = Date.now();
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Check if we need to make space
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const entry: CacheEntry = {
      key,
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessCount: 1,
      lastAccessed: now
    };
    
    this.cache.set(key, entry);
    console.log(`Cache SET pour ${endpoint} (TTL: ${entry.ttl}ms)`);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        toRemove.push(key);
      }
    }
    
    toRemove.forEach(key => this.cache.delete(key));
    
    if (toRemove.length > 0) {
      console.log(`Cache cleanup: ${toRemove.length} entrées expirées supprimées`);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Cache LRU éviction: ${oldestKey}`);
    }
  }

  /**
   * Clear specific cache entries by pattern
   */
  invalidate(pattern: string): number {
    const toRemove: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        toRemove.push(key);
      }
    }
    
    toRemove.forEach(key => this.cache.delete(key));
    console.log(`Cache invalidation: ${toRemove.length} entrées supprimées pour le pattern "${pattern}"`);
    
    return toRemove.length;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
    console.log(`Cache entièrement vidé: ${size} entrées supprimées`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    
    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough byte estimation
    }
    
    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage
    };
  }

  /**
   * Get cache entries for debugging
   */
  getEntries(): Array<{ key: string; size: number; age: number; accessCount: number }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: now - entry.timestamp,
      accessCount: entry.accessCount
    }));
  }

  /**
   * Configure cache settings
   */
  configure(settings: { maxSize?: number; defaultTTL?: number }): void {
    if (settings.maxSize) this.maxSize = settings.maxSize;
    if (settings.defaultTTL) this.defaultTTL = settings.defaultTTL;
    
    console.log(`Cache reconfiguré: maxSize=${this.maxSize}, defaultTTL=${this.defaultTTL}ms`);
  }
}

// Global cache instance
export const mcpCache = new MCPCacheService();