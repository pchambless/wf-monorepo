/**
 * Workflow Engine - Orchestrates EventType triggers and actions
 * Handles user interactions → workflow triggers → data updates
 * 
 * Location: /apps/wf-studio/src/rendering/WorkflowEngine/index.js
 * Philosophy: Declarative workflows defined in EventTypes
 */

import { useContextStore } from '@whatsfresh/shared-imports';

// Import all workflow methods
import { execApps } from './triggers/data/execApps.js';
import { execPages } from './triggers/data/execPages.js';
import { execEventTypes } from './triggers/data/execEventTypes.js';
import { execEvent } from './triggers/data/execEvent.js';
import { refresh } from './triggers/atomic/onRefresh.js';
import { clearVals } from './triggers/atomic/clearVals.js';
import { setVal } from './triggers/atomic/setVal.js';
import { getVal } from './triggers/atomic/getVal.js';
import { saveRecord } from './saveRecord.js';
import { loadCards } from './triggers/data/loadCards.js';
import { getTemplate } from './triggers/data/getTemplate.js';
import { showNotification } from './showNotification.js';
import { onLoad } from './triggers/atomic/onLoad.js';
import { execTemplates } from './triggers/data/execTemplates.js';
import { execGenPageConfig } from './triggers/data/execGenPageConfig.js';

class WorkflowEngine {
  constructor() {
    this.contextStore = null;
    this.eventTypeRegistry = new Map();
    this.componentRefs = new Map();

    // Attach all workflow methods to this instance
    this.execApps = execApps.bind(this);
    this.execPages = execPages.bind(this);
    this.execEventTypes = execEventTypes.bind(this);
    this.execEvent = execEvent.bind(this);
    this.refresh = refresh.bind(this);
    this.clearVals = clearVals.bind(this);
    this.setVal = setVal.bind(this);
    this.getVal = getVal.bind(this);
    this.saveRecord = saveRecord.bind(this);
    this.loadCards = loadCards.bind(this);
    this.getTemplate = getTemplate.bind(this);
    this.showNotification = showNotification.bind(this);
    this.onLoad = onLoad.bind(this);
    this.execTemplates = execTemplates.bind(this);
    this.execGenPageConfig = execGenPageConfig.bind(this);
  }

  /**
   * Initialize with context store and component references
   */
  initialize(contextStore) {
    this.contextStore = contextStore;
  }

  /**
   * Register eventTypes for workflow resolution
   */
  registerEventTypes(eventTypes) {
    eventTypes.forEach(eventType => {
      this.eventTypeRegistry.set(eventType.eventType || eventType.name, eventType);
    });
  }

  /**
   * Register component references for refresh actions
   */
  registerComponent(name, componentRef) {
    this.componentRefs.set(name, componentRef);
  }

  /**
   * Execute a trigger's workflow actions
   * @param {Object} eventType - EventType with workflowTriggers
   * @param {string} triggerName - onSelect, onUpdate, onCreate, etc.
   * @param {Object} data - Row data, form data, etc.
   */
  async executeTrigger(eventType, triggerName, data = {}) {
    const workflows = eventType.workflowTriggers?.[triggerName];
    if (!workflows || !Array.isArray(workflows)) {
      return;
    }

    console.log(`🔄 Executing ${triggerName} trigger for ${eventType.eventType}`, workflows);

    let lastResult = null;

    // Execute workflows in sequence
    for (const workflow of workflows) {
      try {
        const result = await this.execAction(workflow, data, eventType);
        if (result !== undefined) {
          lastResult = result;
        }
      } catch (error) {
        console.error(`❌ Workflow action failed:`, workflow, error);
      }
    }

    return lastResult;
  }

  /**
   * Execute individual workflow action - Dynamic method invocation
   */
  async execAction(action, data, sourceEventType) {
    // Handle new action-target pattern: execAction(actionString, targetsArray, context)
    if (typeof action === 'string' && Array.isArray(data)) {
      return await this.execTargetAction(action, data, sourceEventType);
    }

    console.log(`⚡ Executing action:`, action);

    // Handle string actions (like "execEvent", "execApps", "execPages")
    if (typeof action === 'string') {
      const method = this[action];
      if (typeof method === 'function') {
        // For string actions, pass sourceEventType for context (like execEvent needing qry)
        return await method.call(this, sourceEventType?.qry || action, data);
      } else {
        console.warn(`⚠️ Unknown string action: ${action}`);
        return;
      }
    }

    // Handle object actions dynamically
    const methodName = action.action;
    const method = this[methodName];

    if (typeof method === 'function') {
      return await method.call(this, action, data);
    } else {
      console.warn(`⚠️ Unknown workflow action: ${methodName}`);
    }
  }

  /**
   * Execute action on target array - renamed from executeActionOnTargets
   */
  async execTargetAction(action, targets, context) {
    // Use dynamic method invocation - no switching needed
    const method = this[action];
    if (typeof method === 'function') {
      return await method.call(this, { targets }, { ...context, contextStore: context.contextStore });
    } else {
      console.warn(`⚠️ Unknown action method: ${action}`);
    }
  }

  /**
   * Convenience method for common trigger patterns
   */
  async handleRowClick(eventType, rowData) {
    await this.executeTrigger(eventType, 'onSelect', rowData);
  }

  async handleFormSubmit(eventType, formData) {
    await this.executeTrigger(eventType, 'onUpdate', formData);
  }

  async handleCreate(eventType, formData) {
    await this.executeTrigger(eventType, 'onCreate', formData);
  }

  async handleDelete(eventType, recordData) {
    await this.executeTrigger(eventType, 'onDelete', recordData);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();
export default WorkflowEngine;