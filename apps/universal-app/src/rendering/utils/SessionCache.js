/**
 * SessionCache LUOW - Sprint 3 Extension
 * 
 * Extends OptionsCache pattern for session-level parameters.
 * Eliminates redundant getVal calls for user session data like:
 * - firstName (9x reads → 0x reads)
 * - account_id (4x reads → 0x reads) 
 * - userEmail, userName, role_id, etc.
 * 
 * Session data is set once at login and cached for entire session.
 */

import { createLogger } from '../../utils/logger.js';

const log = createLogger('SessionCache', 'info');

export class SessionCache {
  constructor() {
    this.sessionData = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      totalRequests: 0
    };
    
    // Session-level parameters that should be cached
    this.sessionParams = new Set([
      'firstName', 'lastName', 'userName', 'userEmail',
      'user_id', 'account_id', 'role_id', 'appName'
    ]);

    log.info('SessionCache LUOW initialized for session-level parameters');
  }

  /**
   * Set session parameter (typically called once at login)
   */
  setSessionParam(paramName, paramValue) {
    if (!this.sessionParams.has(paramName)) {
      log.debug(`SessionCache: ${paramName} not recognized as session param, allowing anyway`);
    }
    
    this.sessionData.set(paramName, {
      value: paramValue,
      setAt: Date.now()
    });
    
    this.stats.sets++;
    log.info(`SessionCache: Set session param ${paramName} = ${paramValue}`);
  }

  /**
   * Get session parameter (replaces getVal calls for session data)
   */
  getSessionParam(paramName) {
    this.stats.totalRequests++;
    
    const cached = this.sessionData.get(paramName);
    
    if (cached) {
      this.stats.hits++;
      log.debug(`SessionCache: HIT for ${paramName} = ${cached.value} (set ${this.getAge(cached)}ms ago)`);
      return cached.value;
    }
    
    this.stats.misses++;
    log.debug(`SessionCache: MISS for ${paramName} - not in session cache`);
    return null;
  }

  /**
   * Check if parameter is cached
   */
  hasSessionParam(paramName) {
    return this.sessionData.has(paramName);
  }

  /**
   * Get age of cached parameter in milliseconds
   */
  getAge(cachedEntry) {
    return Date.now() - cachedEntry.setAt;
  }

  /**
   * Set multiple session parameters at once (efficient bulk set)
   */
  setSessionData(sessionObject) {
    let setCount = 0;
    
    for (const [key, value] of Object.entries(sessionObject)) {
      this.setSessionParam(key, value);
      setCount++;
    }
    
    log.info(`SessionCache: Bulk set ${setCount} session parameters`);
  }

  /**
   * Get all session data
   */
  getAllSessionData() {
    const result = {};
    
    for (const [key, cached] of this.sessionData.entries()) {
      result[key] = cached.value;
    }
    
    return result;
  }

  /**
   * Clear session cache (e.g., on logout)
   */
  clearSession() {
    const size = this.sessionData.size;
    this.sessionData.clear();
    log.info(`SessionCache: Cleared ${size} session parameters`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cachedParams: this.sessionData.size,
      sessionParamTypes: Array.from(this.sessionParams)
    };
  }

  /**
   * Get detailed cache info for debugging
   */
  getCacheInfo() {
    const entries = [];
    
    for (const [key, cached] of this.sessionData.entries()) {
      entries.push({
        param: key,
        value: cached.value,
        ageMs: this.getAge(cached),
        isSessionParam: this.sessionParams.has(key)
      });
    }
    
    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.ageMs - a.ageMs) // Sort by age
    };
  }

  /**
   * Register additional session parameter types
   */
  addSessionParamType(paramName) {
    this.sessionParams.add(paramName);
    log.debug(`SessionCache: Added ${paramName} as session parameter type`);
  }

  /**
   * Check if a parameter should be session-cached
   */
  isSessionParam(paramName) {
    return this.sessionParams.has(paramName);
  }
}

// Export singleton instance
export const sessionCache = new SessionCache();