/**
 * Workflow Engine - Orchestrates EventType triggers and actions
 * Handles user interactions → workflow triggers → data updates
 * 
 * Location: /apps/wf-plan-management/src/workflows/WorkflowEngine.js
 * Philosophy: Declarative workflows defined in EventTypes
 */

import { useContextStore } from '@whatsfresh/shared-imports';
import { getConfigChoices } from '../config/selectVals';

class WorkflowEngine {
  constructor() {
    this.contextStore = null;
    this.eventTypeRegistry = new Map();
    this.componentRefs = new Map();
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
        const result = await this.executeAction(workflow, data, eventType);
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
   * Execute individual workflow action
   */
  async executeAction(action, data, sourceEventType) {
    console.log(`⚡ Executing action:`, action);

    // Handle string actions (like "CONFIG", "execEvent")
    if (typeof action === 'string') {
      switch (action) {
        case 'CONFIG':
          return await this.handleConfigLoad(sourceEventType);
        case 'execEvent':
          return await this.execEvent(sourceEventType.qry, data);
        default:
          console.warn(`⚠️ Unknown string action: ${action}`);
          return;
      }
    }

    // Handle object actions
    switch (action.action) {
      case 'setParam':
        await this.handleSetParam(action, data);
        break;

      case 'refresh':
        await this.handleRefresh(action, data);
        break;

      case 'setContext':
        await this.handleSetContext(action, data);
        break;

      case 'saveRecord':
        await this.handleSaveRecord(action, data);
        break;

      case 'showNotification':
        await this.handleShowNotification(action, data);
        break;

      default:
        console.warn(`⚠️ Unknown workflow action: ${action.action}`);
    }
  }

  /**
   * Handle CONFIG loading for eventTypes
   */
  async handleConfigLoad(eventType) {
    const { configKey, configOptions } = eventType;
    
    if (!configKey) {
      throw new Error(`CONFIG eventType '${eventType.eventType}' missing configKey`);
    }
    
    console.log(`[WorkflowEngine] Loading config choices for key: ${configKey}`);
    const choices = getConfigChoices(configKey, configOptions || {});
    console.log('📊 CONFIG result for', configKey, ':', choices);
    return { data: choices };
  }

  /**
   * Handle setParam action
   * Sets parameters in contextStore
   */
  async handleSetParam(action, data) {
    if (!this.contextStore) {
      throw new Error('ContextStore not initialized');
    }

    // Extract param name and value
    const [paramName, valueKey] = action.params || [];
    if (!paramName || !valueKey) {
      throw new Error('setParam requires params: [paramName, valueKey]');
    }

    // Get value from data
    const value = data[valueKey];
    if (value === undefined) {
      console.warn(`⚠️ Value for '${valueKey}' not found in data:`, data);
      return;
    }

    // Set parameter
    this.contextStore.setParameter(paramName, value);
    console.log(`📌 Set parameter ${paramName} = ${value}`);
  }

  /**
   * Handle refresh action
   * Refreshes target components by calling their qry
   */
  async handleRefresh(action, data) {
    const targets = action.targets || [];
    
    for (const targetName of targets) {
      const eventType = this.eventTypeRegistry.get(targetName);
      if (!eventType) {
        console.warn(`⚠️ Target eventType '${targetName}' not found in registry`);
        continue;
      }

      if (!eventType.qry) {
        console.warn(`⚠️ Target eventType '${targetName}' has no qry to refresh`);
        continue;
      }

      try {
        // Call execEvent to get fresh data
        const newData = await this.execEvent(eventType.qry);
        
        // Update component if we have a reference
        const componentRef = this.componentRefs.get(targetName);
        if (componentRef && componentRef.updateData) {
          componentRef.updateData(newData);
          console.log(`🔄 Refreshed ${targetName} with new data`);
        } else {
          console.warn(`⚠️ No component reference for '${targetName}' to update`);
        }
      } catch (error) {
        console.error(`❌ Failed to refresh ${targetName}:`, error);
      }
    }
  }

  /**
   * Handle saveRecord action
   * Executes save operation via execEvent
   */
  async handleSaveRecord(action, data) {
    if (!action.qry) {
      throw new Error('saveRecord requires qry parameter');
    }

    try {
      const result = await this.execEvent(action.qry, data);
      console.log(`💾 Saved record via ${action.qry}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Save failed for ${action.qry}:`, error);
      throw error;
    }
  }

  /**
   * Handle setContext action
   * Sets parameter in contextStore and optionally refreshes components
   */
  async handleSetContext(action, data) {
    if (!this.contextStore) {
      console.error('❌ ContextStore not available for setContext');
      return;
    }

    const param = action.param;
    const value = data.value || data;
    
    if (!param) {
      console.error('❌ setContext requires param field');
      return;
    }

    console.log(`🔄 Setting context: ${param} = ${value}`);
    this.contextStore.setVal(param, value);
  }

  /**
   * Enhanced handleRefresh - supports multiple targets and single target
   */
  async handleRefresh(action, data) {
    const targets = action.targets || [action.target];
    
    if (!targets || targets.length === 0) {
      console.error('❌ refresh action requires targets or target');
      return;
    }

    console.log(`🔄 Refreshing components:`, targets);

    // Refresh each target
    for (const targetName of targets) {
      const eventType = this.eventTypeRegistry.get(targetName);
      if (eventType && eventType.workflowTriggers?.onRefresh) {
        console.log(`🔄 Triggering onRefresh for ${targetName}`);
        await this.executeTrigger(eventType, 'onRefresh', data);
      } else {
        console.warn(`⚠️ EventType ${targetName} not found or has no onRefresh trigger`);
      }
    }
  }

  /**
   * Handle showNotification action
   * Shows user feedback message
   */
  async handleShowNotification(action, data) {
    const message = action.message || 'Operation completed';
    const type = action.type || 'success';
    
    // For now, use simple alert - can be enhanced with proper notification system
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
    
    console.log(`📢 Notification: ${message} (${type})`);
  }

  /**
   * Wrapper for execEvent - handles CONFIG lookups client-side, database queries server-side
   */
  async execEvent(eventName, data = {}) {
    // Check if this is a registered eventType with CONFIG method
    const registeredEventType = this.eventTypeRegistry.get(eventName);
    
    if (registeredEventType && registeredEventType.method === 'CONFIG') {
      // Handle CONFIG lookups client-side
      const { configKey, configOptions } = registeredEventType;
      
      if (!configKey) {
        throw new Error(`CONFIG eventType '${eventName}' missing configKey`);
      }
      
      console.log(`[WorkflowEngine] Loading config choices for key: ${configKey}`);
      const choices = getConfigChoices(configKey, configOptions || {});
      return { data: choices };
      
    } else {
      // Handle database queries server-side
      const { execEvent } = await import('@whatsfresh/shared-imports');
      return await execEvent(eventName, data);
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