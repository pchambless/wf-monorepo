/**
 * SelectFieldResolver LUOW - Sprint 2
 * 
 * Complete select field management:
 * - Value resolution with priority logic
 * - Options loading and caching
 * - Select-specific rendering logic
 */

import { createLogger } from '../../utils/logger.js';
import { execEvent } from '../../utils/api';
import { optionsCache } from './OptionsCache.js';

const log = createLogger('SelectFieldResolver', 'info');

export class SelectFieldResolver {
  /**
   * Resolve select field value using standardized priority
   * Priority: formData > dataStore[currentFormId] > contextStore > empty
   */
  resolveValue(name, formData = {}, dataStore = {}, contextStore = {}, currentFormId = null, contextKey = null) {
    // Priority 1: User edits in formData
    if (formData[name] !== undefined && formData[name] !== null) {
      log.info(`Select ${name}: Using formData value: ${formData[name]}`);
      return formData[name];
    }

    // Priority 2: Loaded data in dataStore[currentFormId]  
    if (currentFormId && dataStore[currentFormId]) {
      const formDataEntry = dataStore[currentFormId];
      const loadedValue = Array.isArray(formDataEntry) 
        ? formDataEntry[0]?.[name] 
        : formDataEntry?.[name];
      
      if (loadedValue !== undefined && loadedValue !== null) {
        log.info(`Select ${name}: Using dataStore[${currentFormId}][${name}]: ${loadedValue}`);
        return loadedValue;
      }
    }

    // Priority 3: Context values
    if (contextKey && contextStore[contextKey] !== undefined) {
      log.info(`Select ${name}: Using contextStore[${contextKey}]: ${contextStore[contextKey]}`);
      return contextStore[contextKey];
    }

    log.info(`Select ${name}: No value found - returning empty string`);
    return '';
  }

  /**
   * Load options for select field using OptionsCache LUOW
   * Enhanced with TTL caching, statistics, and advanced cache management
   */
  async loadOptions(queryName, id, ttl = null, fetchParams = {}) {
    try {
      if (!queryName) {
        log.warn(`Select ${id} has no qryName or eventType specified`);
        return [];
      }

      log.info(`Select ${id}: Loading options using OptionsCache LUOW for query: ${queryName}`);
      
      // Use advanced OptionsCache LUOW instead of simple caching
      const options = await optionsCache.getOptions(queryName, ttl, fetchParams);
      
      log.info(`Select ${id}: Loaded ${options.length} options via OptionsCache`);
      return options;
    } catch (err) {
      log.error(`Select ${id} options loading error:`, err);
      throw err;
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return optionsCache.getStats();
  }

  /**
   * Get detailed cache information
   */
  getCacheInfo() {
    return optionsCache.getCacheInfo();
  }

  /**
   * Invalidate cache for specific query
   */
  invalidateCache(queryName, params = {}) {
    return optionsCache.invalidate(queryName, params);
  }

  /**
   * Debug field resolution chain
   */
  debugResolution(name, formData, dataStore, contextStore, currentFormId, contextKey) {
    log.info(`🔍 Select ${name} resolution debug:`);
    log.info(`  - formData[${name}]: ${formData[name]}`);
    log.info(`  - dataStore[${currentFormId}][${name}]: ${currentFormId && dataStore[currentFormId] ? (Array.isArray(dataStore[currentFormId]) ? dataStore[currentFormId][0]?.[name] : dataStore[currentFormId]?.[name]) : 'N/A'}`);
    log.info(`  - contextStore[${contextKey}]: ${contextKey ? contextStore[contextKey] : 'N/A'}`);
    log.info(`  - resolved: ${this.resolveValue(name, formData, dataStore, contextStore, currentFormId, contextKey)}`);
  }
}

// Export singleton instance
export const selectFieldResolver = new SelectFieldResolver();