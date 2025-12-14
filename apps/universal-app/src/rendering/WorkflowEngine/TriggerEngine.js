/**
 * TriggerEngine - Database-Driven Trigger Execution
 * Simple, clean architecture for executing database-defined triggers
 */

import { createLogger } from "../../utils/logger.js";
import { sessionCache } from "../utils/SessionCache.js";

const log = createLogger('TriggerEngine', 'info');

export class TriggerEngine {
  constructor() {
    this.contextStore = null;
  }

  /**
   * Initialize with context store
   */
  initialize(contextStore) {
    this.contextStore = contextStore;
  }

  /**
   * Get current context store
   */
  getContext() {
    return this.contextStore || {};
  }

  /**
   * Execute trigger by action name
   * @param {string} trigType - "action" or "class"
   * @param {string} actionName - Name of the trigger (setVals, execEvent, etc.)
   * @param {any} content - Content from database trigger
   * @param {Object} context - Execution context
   */
  async execute(trigType, actionName, content, context = {}) {
    try {
      log.info(`Executing ${trigType}/${actionName}:`, content);

      // Add contextStore to context
      const fullContext = { ...context, contextStore: this.contextStore };

      // Resolve template tokens in content
      const resolvedContent = await this.resolveTemplates(content, fullContext);
      log.debug(`Template resolution:`, { original: content, resolved: resolvedContent });

      // Dynamic import with explicit path context for webpack
      let module;
      try {
        if (trigType === 'action') {
          // Webpack can analyze this pattern: import(`./triggers/action/${variable}.js`)
          module = await import(/* webpackChunkName: "trigger-action-[request]" */ `./triggers/action/${actionName}.js`);
        } else if (trigType === 'class') {
          module = await import(/* webpackChunkName: "trigger-class-[request]" */ `./triggers/class/${actionName}.js`);
        } else {
          throw new Error(`Unknown trigger type: ${trigType}`);
        }
      } catch (error) {
        throw new Error(`Failed to load trigger ${trigType}/${actionName}: ${error.message}`);
      }

      // Get the function (should match the actionName)
      const triggerFunction = module[actionName];

      if (!triggerFunction || typeof triggerFunction !== 'function') {
        throw new Error(`Function ${actionName} not found in ${trigType}/${actionName}.js`);
      }

      // Execute with standard signature: (resolvedContent, context)
      const result = await triggerFunction(resolvedContent, fullContext);

      log.info(`${trigType}/${actionName} completed`);
      return result;

    } catch (error) {
      log.error(`${trigType}/${actionName} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute database triggers for a component
   * @param {Array} triggers - Array from database: [{class, action, content, ordr}]
   * @param {Object} context - Execution context (should include workflowTriggers for callbacks)
   */
  async executeTriggers(triggers, context = {}) {
    if (!Array.isArray(triggers)) {
      log.warn('executeTriggers: triggers must be an array');
      return;
    }

    // Sort by order
    const sortedTriggers = triggers.sort((a, b) => (a.ordr || 0) - (b.ordr || 0));

    const results = [];
    let overallSuccess = true;
    let lastError = null;

    let lastResult = null;
    for (const trigger of sortedTriggers) {
      try {
        log.debug(`Processing trigger:`, { action: trigger.action, content: trigger.content, params: trigger.params });

        // Determine trigType based on trigger data
        const trigType = this.getTriggerType(trigger);
        const actionName = trigger.action;
        const content = trigger.params !== undefined ? trigger.params : this.parseContent(trigger.content);

        const result = await this.execute(trigType, actionName, content, context);
        results.push({ trigger, result, success: true });
        lastResult = result; // Store for onSuccess callbacks

        // If execEvent returned data, store it in DirectRenderer
        if (result?.componentId && result?.data && context.setData) {
          log.debug(`Storing data for ${result.componentId}:`, result.data);
          context.setData(result.componentId, result.data);
        } else if (result?.componentId && result?.data) {
          log.warn(`Cannot store data - context.setData not available. ComponentId: ${result.componentId}`);
        }

      } catch (error) {
        log.error('Trigger execution failed:', trigger, error);
        results.push({ trigger, error: error.message, success: false });
        overallSuccess = false;
        lastError = error;
      }
    }

    // After executing all primary triggers, check for success/error callbacks
    const { workflowTriggers } = context;
    if (workflowTriggers) {
      try {
        if (overallSuccess && workflowTriggers.onSuccess) {
          log.debug('Executing onSuccess callbacks:', workflowTriggers.onSuccess);
          // Add response to context for template resolution
          // Remove workflowTriggers to prevent infinite recursion
          const successContext = {
            ...context,
            response: lastResult,
            workflowTriggers: undefined
          };
          await this.executeTriggers(workflowTriggers.onSuccess, successContext);
        } else if (!overallSuccess && workflowTriggers.onError) {
          log.debug('Executing onError callbacks:', workflowTriggers.onError);
          const errorContext = {
            ...context,
            error: lastError,
            workflowTriggers: undefined
          };
          await this.executeTriggers(workflowTriggers.onError, errorContext);
        }
      } catch (callbackError) {
        log.error('Callback execution failed:', callbackError);
      }
    }

    return results;
  }

  /**
   * Determine trigger type from trigger data
   */
  getTriggerType(trigger) {
    // If trigger has explicit trigType, use it
    if (trigger.trigType) {
      return trigger.trigType;
    }

    // Default: most triggers are actions
    return 'action';
  }

  /**
   * Parse content from database (handle JSON strings)
   */
  parseContent(content) {
    if (typeof content === 'string') {
      try {
        // Try to parse as JSON
        return JSON.parse(content);
      } catch {
        // Not JSON, return as string
        return content;
      }
    }
    return content;
  }

  /**
   * Resolve template tokens in content
   * Supports: {{getVal:paramName}}, {{pageConfig.prop}}, {{selected.field}}, {{row.field}}
   */
  async resolveTemplates(content, context) {
    log.debug(`resolveTemplates called with type:`, typeof content, content);

    if (!content || typeof content !== 'object') {
      if (typeof content === 'string') {
        log.debug(`Calling resolveString for:`, content);
        return await this.resolveString(content, context);
      }
      return content;
    }

    // Recursively resolve templates in objects and arrays
    if (Array.isArray(content)) {
      log.debug(`Resolving array of length:`, content.length);
      return await Promise.all(content.map(item => this.resolveTemplates(item, context)));
    }

    log.debug(`Resolving object with keys:`, Object.keys(content));
    const resolved = {};
    for (const [key, value] of Object.entries(content)) {
      log.debug(`Resolving key "${key}" with value:`, value);
      const resolvedKey = await this.resolveString(key, context);
      log.debug(`Resolved key "${key}" => "${resolvedKey}"`);
      resolved[resolvedKey] = await this.resolveTemplates(value, context);
    }
    return resolved;
  }

  /**
   * Resolve template tokens in a string
   */
  async resolveString(str, context) {
    log.debug(`resolveString called with:`, str);
    if (!str.includes('{{')) return str;

    let resolved = str;

    // Resolve {{getVal:paramName}} tokens (async, must be sequential)
    const getValMatches = [...str.matchAll(/\{\{getVal:(\w+)\}\}/g)];
    for (const match of getValMatches) {
      const [token, paramName] = match;
      try {
        // Try SessionCache first for session parameters
        let value;
        const sessionValue = sessionCache.getSessionParam(paramName);
        if (sessionValue !== null) {
          value = sessionValue;
          log.debug(`Resolved {{getVal:${paramName}}} from SessionCache =>`, value);
        } else {
          // Fall back to getVal for non-session parameters
          const { getVal } = await import('@whatsfresh/shared-imports');
          const result = await getVal(paramName, 'raw');
          value = result.resolvedValue ?? result ?? '';
          log.debug(`Resolved {{getVal:${paramName}}} from getVal =>`, value);
        }
        resolved = resolved.replace(token, String(value));
      } catch (error) {
        log.warn(`Failed to resolve {{getVal:${paramName}}}:`, error);
        // Leave token as-is if resolution fails
      }
    }

    // Resolve {{pageConfig.X}} tokens (sync)
    resolved = resolved.replace(/\{\{pageConfig\.(\w+)\}\}/g, (match, prop) => {
      const value = context.pageConfig?.[prop];
      return value !== undefined ? String(value) : match;
    });

    // Resolve {{pageConfig.props.X}} tokens (sync)
    resolved = resolved.replace(/\{\{pageConfig\.props\.(\w+)\}\}/g, (match, prop) => {
      const value = context.pageConfig?.props?.[prop];
      console.log(`🔍 Resolved {{pageConfig.props.${prop}}} =>`, value);
      return value !== undefined ? String(value) : match;
    });

    // Resolve {{selected.X}} tokens (sync)
    resolved = resolved.replace(/\{\{selected\.(\w+)\}\}/g, (match, prop) => {
      const value = context.selected?.[prop];
      return value !== undefined ? String(value) : match;
    });

    // Resolve {{row.X}} tokens (sync)
    resolved = resolved.replace(/\{\{row\.(\w+)\}\}/g, (match, prop) => {
      const value = context.row?.[prop] ?? context.rowData?.[prop];
      return value !== undefined ? String(value) : match;
    });

    return resolved;
  }

  /**
   * Execute component lifecycle event
   * @param {string} className - "onLoad", "onRefresh", etc.
   * @param {string} componentName - Name of component
   * @param {Object} context - Execution context
   */
  async executeClass(className, componentName, context = {}) {
    try {
      return await this.execute('class', className, componentName, context);
    } catch (error) {
      console.error(`❌ Class ${className} failed for ${componentName}:`, error);
      throw error;
    }
  }

  /**
   * Execute single action
   * @param {string} actionName - "setVals", "execEvent", etc.
   * @param {any} content - Action content
   * @param {Object} context - Execution context
   */
  async executeAction(actionName, content, context = {}) {
    try {
      return await this.execute('action', actionName, content, context);
    } catch (error) {
      console.error(`❌ Action ${actionName} failed:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const triggerEngine = new TriggerEngine();