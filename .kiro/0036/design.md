# Design Document

## Overview

This design document outlines the technical architecture for creating a new dedicated Plan Management page that leverages a revolutionary eventType-to-workflow integration pattern. The solution combines a clean, purpose-built user interface with a declarative, event-driven backend architecture that eliminates hardcoded business logic from components.

The design incorporates Claude's modular eventType-workflow orchestration system, creating a seamless bridge between UI interactions, data operations, and workflow execution. This approach ensures maintainable, extensible, and consistent plan management functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Plan Management Page                         │
├─────────────────────────────────────────────────────────────────┤
│  📁 plan-management/                                            │
│  ├── index.jsx              # Main page component              │
│  ├── workflowMap.js         # Page orchestration + triggers    │
│  └── 📁 tabMaps/                                               │
│      ├── plan-detail.js     # Plan detail configurations       │
│      ├── communications.js  # Communications configurations     │
│      └── impacts.js         # Impacts configurations           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Two-Level Trigger System                        │
├─────────────────────────────────────────────────────────────────┤
│  WorkflowMap Triggers (Page Level):                            │
│  • onPageLoad    • onPlanSelect    • onPageExit               │
│                                                                 │
│  EventType Triggers (Component Level):                         │
│  • onSelect      • onUpdate        • onCreate                 │
│  • onDelete      • onLoad          • onError (optional)       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Architecture Layers                          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: WorkflowMap     │ Page blueprint + orchestration     │
│  Layer 2: EventTypes      │ Data operations + workflows        │
│  Layer 3: TabMaps         │ Component specifications           │
│  Layer 4: Workflow Engine │ Execution + context management     │
└─────────────────────────────────────────────────────────────────┘
```

### Refined Architecture Layers

#### Layer 1: WorkflowMap (Page Orchestration)

```javascript
// plan-management/workflowMap.js
export const planManagementWorkflowMap = {
  pageId: "plan-management",
  layout: "master-detail",

  // Page-level workflow triggers
  workflowTriggers: {
    onPageLoad: ["initializePlanManagement", "loadUserPermissions"],
    onPlanSelect: ["refreshPlanContext", "validatePlanAccess"],
    onPageExit: ["savePlanState", "cleanupResources"],
  },

  // Page structure definition
  structure: {
    header: {
      component: "SelStatusWidget",
      eventType: "SelPlanStatus",
    },
    master: {
      component: "PlanList",
      eventType: "planList",
    },
    detail: {
      component: "PlanDetailTabs",
      tabs: ["plan-detail", "communications", "impacts"],
    },
  },
};
```

#### Layer 2: EventTypes (Data + Component Workflows)

```javascript
// Standard EventType with refined triggers
{
  eventID: 101,
  eventType: "planList",
  category: "grid:Plans",
  workflows: ["updatePlan", "createPlan"],

  // Standard 3-trigger pattern
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onUpdate: ["updateRecord", "trackImpact"],
    onCreate: ["createRecord", "trackImpact"]
  },

  // Existing data structure preserved
  qrySQL: "SELECT id, name FROM api_wf.plans WHERE status = :status",
  params: [":Status"],
  navChildren: ["planDetailTab", "planCommunicationTab", "planImpactTab"]
}
```

#### Layer 3: TabMaps (Component Specifications)

```javascript
// plan-management/tabMaps/plan-detail.js
export const planDetailTabMap = {
  tabId: "plan-detail",
  eventType: "planDetailList",

  tableConfig: {
    columns: ["id", "name", "status", "description"],
    editable: ["name", "status", "description"],
    primaryKey: "id",
  },

  formConfig: {
    fields: [
      { name: "name", type: "text", required: true },
      { name: "status", type: "select", source: "planStatus" },
      { name: "description", type: "textarea", rows: 4 },
    ],
  },

  dmlConfig: {
    table: "api_wf.plans",
    updateWorkflow: "updatePlan",
    validationRules: ["nameRequired", "statusValid"],
  },
};
```

## Components and Interfaces

### 1. Plan Management Page Structure

**Folder Structure**: `apps/wf-client/src/pages/plan-management/`

```
📁 plan-management/
├── index.jsx              # Main page component
├── workflowMap.js         # Page orchestration + triggers
└── 📁 tabMaps/
    ├── plan-detail.js     # Plan detail configurations
    ├── communications.js  # Communications configurations
    └── impacts.js         # Impacts configurations
```

### 2. Main Page Component

**Location**: `apps/wf-client/src/pages/plan-management/index.jsx`

```javascript
import React, { useState, useEffect } from "react";
import { eventTypeWorkflowExecutor } from "@whatsfresh/shared-imports/workflows/eventType";
import { SelStatusWidget } from "../components/SelStatusWidget";
import { PlanList } from "../components/PlanList";
import { PlanDetailTabs } from "../components/PlanDetailTabs";

export const PlanManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Declarative workflow execution on page load
    eventTypeWorkflowExecutor.executeWorkflows("planList", "onLoad", {
      userId: "current-user",
    });
  }, []);

  const handlePlanSelect = async (planId) => {
    // Declarative workflow execution on plan selection
    await eventTypeWorkflowExecutor.executeWorkflows("planList", "onSelect", {
      planId,
      userId: "current-user",
    });
    setSelectedPlan(planId);
  };

  const handleStatusFilter = async (status) => {
    await eventTypeWorkflowExecutor.executeWorkflows(
      "selPlanStatus",
      "onFilter",
      {
        status,
        userId: "current-user",
      }
    );
    setStatusFilter(status);
  };

  return (
    <div className="plan-management-page">
      <div className="plan-management-header">
        <h1>Plan Management</h1>
        <SelStatusWidget
          onStatusFilter={handleStatusFilter}
          activeFilter={statusFilter}
        />
      </div>

      <div className="plan-management-content">
        <div className="plan-list-section">
          <PlanList
            plans={plans}
            selectedPlan={selectedPlan}
            statusFilter={statusFilter}
            onPlanSelect={handlePlanSelect}
          />
        </div>

        <div className="plan-detail-section">
          {selectedPlan ? (
            <PlanDetailTabs planId={selectedPlan} />
          ) : (
            <div className="no-plan-selected">
              Select a plan to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 3. WorkflowMap Component

**Location**: `apps/wf-client/src/pages/plan-management/workflowMap.js`

```javascript
/**
 * Plan Management Workflow Map
 * Defines page structure and orchestration workflows
 */
import { eventTypeWorkflowExecutor } from "@whatsfresh/shared-imports/workflows/eventType";

export const planManagementWorkflowMap = {
  pageId: "plan-management",
  title: "Plan Management",
  layout: "master-detail",

  // Page-level workflow triggers
  workflowTriggers: {
    onPageLoad: ["initializePlanManagement", "loadUserPermissions"],
    onPlanSelect: ["refreshPlanContext", "validatePlanAccess"],
    onPageExit: ["savePlanState", "cleanupResources"],
  },

  // Page structure definition
  structure: {
    header: {
      component: "SelStatusWidget",
      eventType: "SelPlanStatus",
      props: {
        configSource: "planStatus",
        filterTarget: "planList",
      },
    },
    master: {
      component: "PlanList",
      eventType: "planList",
      props: {
        displayFormat: "NNNN-name",
        selectable: true,
      },
    },
    detail: {
      component: "PlanDetailTabs",
      tabs: [
        { id: "plan-detail", tabMap: "plan-detail" },
        { id: "communications", tabMap: "communications" },
        { id: "impacts", tabMap: "impacts" },
      ],
    },
  },

  // Page orchestration methods
  async executePageWorkflow(trigger, context = {}) {
    const workflows = this.workflowTriggers[trigger] || [];

    if (workflows.length > 0) {
      return await eventTypeWorkflowExecutor.executeWorkflows(
        "planManagement",
        trigger,
        context
      );
    }

    return { success: true, message: "No workflows for trigger" };
  },

  // Get tab configuration
  getTabMap(tabId) {
    const tabMaps = {
      "plan-detail": () => import("./tabMaps/plan-detail.js"),
      communications: () => import("./tabMaps/communications.js"),
      impacts: () => import("./tabMaps/impacts.js"),
    };

    return tabMaps[tabId]?.();
  },
};
```

### 4. TabMap Components

#### Plan Detail TabMap

**Location**: `apps/wf-client/src/pages/plan-management/tabMaps/plan-detail.js`

```javascript
export const planDetailTabMap = {
  tabId: "plan-detail",
  title: "Plan Detail",
  eventType: "planDetailList",

  tableConfig: {
    columns: [
      { key: "id", label: "ID", width: "80px", readonly: true },
      { key: "name", label: "Plan Name", width: "300px", editable: true },
      {
        key: "status",
        label: "Status",
        width: "120px",
        editable: true,
        type: "select",
      },
      {
        key: "description",
        label: "Description",
        width: "400px",
        editable: true,
        type: "textarea",
      },
    ],
    primaryKey: "id",
    editable: true,
  },

  formConfig: {
    fields: [
      { name: "name", type: "text", required: true },
      { name: "status", type: "select", source: "planStatus", required: true },
      { name: "description", type: "textarea", rows: 4, required: true },
    ],
  },

  dmlConfig: {
    table: "api_wf.plans",
    updateWorkflow: "updatePlan",
    validationRules: ["nameRequired", "statusValid"],
  },

  workflowTriggers: {
    onLoad: ["loadPlanDetail"],
    onUpdate: ["updatePlan", "trackImpact"],
  },
};
```

### 5. EventType Integration Modules

#### EventTypeParser.js

**Location**: `packages/shared-imports/src/architecture/workflows/eventType/EventTypeParser.js`

```javascript
/**
 * EventType Parser
 * Parses and validates eventType workflow configurations
 */
export class EventTypeParser {
  /**
   * Parse workflow configuration from eventType definition
   * @param {Object} eventDefinition - EventType definition with workflows
   * @returns {Object} Parsed workflow configuration
   */
  static parseWorkflowConfig(eventDefinition) {
    const {
      workflows = [],
      workflowTriggers = {},
      workflowConfig = {},
    } = eventDefinition;

    return {
      workflows,
      triggers: workflowTriggers,
      config: {
        errorHandling: workflowConfig.errorHandling || "fail-fast",
        retryPolicy: workflowConfig.retryPolicy || "standard",
        timeout: workflowConfig.timeout || 30000,
        contextRefresh: workflowConfig.contextRefresh || [],
      },
    };
  }

  /**
   * Validate workflow references exist in registry
   * @param {Object} eventDefinition - EventType definition
   * @returns {Object} Validation result
   */
  static validateWorkflowReferences(eventDefinition) {
    const { workflowRegistry } = require("../WorkflowRegistry.js");
    const { workflows = [] } = eventDefinition;

    const errors = [];
    const warnings = [];

    workflows.forEach((workflowName) => {
      if (!workflowRegistry.getWorkflow(workflowName)) {
        errors.push(`Workflow '${workflowName}' not found in registry`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get workflows for specific trigger
   * @param {string} eventType - EventType name
   * @param {string} trigger - Trigger name (onLoad, onSelect, etc.)
   * @returns {Array} Workflow names for trigger
   */
  static getTriggersForEvent(eventType, trigger) {
    const eventDefinition = this.getEventDefinition(eventType);
    return eventDefinition?.workflowTriggers?.[trigger] || [];
  }

  /**
   * Get event definition from eventTypes configuration
   * @param {string} eventType - EventType name
   * @returns {Object} Event definition
   */
  static getEventDefinition(eventType) {
    // This will integrate with your existing eventTypes.js
    const { eventTypes } = require("../../../events/plans/eventTypes.js");
    return eventTypes.find((event) => event.eventType === eventType);
  }
}
```

#### WorkflowTriggerMap.js

**Location**: `packages/shared-imports/src/architecture/workflows/eventType/WorkflowTriggerMap.js`

```javascript
/**
 * Workflow Trigger Map
 * Maps UI events to workflow executions
 */
export class WorkflowTriggerMap {
  /**
   * Map trigger to workflows for execution
   * @param {string} eventType - EventType name
   * @param {string} trigger - Trigger name
   * @returns {Array} Workflows to execute
   */
  static mapTriggerToWorkflows(eventType, trigger) {
    const { EventTypeParser } = require("./EventTypeParser.js");
    return EventTypeParser.getTriggersForEvent(eventType, trigger);
  }

  /**
   * Validate trigger configuration
   * @param {Object} triggers - Trigger configuration
   * @returns {Object} Validation result
   */
  static validateTriggerConfiguration(triggers) {
    const validTriggers = [
      "onLoad",
      "onSelect",
      "onUpdate",
      "onError",
      "onCreate",
      "onDelete",
    ];
    const errors = [];

    Object.keys(triggers).forEach((trigger) => {
      if (!validTriggers.includes(trigger)) {
        errors.push(
          `Invalid trigger '${trigger}'. Valid triggers: ${validTriggers.join(
            ", "
          )}`
        );
      }

      if (!Array.isArray(triggers[trigger])) {
        errors.push(`Trigger '${trigger}' must be an array of workflow names`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Resolve trigger context with event data
   * @param {string} trigger - Trigger name
   * @param {Object} eventContext - Event context data
   * @returns {Object} Resolved context for workflow execution
   */
  static resolveTriggerContext(trigger, eventContext) {
    return {
      trigger,
      timestamp: new Date().toISOString(),
      ...eventContext,
      // Add trigger-specific context resolution
      metadata: {
        triggerType: trigger,
        source: "eventType-integration",
        ...eventContext.metadata,
      },
    };
  }
}
```

#### ExecutionOrchestrator.js

**Location**: `packages/shared-imports/src/architecture/workflows/eventType/ExecutionOrchestrator.js`

```javascript
/**
 * Execution Orchestrator
 * Handles parallel/sequential workflow execution
 */
export class ExecutionOrchestrator {
  /**
   * Execute workflows sequentially
   * @param {Array} workflows - Workflow names to execute
   * @param {Object} context - Execution context
   * @param {Object} config - Execution configuration
   * @returns {Promise<Object>} Execution results
   */
  async executeSequential(workflows, context, config) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");
    const results = [];

    for (const workflowName of workflows) {
      try {
        const result = await workflowRegistry.execute(workflowName, context, {
          timeout: config.timeout,
          retryPolicy: config.retryPolicy,
        });

        results.push({
          workflow: workflowName,
          success: true,
          result,
        });

        // Merge results into context for next workflow
        context = { ...context, ...result.data };
      } catch (error) {
        const errorResult = {
          workflow: workflowName,
          success: false,
          error: error.message,
        };

        results.push(errorResult);

        if (config.errorHandling === "fail-fast") {
          throw new Error(
            `Sequential execution failed at workflow '${workflowName}': ${error.message}`
          );
        }
      }
    }

    return {
      success: results.every((r) => r.success),
      results,
      executionType: "sequential",
    };
  }

  /**
   * Execute workflows in parallel
   * @param {Array} workflows - Workflow names to execute
   * @param {Object} context - Execution context
   * @param {Object} config - Execution configuration
   * @returns {Promise<Object>} Execution results
   */
  async executeParallel(workflows, context, config) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");

    const workflowPromises = workflows.map(async (workflowName) => {
      try {
        const result = await workflowRegistry.execute(workflowName, context, {
          timeout: config.timeout,
          retryPolicy: config.retryPolicy,
        });

        return {
          workflow: workflowName,
          success: true,
          result,
        };
      } catch (error) {
        return {
          workflow: workflowName,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.allSettled(workflowPromises);
    const processedResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : {
            workflow: "unknown",
            success: false,
            error: r.reason?.message || "Unknown error",
          }
    );

    return {
      success: processedResults.every((r) => r.success),
      results: processedResults,
      executionType: "parallel",
    };
  }

  /**
   * Execute workflows with conditional logic
   * @param {Array} workflows - Workflow configurations with conditions
   * @param {Object} context - Execution context
   * @param {Object} config - Execution configuration
   * @returns {Promise<Object>} Execution results
   */
  async executeConditional(workflows, context, config) {
    const results = [];

    for (const workflowConfig of workflows) {
      const { name, condition } = workflowConfig;

      // Evaluate condition
      const shouldExecute = await this.evaluateCondition(condition, context);

      if (shouldExecute) {
        try {
          const result = await this.executeSequential([name], context, config);
          results.push(...result.results);
        } catch (error) {
          results.push({
            workflow: name,
            success: false,
            error: error.message,
            skipped: false,
          });
        }
      } else {
        results.push({
          workflow: name,
          success: true,
          skipped: true,
          reason: "Condition not met",
        });
      }
    }

    return {
      success: results.filter((r) => !r.skipped).every((r) => r.success),
      results,
      executionType: "conditional",
    };
  }

  /**
   * Evaluate workflow execution condition
   * @param {string|Function} condition - Condition to evaluate
   * @param {Object} context - Execution context
   * @returns {Promise<boolean>} Whether condition is met
   */
  async evaluateCondition(condition, context) {
    if (typeof condition === "function") {
      return await condition(context);
    }

    if (typeof condition === "string") {
      // Simple property-based conditions
      const [property, operator, value] = condition.split(" ");
      const actualValue = this.getNestedProperty(context, property);

      switch (operator) {
        case "===":
          return actualValue === value;
        case "!==":
          return actualValue !== value;
        case "exists":
          return actualValue !== undefined && actualValue !== null;
        default:
          return Boolean(actualValue);
      }
    }

    return Boolean(condition);
  }

  /**
   * Get nested property from object
   * @param {Object} obj - Object to search
   * @param {string} path - Property path (dot notation)
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
```

#### ContextRefreshManager.js

**Location**: `packages/shared-imports/src/architecture/workflows/eventType/ContextRefreshManager.js`

```javascript
/**
 * Context Refresh Manager
 * Manages context updates after workflow execution
 */
export class ContextRefreshManager {
  /**
   * Refresh specified contexts after workflow execution
   * @param {Array} contextNames - Context names to refresh
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refresh results
   */
  async refreshContexts(contextNames, executionResult) {
    const refreshResults = [];

    for (const contextName of contextNames) {
      try {
        const refreshResult = await this.refreshSingleContext(
          contextName,
          executionResult
        );
        refreshResults.push({
          context: contextName,
          success: true,
          result: refreshResult,
        });
      } catch (error) {
        refreshResults.push({
          context: contextName,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: refreshResults.every((r) => r.success),
      results: refreshResults,
    };
  }

  /**
   * Get context dependencies for an eventType
   * @param {string} eventType - EventType name
   * @returns {Array} Context dependencies
   */
  static getContextDependencies(eventType) {
    const { EventTypeParser } = require("./EventTypeParser.js");
    const eventDefinition = EventTypeParser.getEventDefinition(eventType);
    return eventDefinition?.workflowConfig?.contextRefresh || [];
  }

  /**
   * Propagate context updates to dependent components
   * @param {Array} contexts - Context update results
   * @returns {Promise<void>}
   */
  async propagateContextUpdates(contexts) {
    // Integration with your existing event system
    const { contextStore } = await import("../../../stores/contextStore.js");

    for (const contextResult of contexts) {
      if (contextResult.success) {
        await contextStore.updateContext(
          contextResult.context,
          contextResult.result
        );
      }
    }
  }

  /**
   * Refresh a single context
   * @param {string} contextName - Context name to refresh
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refresh result
   */
  async refreshSingleContext(contextName, executionResult) {
    switch (contextName) {
      case "planList":
        return await this.refreshPlanList(executionResult);
      case "planContext":
        return await this.refreshPlanContext(executionResult);
      case "planCommunications":
        return await this.refreshPlanCommunications(executionResult);
      case "planImpacts":
        return await this.refreshPlanImpacts(executionResult);
      default:
        throw new Error(`Unknown context: ${contextName}`);
    }
  }

  /**
   * Refresh plan list context
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refreshed plan list data
   */
  async refreshPlanList(executionResult) {
    const { execDml } = await import("@whatsfresh/shared-imports/api");

    const result = await execDml("SELECT", {
      table: "api_wf.plans",
      where: { active: 1 },
      orderBy: [{ column: "created_at", direction: "DESC" }],
    });

    return {
      plans: result.data || [],
      lastRefresh: new Date().toISOString(),
      source: "planList-refresh",
    };
  }

  /**
   * Refresh plan context for selected plan
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refreshed plan context
   */
  async refreshPlanContext(executionResult) {
    const planId = executionResult.context?.planId;
    if (!planId) return null;

    const { execDml } = await import("@whatsfresh/shared-imports/api");

    const result = await execDml("SELECT", {
      table: "api_wf.plans",
      where: { id: planId, active: 1 },
    });

    return {
      plan: result.data?.[0] || null,
      lastRefresh: new Date().toISOString(),
      source: "planContext-refresh",
    };
  }

  /**
   * Refresh plan communications
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refreshed communications data
   */
  async refreshPlanCommunications(executionResult) {
    const planId = executionResult.context?.planId;
    if (!planId) return null;

    const { execDml } = await import("@whatsfresh/shared-imports/api");

    const result = await execDml("SELECT", {
      table: "api_wf.communications",
      where: { plan_id: planId, active: 1 },
      orderBy: [{ column: "created_at", direction: "DESC" }],
    });

    return {
      communications: result.data || [],
      planId,
      lastRefresh: new Date().toISOString(),
      source: "planCommunications-refresh",
    };
  }

  /**
   * Refresh plan impacts
   * @param {Object} executionResult - Workflow execution result
   * @returns {Promise<Object>} Refreshed impacts data
   */
  async refreshPlanImpacts(executionResult) {
    const planId = executionResult.context?.planId;
    if (!planId) return null;

    const { execDml } = await import("@whatsfresh/shared-imports/api");

    const result = await execDml("SELECT", {
      table: "api_wf.impacts",
      where: { plan_id: planId, active: 1 },
      orderBy: [{ column: "created_at", direction: "DESC" }],
    });

    return {
      impacts: result.data || [],
      planId,
      lastRefresh: new Date().toISOString(),
      source: "planImpacts-refresh",
    };
  }
}
```

### 3. Main EventType Workflow Executor

**Location**: `packages/shared-imports/src/architecture/workflows/eventType/index.js`

```javascript
/**
 * EventType Workflow Executor
 * Main interface for executing workflows based on eventType triggers
 */
import { EventTypeParser } from "./EventTypeParser.js";
import { WorkflowTriggerMap } from "./WorkflowTriggerMap.js";
import { ExecutionOrchestrator } from "./ExecutionOrchestrator.js";
import { ContextRefreshManager } from "./ContextRefreshManager.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("EventTypeWorkflowExecutor");

export class EventTypeWorkflowExecutor {
  constructor() {
    this.orchestrator = new ExecutionOrchestrator();
    this.contextManager = new ContextRefreshManager();
  }

  /**
   * Execute workflows for an eventType trigger
   * @param {string} eventType - EventType name
   * @param {string} trigger - Trigger name (onLoad, onSelect, etc.)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflows(eventType, trigger, context = {}) {
    log.info("Executing workflows for eventType trigger", {
      eventType,
      trigger,
      context: this.sanitizeContext(context),
    });

    try {
      // 1. Get workflows for trigger
      const workflows = WorkflowTriggerMap.mapTriggerToWorkflows(
        eventType,
        trigger
      );

      if (workflows.length === 0) {
        log.debug("No workflows found for trigger", { eventType, trigger });
        return {
          success: true,
          message: "No workflows configured for trigger",
          workflows: [],
          context,
        };
      }

      // 2. Parse workflow configuration
      const eventDefinition = EventTypeParser.getEventDefinition(eventType);
      const workflowConfig =
        EventTypeParser.parseWorkflowConfig(eventDefinition);

      // 3. Resolve trigger context
      const resolvedContext = WorkflowTriggerMap.resolveTriggerContext(
        trigger,
        context
      );

      // 4. Execute workflows (default to sequential)
      const executionResult = await this.orchestrator.executeSequential(
        workflows,
        resolvedContext,
        workflowConfig.config
      );

      // 5. Refresh contexts if configured
      const contextRefreshNames = workflowConfig.config.contextRefresh;
      if (contextRefreshNames.length > 0) {
        const refreshResult = await this.contextManager.refreshContexts(
          contextRefreshNames,
          { ...executionResult, context: resolvedContext }
        );

        await this.contextManager.propagateContextUpdates(
          refreshResult.results
        );
      }

      log.info("EventType workflow execution completed", {
        eventType,
        trigger,
        success: executionResult.success,
        workflowCount: workflows.length,
      });

      return {
        success: executionResult.success,
        eventType,
        trigger,
        workflows,
        executionResult,
        context: resolvedContext,
      };
    } catch (error) {
      log.error("EventType workflow execution failed", {
        eventType,
        trigger,
        error: error.message,
      });

      // Execute error workflows if configured
      await this.executeErrorWorkflows(eventType, context, error);

      throw error;
    }
  }

  /**
   * Execute error workflows when main execution fails
   * @param {string} eventType - EventType name
   * @param {Object} context - Original context
   * @param {Error} error - Error that occurred
   */
  async executeErrorWorkflows(eventType, context, error) {
    try {
      const errorWorkflows = WorkflowTriggerMap.mapTriggerToWorkflows(
        eventType,
        "onError"
      );

      if (errorWorkflows.length > 0) {
        const errorContext = {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          },
        };

        await this.orchestrator.executeSequential(
          errorWorkflows,
          errorContext,
          {
            errorHandling: "continue",
            timeout: 5000,
          }
        );
      }
    } catch (errorWorkflowError) {
      log.error("Error workflow execution failed", {
        eventType,
        error: errorWorkflowError.message,
      });
    }
  }

  /**
   * Validate eventType workflow configuration
   * @param {string} eventType - EventType name
   * @returns {Object} Validation result
   */
  validateEventTypeWorkflows(eventType) {
    const eventDefinition = EventTypeParser.getEventDefinition(eventType);

    if (!eventDefinition) {
      return {
        valid: false,
        errors: [`EventType '${eventType}' not found`],
      };
    }

    const workflowValidation =
      EventTypeParser.validateWorkflowReferences(eventDefinition);
    const triggerValidation = WorkflowTriggerMap.validateTriggerConfiguration(
      eventDefinition.workflowTriggers || {}
    );

    return {
      valid: workflowValidation.valid && triggerValidation.valid,
      errors: [...workflowValidation.errors, ...triggerValidation.errors],
      warnings: [...workflowValidation.warnings],
    };
  }

  /**
   * Sanitize context for logging
   * @param {Object} context - Context to sanitize
   * @returns {Object} Sanitized context
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    const sensitiveFields = ["password", "token", "apiKey", "secret"];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}

// Create singleton instance
export const eventTypeWorkflowExecutor = new EventTypeWorkflowExecutor();

// Export for testing
export {
  EventTypeParser,
  WorkflowTriggerMap,
  ExecutionOrchestrator,
  ContextRefreshManager,
};
```

## Data Models

### Enhanced EventType Structure

The eventTypes will be enhanced to include workflow orchestration:

```javascript
// Example enhanced eventType for planList
{
  eventID: 101,
  eventType: "planList",
  category: "grid:Plans",
  description: "Plan list management with workflow integration",

  // Existing data structure
  sql: "SELECT * FROM api_wf.plans WHERE active = 1",
  params: [],
  table: "api_wf.plans",

  // New workflow integration
  workflows: [
    "trackPlanAccess",
    "validatePlanPermissions",
    "refreshPlanContext"
  ],

  workflowTriggers: {
    onLoad: ["trackPlanAccess"],
    onSelect: ["validatePlanPermissions", "refreshPlanContext"],
    onUpdate: ["updatePlan", "trackImpact"],
    onError: ["logPlanError"]
  },

  workflowConfig: {
    errorHandling: "continue",
    retryPolicy: "standard",
    timeout: 10000,
    contextRefresh: ["planList", "planContext"]
  },

  // Existing navigation structure
  navChildren: ["planDetail", "planCommunications", "planImpacts"]
}
```

### Plan Data Model

```javascript
{
  id: 36,
  cluster: "DEVTOOLS",
  name: "Reorganize ArchIntel Page",
  status: "new",
  priority: "medium",
  description: "Create new Plan Management page...",
  created_at: "2025-07-30T17:05:55Z",
  created_by: "Paul",
  updated_at: "2025-07-30T17:27:38Z",
  active: 1
}
```

### Communication Data Model

```javascript
{
  id: 123,
  plan_id: 36,
  type: "update", // from communication-types.json
  subject: "Plan status update",
  message: "Updated plan requirements based on feedback",
  created_by: "Paul",
  created_at: "2025-07-30T18:00:00Z",
  active: 1
}
```

## Error Handling

### Workflow Error Handling Strategy

1. **Fail-Fast Mode**: Stop execution on first error (default for critical operations)
2. **Continue Mode**: Log errors but continue with remaining workflows
3. **Error Workflows**: Automatic execution of error handling workflows

### Error Recovery Patterns

```javascript
// Error workflow example
{
  name: "logPlanError",
  steps: [
    {
      name: "logError",
      execute: async (context, state) => {
        const { error, eventType, trigger } = context;

        await impactTracker.recordImpact({
          planId: context.planId,
          type: "ERROR",
          description: `EventType error: ${eventType}.${trigger} - ${error.message}`,
          phase: "runtime",
          userID: context.userId,
          metadata: {
            eventType,
            trigger,
            errorStack: error.stack
          }
        });
      }
    }
  ]
}
```

## Testing Strategy

### Unit Testing

1. **EventTypeParser Tests**

   - Configuration parsing validation
   - Workflow reference validation
   - Trigger extraction logic

2. **WorkflowTriggerMap Tests**

   - Trigger-to-workflow mapping
   - Context resolution
   - Configuration validation

3. **ExecutionOrchestrator Tests**

   - Sequential execution
   - Parallel execution
   - Conditional execution
   - Error handling scenarios

4. **ContextRefreshManager Tests**
   - Context refresh logic
   - Dependency resolution
   - Update propagation

### Integration Testing

1. **EventType-Workflow Integration**

   - End-to-end workflow execution
   - Context refresh validation
   - Error workflow execution

2. **Plan Management Page Integration**
   - UI event triggering workflows
   - Context updates reflecting in UI
   - Error handling user experience

### Component Testing

1. **Plan Management Page**

   - Plan selection workflows
   - Status filtering workflows
   - Tab switching workflows

2. **Individual Components**
   - SelStatusWidget workflow integration
   - PlanList workflow integration
   - PlanDetailTabs workflow integration

## Implementation Notes

### Phase 1: Core Infrastructure

1. Create eventType integration modules
2. Enhance existing eventTypes with workflow configuration
3. Integrate with existing WorkflowRegistry

### Phase 2: Plan Management Page

1. Create new page component
2. Implement SelStatusWidget
3. Implement PlanList with workflow integration
4. Implement PlanDetailTabs

### Phase 3: Advanced Features

1. Communication creation workflow
2. Impact tracking integration
3. Error handling and recovery
4. Performance optimization

### Integration Points

1. **Existing Workflow System**: Leverages current WorkflowRegistry and config-driven workflows
2. **EventTypes System**: Enhances existing eventTypes.js with workflow orchestration
3. **Context Store**: Integrates with existing contextStore for state management
4. **API Layer**: Uses existing execDml for data operations

This design creates a revolutionary declarative system where UI interactions automatically trigger appropriate workflows through configuration rather than hardcoded logic, making the system highly maintainable and extensible.

## Implementation Strategy

### Architectural Pilot Approach

Plan 0036 serves as an **architectural pilot** to test the new layered approach safely:

#### Benefits of Pilot Approach

1. **Zero Risk**: No impact on existing CrudLayout pages
2. **Safe Testing**: New patterns validated in isolation
3. **Iterative Refinement**: Architecture can be refined based on real usage
4. **Migration Path**: If successful, provides blueprint for CrudLayout migration

#### Standard Trigger Patterns

Most eventTypes will use the **3-trigger standard**:

```javascript
workflowTriggers: {
  onSelect: ["validateAccess", "refreshContext"],
  onUpdate: ["updateRecord", "trackImpact"],
  onCreate: ["createRecord", "trackImpact"]
}
```

Optional triggers (`onDelete`, `onLoad`, `onError`) added as needed.

### Implementation Phases

#### Phase 1: Foundation Architecture

1. Create plan-management folder structure
2. Implement workflowMap.js with page orchestration
3. Create tabMaps for each tab configuration
4. Enhance eventTypes with standard trigger patterns

#### Phase 2: Component Integration

1. Build main page component using workflowMap
2. Implement SelStatusWidget with CONFIG method
3. Create PlanList with NNNN-name format
4. Build PlanDetailTabs using tabMap configurations

#### Phase 3: Workflow Integration

1. Connect page-level triggers (onPageLoad, onPlanSelect, onPageExit)
2. Integrate component-level triggers (onSelect, onUpdate, onCreate)
3. Implement automatic context refresh
4. Add error handling and recovery workflows

#### Phase 4: Validation & Migration Planning

1. Test all workflow patterns thoroughly
2. Validate performance and maintainability
3. Document lessons learned
4. Plan migration strategy for existing CrudLayout pages

### Key Architectural Innovations

1. **Two-Level Trigger System**: Page orchestration + component workflows
2. **Folder Organization**: Clean separation of concerns with tabMaps
3. **Standard Patterns**: 3-trigger standard for consistency
4. **CONFIG Method**: Direct integration with selectVals.json
5. **Declarative Structure**: WorkflowMap defines page blueprint

This refined architecture creates a powerful, maintainable system that bridges UI interactions with workflow execution through clean, organized layers.
