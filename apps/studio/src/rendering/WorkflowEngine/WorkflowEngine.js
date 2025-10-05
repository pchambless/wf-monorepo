/**
 * WorkflowEngine - Modern Database-Driven Workflow Orchestration
 * Coordinates between UI events, database triggers, and component lifecycle
 */

import { triggerEngine } from './TriggerEngine.js';

export class WorkflowEngine {
  constructor() {
    this.contextStore = null;
    this.componentRefs = new Map();
    this.initialized = false;
  }

  /**
   * Initialize with context store
   */
  initialize(contextStore) {
    this.contextStore = contextStore;
    triggerEngine.initialize(contextStore);
    this.initialized = true;
    console.log('🚀 WorkflowEngine initialized');
  }

  /**
   * Execute database triggers for React event (onChange, onClick, etc.)
   * @param {Array} workflowTriggers - Triggers from pageConfig: [{action, content, ordr}]
   * @param {string} eventClass - "onChange", "onClick", "onSubmit", etc.
   * @param {Object} eventData - Data from React event
   */
  async executeWorkflowTriggers(workflowTriggers, eventClass, eventData = {}) {
    if (!this.initialized) {
      console.error('❌ WorkflowEngine not initialized');
      return;
    }

    if (!workflowTriggers || !workflowTriggers[eventClass]) {
      console.log(`ℹ️ No ${eventClass} triggers found`);
      return;
    }

    const triggers = workflowTriggers[eventClass];
    console.log(`🔄 Executing ${eventClass} triggers:`, triggers);

    // Convert pageConfig format to database format
    const dbTriggers = triggers.map((trigger, index) => ({
      class: eventClass,
      action: trigger.action,
      content: trigger.content,
      ordr: trigger.ordr || index
    }));

    const context = {
      eventClass,
      eventData,
      this: eventData // For {{this.value}} templates
    };

    return await triggerEngine.executeTriggers(dbTriggers, context);
  }

  /**
   * Execute database triggers from API (DirectRenderer gets triggers from DB)
   * @param {Array} databaseTriggers - Raw from database: [{class, action, content, ordr}]
   * @param {Object} context - Execution context
   */
  async executeDatabaseTriggers(databaseTriggers, context = {}) {
    if (!this.initialized) {
      console.error('❌ WorkflowEngine not initialized');
      return;
    }

    return await triggerEngine.executeTriggers(databaseTriggers, context);
  }

  /**
   * Execute component lifecycle event
   * @param {string} componentName - Name of component
   * @param {string} className - "onLoad", "onRefresh", etc.
   * @param {Object} context - Execution context
   */
  async executeLifecycle(componentName, className, context = {}) {
    if (!this.initialized) {
      console.error('❌ WorkflowEngine not initialized');
      return;
    }

    console.log(`🔄 ${className} lifecycle for ${componentName}`);

    const fullContext = {
      ...context,
      componentName,
      workflowEngine: this
    };

    return await triggerEngine.executeClass(className, componentName, fullContext);
  }

  /**
   * Register component for refresh/visibility operations
   */
  registerComponent(name, componentRef) {
    this.componentRefs.set(name, componentRef);
    console.log(`📝 Registered component: ${name}`);
  }

  /**
   * Handle refresh signals from context
   * This would be called by components watching for refresh signals
   */
  async handleRefreshSignal(componentName) {
    const refreshKey = `${componentName}_refresh_signal`;
    const signal = this.contextStore?.getVal(refreshKey);

    if (signal) {
      console.log(`🔄 Refresh signal detected for ${componentName}`);

      // Clear the signal
      this.contextStore.clearVals(refreshKey);

      // Execute onRefresh lifecycle
      return await this.executeLifecycle(componentName, 'onRefresh');
    }
  }

  /**
   * Handle visibility signals from context
   * This would be called by components watching for visibility changes
   */
  handleVisibilitySignal(componentName) {
    const visibilityKey = `${componentName}_visible`;
    const visible = this.contextStore?.getVal(visibilityKey);

    console.log(`👁️ Visibility signal for ${componentName}: ${visible}`);
    return visible !== false; // Default to visible
  }

  /**
   * Execute single action directly
   */
  async executeAction(actionName, content, context = {}) {
    if (!this.initialized) {
      console.error('❌ WorkflowEngine not initialized');
      return;
    }

    return await triggerEngine.executeAction(actionName, content, context);
  }

  /**
   * Get context store value
   */
  getContext(key) {
    return this.contextStore?.getVal(key);
  }

  /**
   * Set context store value
   */
  setContext(key, value) {
    return this.contextStore?.setVal(key, value);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();