import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;
  private staleBackup: Map<string, any>;

  constructor() {
    // stdTTL is default 60s, checkperiod 120s
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });
    this.staleBackup = new Map();
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, data, ttlSeconds);
    // Persist to stale backup for rate-limit protection
    this.staleBackup.set(key, { data, cachedAt: Date.now() });
  }

  public getStale<T>(key: string): { data: T; cachedAt: number } | undefined {
    return this.staleBackup.get(key);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public del(key: string): void {
    this.cache.del(key);
  }

  public flush(): void {
    this.cache.flushAll();
  }
}

export const cacheService = new CacheService();
