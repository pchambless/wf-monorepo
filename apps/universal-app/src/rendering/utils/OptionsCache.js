/**
 * OptionsCache LUOW - Sprint 3
 * 
 * Advanced caching system for select widget options with:
 * - TTL (Time To Live) expiration
 * - Global cache management
 * - Reduced API calls
 * - Faster select widget loading
 * - Cache statistics and debugging
 */

import { execEvent } from '../../utils/api.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('OptionsCache', 'info');

export class OptionsCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);

    log.info('OptionsCache LUOW initialized with TTL support');
  }

  /**
   * Get options from cache or fetch if not available/expired
   */
  async getOptions(queryName, ttl = null, fetchParams = {}) {
    try {
      this.stats.totalRequests++;
      
      const cacheKey = this.generateCacheKey(queryName, fetchParams);
      const cached = this.cache.get(cacheKey);
      
      // Check if cached data exists and is not expired
      if (cached && this.isValid(cached)) {
        this.stats.hits++;
        log.info(`OptionsCache: Cache HIT for ${queryName} (${cached.options.length} items, ${this.getAge(cached)}ms old)`);
        return cached.options;
      }
      
      // Cache miss or expired - fetch new data
      this.stats.misses++;
      if (cached) {
        log.info(`OptionsCache: Cache EXPIRED for ${queryName} (${this.getAge(cached)}ms old, TTL: ${cached.ttl}ms)`);
      } else {
        log.info(`OptionsCache: Cache MISS for ${queryName} - fetching fresh data`);
      }
      
      const options = await this.fetchOptions(queryName, fetchParams);
      
      // Cache the results with TTL
      const ttlValue = ttl || this.defaultTTL;
      this.setCache(cacheKey, options, ttlValue, queryName, fetchParams);
      
      return options;
    } catch (error) {
      log.error(`OptionsCache: Failed to get options for ${queryName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch options from API
   */
  async fetchOptions(queryName, fetchParams = {}) {
    try {
      log.info(`OptionsCache: Fetching options via execEvent: ${queryName}`);
      const result = await execEvent(queryName, fetchParams);
      
      if (result.error) {
        throw new Error(result.message || result.error || 'Failed to load options');
      }
      
      if (!result.data) {
        throw new Error('No data property in result');
      }
      
      const options = result.data || [];
      log.info(`OptionsCache: Fetched ${options.length} options for ${queryName}`);
      
      return options;
    } catch (error) {
      log.error(`OptionsCache: Fetch failed for ${queryName}:`, error);
      throw error;
    }
  }

  /**
   * Generate cache key from query name and parameters
   */
  generateCacheKey(queryName, params = {}) {
    if (Object.keys(params).length === 0) {
      return queryName;
    }
    
    // Create deterministic key from sorted params
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${queryName}#${sortedParams}`;
  }

  /**
   * Set cache entry with TTL
   */
  setCache(cacheKey, options, ttl, originalQuery, params) {
    const entry = {
      options,
      createdAt: Date.now(),
      ttl,
      originalQuery,
      params: params || {}
    };
    
    this.cache.set(cacheKey, entry);
    log.debug(`OptionsCache: Cached ${options.length} options with TTL ${ttl}ms for key: ${cacheKey}`);
  }

  /**
   * Check if cache entry is still valid (not expired)
   */
  isValid(entry) {
    const age = Date.now() - entry.createdAt;
    return age < entry.ttl;
  }

  /**
   * Get age of cache entry in milliseconds
   */
  getAge(entry) {
    return Date.now() - entry.createdAt;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(queryName, params = {}) {
    const cacheKey = this.generateCacheKey(queryName, params);
    const deleted = this.cache.delete(cacheKey);
    
    if (deleted) {
      log.info(`OptionsCache: Invalidated cache for ${cacheKey}`);
      this.stats.evictions++;
    }
    
    return deleted;
  }

  /**
   * Invalidate all cache entries for a query (ignoring params)
   */
  invalidateQuery(queryName) {
    let evicted = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.originalQuery === queryName) {
        this.cache.delete(key);
        evicted++;
      }
    }
    
    this.stats.evictions += evicted;
    log.info(`OptionsCache: Invalidated ${evicted} cache entries for query: ${queryName}`);
    return evicted;
  }

  /**
   * Clean up expired cache entries
   */
  cleanup() {
    const sizeBefore = this.cache.size;
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.stats.evictions += cleaned;
      log.info(`OptionsCache: Cleaned up ${cleaned} expired entries (${sizeBefore} → ${this.cache.size})`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
    log.info(`OptionsCache: Cleared all ${size} cache entries`);
  }

  /**
   * Get cache statistics for debugging and monitoring
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      defaultTTL: this.defaultTTL
    };
  }

  /**
   * Get detailed cache info for debugging
   */
  getCacheInfo() {
    const entries = [];
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        query: entry.originalQuery,
        optionsCount: entry.options.length,
        ageMs: this.getAge(entry),
        ttlMs: entry.ttl,
        expired: !this.isValid(entry),
        params: entry.params
      });
    }
    
    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.ageMs - a.ageMs) // Sort by age, newest first
    };
  }

  /**
   * Set default TTL for future cache entries
   */
  setDefaultTTL(ttlMs) {
    this.defaultTTL = ttlMs;
    log.info(`OptionsCache: Default TTL set to ${ttlMs}ms (${ttlMs / 1000}s)`);
  }

  /**
   * Cleanup interval on destroy
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    log.info('OptionsCache: Destroyed');
  }
}

// Export singleton instance
export const optionsCache = new OptionsCache();