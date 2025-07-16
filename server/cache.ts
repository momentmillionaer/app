// Simple in-memory cache for Events
interface CachedData {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache: Map<string, CachedData> = new Map();

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`Cached ${key} for ${ttlMinutes} minutes`);
  }
  
  // Extended cache with longer TTL for critical data
  setLongTerm(key: string, data: any, ttlHours: number = 24): void {
    const ttl = ttlHours * 60 * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`Long-term cached ${key} for ${ttlHours} hours`);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Get expired cache data (for fallback during rate limiting)
  getExpiredCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  clearEvents(): void {
    this.cache.delete('events');
    console.log('🗑️ Events cache cleared');
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Check if we have any cached data (even if expired)
  hasAnyCache(key: string): boolean {
    return this.cache.has(key);
  }
}

export const cache = new MemoryCache();