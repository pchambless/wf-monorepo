/**
 * Workflow Engine - Orchestrates EventType triggers and actions
 * Handles user interactions → workflow triggers → data updates
 * 
 * Location: /apps/wf-studio/src/rendering/WorkflowEngine/index.js
 * Philosophy: Declarative workflows defined in EventTypes
 */


// class Triggers
import { onLoad } from './triggers/class/onLoad.js';
import { onRefresh } from './triggers/class/onRefresh.js';
// studio - all replaced with studioApiCall except getMermaidContent
// import { execApps, execPages, execEventTypes, execTemplates, execGenPageConfig } from './triggers/data/studio/'; // Obsolete - using studioApiCall

// action Triggers
import { execEvent } from './triggers/action/execEvent.js';
import { getMermaidContent } from './triggers/action/getMermaidContent.js';
import { refresh } from './triggers/action/refresh.js';
import { clearVals } from './triggers/action/clearVals.js';
import { setVals } from './triggers/action/setVals.js';
import { getVal } from './triggers/action/getVal.js';
import { showNotification } from './triggers/action/showNotification.js';

import { ExecFunction } from './execFunction.js';


class WorkflowEngine {
  constructor() {
    this.contextStore = null;
    this.eventTypeRegistry = new Map();
    this.componentRefs = new Map();

    // Attach all workflow methods to this instance
    // database
    this.execEvent = execEvent.bind(this);
    // studio
    this.getMermaidContent = getMermaidContent.bind(this);
    // ui
    this.selectEventTypeTab = selectEventTypeTab.bind(this);
    // atomic
    this.refresh = refresh.bind(this);
    this.clearVals = clearVals.bind(this);
    this.setVal = setVal.bind(this);
    this.getVal = getVal.bind(this);
    this.saveRecord = saveRecord.bind(this);
    this.showNotification = showNotification.bind(this);
    this.onLoad = onLoad.bind(this);
    this.studioApiCall = this.StudioApiCall.bind(this);

    // Initialize function executor
    this.execFunction = new ExecFunction(this);
  }

  /**
   * Generic Studio API Call method
   * Uses shared-imports API (DB-based strategy)
   */
  async StudioApiCall(action, data) {
    try {
      const { execEvent } = await import('@whatsfresh/shared-imports');

      const params = action.params;
      const endpoint = action.endpoint;

      if (!endpoint) {
        throw new Error('Missing endpoint in studioApiCall action');
      }

      console.log(`🔄 studioApiCall: ${endpoint}`, { params });

      // Map old file-based endpoints to new eventType calls
      return await execEvent(endpoint, params);
    } catch (error) {
      console.error(`❌ studioApiCall failed for ${action.endpoint}:`, error);
      return { error: error.message };
    }
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

    // Handle direct function call format: { action: "setVal('appID', {{this.selected.value}})" }
    console.log(`🔍 Checking if function call:`, ExecFunction.isFunctionCall(action));
    if (ExecFunction.isFunctionCall(action)) {
      console.log(`🎯 Detected function call, executing via execFunction`);
      return await this.execFunction.execute(action, data, sourceEventType);
    }

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
      // Process params if it's an array of getVal calls
      let processedAction = { ...action };

      if (Array.isArray(action.params)) {
        processedAction.params = await this.resolveParams(action.params);
        console.log(`🔧 Resolved params for ${methodName}:`, processedAction.params);
      }

      return await method.call(this, processedAction, data);
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
   * Resolve parameters - handle both array of getVal calls and object templates
   * @param {Array|Object} params - Array like ["getVal('appID')"] or object with templates
   * @returns {Object} - Object with resolved parameters like {":appID": "studio"}
   */
  async resolveParams(params) {
    // Handle array of getVal calls: ["getVal('appID')", "getVal('pageID')"]
    if (Array.isArray(params)) {
      const tuples = [];

      for (const paramCall of params) {
        if (typeof paramCall === 'string' && paramCall.startsWith("getVal('") && paramCall.endsWith("')")) {
          // Extract parameter name: "getVal('appID')" → "appID"
          const paramName = paramCall.slice(8, -2); // Remove "getVal('" and "')"

          console.log(`🔧 Resolving getVal('${paramName}')`);

          // Get tuple from contextStore: "appID" → [":appID", "studio"]
          const tuple = this.contextStore?.getVal(paramName);

          console.log(`📦 getVal('${paramName}') returned:`, tuple);

          if (tuple && Array.isArray(tuple) && tuple.length === 2) {
            tuples.push(tuple);
          } else {
            console.warn(`⚠️ resolveParams: No value found for ${paramName}, got:`, tuple);
          }
        }
      }

      // Convert array of tuples to object: [[":appID", "studio"]] → {":appID": "studio"}
      return Object.fromEntries(tuples);
    }

    // Handle object with template strings (legacy support)
    if (typeof params === 'object' && params !== null) {
      const resolved = {};

      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string' && value.startsWith('{{getVal.') && value.endsWith('}}')) {
          // Extract parameter name: "{{getVal.appID}}" → "appID"
          const paramName = value.slice(9, -2);

          const tuple = this.contextStore?.getVal(paramName);

          if (tuple && Array.isArray(tuple) && tuple.length === 2) {
            const [queryKey, queryValue] = tuple;
            resolved[queryKey] = queryValue;
          } else {
            console.warn(`⚠️ resolveParams: No value found for ${paramName}`);
          }
        } else {
          // Non-template values pass through unchanged
          resolved[key] = value;
        }
      }

      return resolved;
    }

    return params;
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

// Export singleton instance with lazy initialization to avoid circular dependency issues
let _workflowEngine = null;
export const workflowEngine = new Proxy({}, {
  get(target, prop) {
    if (!_workflowEngine) {
      _workflowEngine = new WorkflowEngine();
    }
    return _workflowEngine[prop];
  },
  set(target, prop, value) {
    if (!_workflowEngine) {
      _workflowEngine = new WorkflowEngine();
    }
    _workflowEngine[prop] = value;
    return true;
  }
});

export default WorkflowEngine;