/**
 * TriggerEngine - Database-Driven Trigger Execution
 * Simple, clean architecture for executing database-defined triggers
 */

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
   * Execute trigger by action name
   * @param {string} trigType - "action" or "class"
   * @param {string} actionName - Name of the trigger (setVals, execEvent, etc.)
   * @param {any} content - Content from database trigger
   * @param {Object} context - Execution context
   */
  async execute(trigType, actionName, content, context = {}) {
    try {
      console.log(`🎯 Executing ${trigType}/${actionName}:`, content);

      // Add contextStore to context
      const fullContext = { ...context, contextStore: this.contextStore };

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

      // Execute with standard signature: (content, context)
      const result = await triggerFunction(content, fullContext);

      console.log(`✅ ${trigType}/${actionName} completed`);
      return result;

    } catch (error) {
      console.error(`❌ ${trigType}/${actionName} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute database triggers for a component
   * @param {Array} triggers - Array from database: [{class, action, content, ordr}]
   * @param {Object} context - Execution context
   */
  async executeTriggers(triggers, context = {}) {
    if (!Array.isArray(triggers)) {
      console.warn('⚠️ executeTriggers: triggers must be an array');
      return;
    }

    // Sort by order
    const sortedTriggers = triggers.sort((a, b) => (a.ordr || 0) - (b.ordr || 0));

    const results = [];

    for (const trigger of sortedTriggers) {
      try {
        // Determine trigType based on trigger data
        const trigType = this.getTriggerType(trigger);
        const actionName = trigger.action;
        const content = this.parseContent(trigger.content);

        const result = await this.execute(trigType, actionName, content, context);
        results.push({ trigger, result });

      } catch (error) {
        console.error('❌ Trigger execution failed:', trigger, error);
        results.push({ trigger, error: error.message });
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