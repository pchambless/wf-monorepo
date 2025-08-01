# Workflow Architecture Documentation

## Overview

The WhatsFresh Workflow Architecture provides a comprehensive, config-driven system for managing complex business processes through composable, monitorable, and testable workflows. Built following the config-driven development standards outlined in `CLAUDE.md`, this system externalizes all configuration to JSON files and provides extensive monitoring and debugging capabilities.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Architecture Overview](#architecture-overview)
- [Configuration System](#configuration-system)
- [Workflow Creation](#workflow-creation)
- [Integration Patterns](#integration-patterns)
- [Monitoring & Debugging](#monitoring--debugging)
- [Testing Framework](#testing-framework)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Basic Workflow Creation

```javascript
import { workflowRegistry } from "@whatsfresh/shared-imports/workflows";

// Register a simple workflow
workflowRegistry.register("createUser", {
  name: "createUser",
  steps: [
    {
      name: "validateInput",
      execute: async (context) => {
        if (!context.email || !context.name) {
          throw new Error("Email and name are required");
        }
        return { validated: true };
      },
    },
    {
      name: "createUserRecord",
      execute: async (context) => {
        // Database operation would go here
        return { userId: Date.now(), created: true };
      },
    },
  ],
});

// Execute the workflow
const result = await workflowRegistry.execute("createUser", {
  email: "user@example.com",
  name: "John Doe",
});

console.log(result); // { success: true, data: { userId: ..., created: true } }
```

### 2. Using Config-Driven Options

```javascript
import { getComponentWorkflowConfig } from "@whatsfresh/shared-imports/workflows/config";

// Get configuration for form components
const formConfig = getComponentWorkflowConfig("form");

// Execute with config-driven options
const result = await workflowRegistry.execute(
  "createUser",
  context,
  formConfig
);
```

### 3. Component Integration

```javascript
import { workflowRegistry } from "@whatsfresh/shared-imports/workflows";
import { getComponentWorkflowConfig } from "@whatsfresh/shared-imports/workflows/config";

const handleSubmit = async (formData) => {
  const workflowOptions = getComponentWorkflowConfig("form");
  const result = await workflowRegistry.execute(
    "createUser",
    formData,
    workflowOptions
  );

  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
};
```

## Core Concepts

### Workflows

A workflow is a sequence of steps that accomplish a business process. Each workflow has:

- **Name**: Unique identifier
- **Steps**: Array of executable steps
- **Dependencies**: Optional workflow dependencies
- **Context Refresh**: Automatic UI refresh triggers

### Steps

Individual units of work within a workflow:

- **Name**: Step identifier
- **Execute**: Async function that performs the work
- **Condition**: Optional conditional execution
- **Parallel**: Optional parallel execution flag
- **Timeout**: Optional step-specific timeout

### Context

Data passed between workflow steps:

- Immutable input context
- Mutable state that accumulates results
- Automatic data merging between steps

### Configuration

All workflow behavior is driven by configuration:

- Timeouts from `selectVals.json`
- Retry policies from config
- Error handling strategies from config
- Component-specific options

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│  WorkflowRegistry │───▶│ WorkflowInstance│
│                 │    │                  │    │                 │
│ - Forms         │    │ - Registration   │    │ - Execution     │
│ - Editors       │    │ - Execution      │    │ - State Mgmt    │
│ - Modals        │    │ - Middleware     │    │ - Error Handling│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Configuration  │    │   Integration    │    │   Monitoring    │
│                 │    │                  │    │                 │
│ - selectVals    │    │ - Orchestration  │    │ - Execution Log │
│ - Timeouts      │    │ - Composition    │    │ - Performance   │
│ - Retry Policies│    │ - Communication  │    │ - Debugging     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

1. **WorkflowRegistry**: Central registry for workflow definitions and execution
2. **WorkflowInstance**: Individual workflow execution with state management
3. **WorkflowIntegrator**: Cross-workflow communication and orchestration
4. **WorkflowComposer**: Patterns for composing complex workflows
5. **WorkflowMonitor**: Execution monitoring and performance tracking
6. **WorkflowDebugger**: Interactive debugging and analysis tools

## Configuration System

Following the config-driven development standards, all workflow behavior is externalized to configuration files.

### selectVals.json Structure

```json
{
  "workflowTimeouts": {
    "name": "workflowTimeouts",
    "choices": [
      {
        "value": "createPlan",
        "timeout": 15000,
        "description": "Plan creation workflow"
      },
      {
        "value": "updatePlan",
        "timeout": 10000,
        "description": "Plan update workflow"
      }
    ]
  },
  "workflowRetryPolicies": {
    "name": "workflowRetryPolicies",
    "choices": [
      { "value": "standard", "maxAttempts": 3, "backoffMs": 1000 },
      { "value": "aggressive", "maxAttempts": 5, "backoffMs": 500 }
    ]
  }
}
```

### Configuration Usage

```javascript
import {
  getWorkflowTimeout,
  getRetryPolicy,
  getComponentWorkflowConfig,
} from "@whatsfresh/shared-imports/workflows/config";

// Get specific timeout
const timeout = getWorkflowTimeout("createPlan"); // 15000

// Get retry policy
const retryPolicy = getRetryPolicy("standard");
// { maxAttempts: 3, backoffMs: 1000 }

// Get component-specific config
const formConfig = getComponentWorkflowConfig("form");
// { timeout: 15000, retryPolicy: {...}, errorHandling: 'fail-fast' }
```

## Workflow Creation

### Basic Workflow

```javascript
const simpleWorkflow = {
  name: "processOrder",
  steps: [
    {
      name: "validateOrder",
      execute: async (context) => {
        // Validation logic
        return { valid: true };
      },
    },
    {
      name: "processPayment",
      execute: async (context) => {
        // Payment processing
        return { paymentId: "pay_123", charged: true };
      },
    },
  ],
};

workflowRegistry.register(simpleWorkflow);
```

### Advanced Workflow with Orchestration

```javascript
const advancedWorkflow = {
  name: "complexOrder",
  dependencies: [
    { workflow: "validateInventory", context: { productId: "product.id" } },
  ],
  steps: [
    {
      name: "processPayment",
      condition: "order.total > 0",
      timeout: 30000,
      execute: async (context) => {
        return { paymentProcessed: true };
      },
    },
    {
      name: "sendNotifications",
      parallel: true,
      execute: async (context) => {
        // Send email/SMS notifications in parallel
        return { notificationsSent: true };
      },
    },
    {
      name: "updateInventory",
      parallel: true,
      execute: async (context) => {
        // Update inventory in parallel
        return { inventoryUpdated: true };
      },
    },
  ],
  contextRefresh: ["orderList", "inventoryStatus"],
};
```

### Workflow with Lifecycle Management

```javascript
const lifecycleWorkflow = {
  name: "managedProcess",
  steps: [
    {
      name: "initializeResources",
      lifecycle: {
        hooks: {
          onInit: async (context) => {
            console.log("Initializing resources...");
            return { initialized: true };
          },
          onMount: async (context) => {
            console.log("Mounting resources...");
            return { mounted: true };
          },
          onUnmount: async (context) => {
            console.log("Cleaning up resources...");
            return { cleaned: true };
          },
          onError: async (error, phase, component) => {
            console.error(`Error in ${phase}:`, error.message);
          },
        },
        errorBoundary: async (error, phase, component) => {
          // Custom error handling
          console.error("Error boundary triggered:", error.message);
        },
      },
      execute: async (context) => {
        return { processed: true };
      },
    },
  ],
};
```

## Integration Patterns

### Sequential Composition

```javascript
import { workflowComposer } from "@whatsfresh/shared-imports/workflows";

const sequentialFlow = workflowComposer.createSequential(
  "orderProcessingPipeline",
  ["validateOrder", "processPayment", "fulfillOrder"],
  {
    failFast: true,
    passDataBetween: true,
  }
);

const result = await sequentialFlow.execute({ orderId: 123 });
```

### Parallel Composition

```javascript
const parallelFlow = workflowComposer.createParallel(
  "parallelProcessing",
  ["processPayment", "updateInventory", "sendNotifications"],
  {
    aggregateResults: true,
    failFast: false,
  }
);
```

### Conditional Composition

```javascript
const conditionalFlow = workflowComposer.createConditional(
  "conditionalProcessing",
  {
    'order.type === "premium"': "premiumProcessing",
    'order.type === "standard"': "standardProcessing",
    "order.urgent === true": "urgentProcessing",
  },
  {
    defaultWorkflow: "standardProcessing",
  }
);
```

### Retry Composition

```javascript
const retryFlow = workflowComposer.createRetry(
  "reliablePayment",
  "processPayment",
  {
    maxAttempts: 3,
    backoffStrategy: "exponential",
    retryCondition: (error) => error.retryable !== false,
  }
);
```

## Monitoring & Debugging

### Basic Monitoring

```javascript
import { workflowMonitor } from "@whatsfresh/shared-imports/workflows/monitoring";

// Get execution logs
const logs = workflowMonitor.getExecutionLogs("createUser", 10);

// Get performance metrics
const metrics = workflowMonitor.getPerformanceMetrics("createUser");

// Get alerts
const alerts = workflowMonitor.getAlerts("critical");
```

### Debug Session

```javascript
import { workflowDebugger } from "@whatsfresh/shared-imports/workflows/monitoring";

// Create debug session
const session = workflowDebugger.createDebugSession("createUser", {
  stepMode: true,
  breakpoints: ["validateInput"],
  watchVariables: ["user.email", "validation.result"],
});

// Add breakpoint with condition
session.stepper.addBreakpoint("processPayment", "amount > 1000");

// Watch variables
const watchId = session.watcher.watch("user.status", "userStatus");

// Start execution trace
const traceId = session.tracer.startTrace();

// Analyze workflow
const analysis = workflowDebugger.analyzeExecutionPatterns("createUser");
const healthReport = workflowDebugger.generateHealthReport("createUser");
```

### Performance Analysis

```javascript
// Get detailed performance analysis
const analysis = workflowDebugger.analyzeExecutionPatterns("createUser", {
  limit: 100,
});

console.log(analysis.patterns.commonFailurePoints);
console.log(analysis.patterns.performanceBottlenecks);
console.log(analysis.recommendations);
```

## Testing Framework

### Basic Testing

```javascript
import { workflowTestFramework } from "@whatsfresh/shared-imports/workflows/testing";

// Create test registry
const testRegistry = workflowTestFramework.createTestRegistry();

// Create mock database
const mockDb = workflowTestFramework.createMockDatabase({
  users: [{ id: 1, name: "Test User" }],
});

// Create test workflow
workflowTestFramework.createTestWorkflow("testCreateUser", {
  steps: [
    {
      name: "createUser",
      execute: async (context) => {
        const mockDb = context._mocks.database;
        const result = await mockDb.execDml({
          method: "INSERT",
          table: "users",
          data: { name: context.name, email: context.email },
        });
        return { userId: result.insertId };
      },
    },
  ],
});

// Execute test
const result = await workflowTestFramework.executeTestWorkflow(
  "testCreateUser",
  {
    name: "Test User",
    email: "test@example.com",
  }
);
```

### Integration Testing

```javascript
import { endToEndTestBuilder } from "@whatsfresh/shared-imports/workflows/testing";

const scenario = endToEndTestBuilder("userRegistrationFlow")
  .setup("initializeDatabase", async (context) => {
    context.testDb = await setupTestDatabase();
  })
  .executeWorkflow("validateUser", { email: "test@example.com" })
  .executeWorkflow("createUser", { name: "Test User" })
  .assert("user should be created", (context, results) => {
    expect(results.steps[1].result.data.userId).toBeDefined();
    return true;
  })
  .teardown("cleanup", async (context) => {
    await context.testDb.cleanup();
  })
  .build();

const result = await workflowTestFramework.executeTestScenario(
  "userRegistrationFlow"
);
```

### Performance Testing

```javascript
const perfResult = await workflowTestFramework.performanceTest("createUser", {
  iterations: 100,
  concurrency: 5,
  context: { name: "Perf Test", email: "perf@test.com" },
});

console.log(`Average time: ${perfResult.averageTime}ms`);
console.log(`Success rate: ${perfResult.successRate}%`);
```

## Best Practices

### 1. Configuration-Driven Development

```javascript
// ❌ Bad: Hardcoded values
const result = await workflowRegistry.execute("createUser", context, {
  timeout: 10000,
  retryAttempts: 3,
});

// ✅ Good: Config-driven
const workflowOptions = getComponentWorkflowConfig("form");
const result = await workflowRegistry.execute(
  "createUser",
  context,
  workflowOptions
);
```

### 2. Error Handling

```javascript
// ✅ Good: Comprehensive error handling
const workflow = {
  name: "robustWorkflow",
  steps: [
    {
      name: "riskyOperation",
      execute: async (context) => {
        try {
          return await performRiskyOperation(context);
        } catch (error) {
          // Add context to error
          error.step = "riskyOperation";
          error.context = context;
          throw error;
        }
      },
    },
  ],
};
```

### 3. Step Granularity

```javascript
// ✅ Good: Atomic, focused steps
const workflow = {
  steps: [
    { name: "validateInput", execute: validateInput },
    { name: "transformData", execute: transformData },
    { name: "saveToDatabase", execute: saveToDatabase },
    { name: "sendNotification", execute: sendNotification },
  ],
};

// ❌ Bad: Monolithic step
const workflow = {
  steps: [
    {
      name: "doEverything",
      execute: async (context) => {
        // Validation, transformation, saving, notification all in one step
      },
    },
  ],
};
```

### 4. Context Management

```javascript
// ✅ Good: Clean context passing
const step = {
  name: "processUser",
  execute: async (context) => {
    const { userId, email, preferences } = context;

    // Process only what's needed
    const result = await processUser({ userId, email });

    // Return only relevant data
    return {
      processedUserId: result.id,
      processedAt: new Date().toISOString(),
    };
  },
};
```

### 5. Testing Strategy

```javascript
// ✅ Good: Comprehensive testing
describe("User Workflow", () => {
  it("should handle happy path", async () => {
    // Test successful execution
  });

  it("should handle validation errors", async () => {
    // Test error scenarios
  });

  it("should handle timeouts", async () => {
    // Test timeout scenarios
  });

  it("should perform within acceptable limits", async () => {
    // Performance testing
  });
});
```

## API Reference

### WorkflowRegistry

#### Methods

- `register(name, definition)` - Register a workflow
- `execute(name, context, options)` - Execute a workflow
- `getWorkflow(name)` - Get workflow definition
- `listWorkflows()` - List all registered workflows
- `clear()` - Clear all workflows (testing)

#### Middleware

```javascript
workflowRegistry.use(async (phase, context, definition, result) => {
  if (phase === "before") {
    // Pre-execution logic
    return modifiedContext;
  } else if (phase === "after") {
    // Post-execution logic
  }
});
```

### WorkflowComposer

#### Methods

- `createSequential(name, workflows, options)` - Sequential composition
- `createParallel(name, workflows, options)` - Parallel composition
- `createConditional(name, conditions, options)` - Conditional composition
- `createRetry(name, workflow, options)` - Retry wrapper

### Configuration Functions

- `getWorkflowTimeout(workflowName)` - Get workflow timeout
- `getRetryPolicy(policyType)` - Get retry policy
- `getComponentWorkflowConfig(componentType)` - Get component config
- `validateWorkflowConfig(config)` - Validate configuration

## Examples

See the [examples directory](./examples/) for complete workflow examples:

- [Basic CRUD Workflows](./examples/crud-workflows.md)
- [Integration Patterns](./examples/integration-patterns.md)
- [Error Handling Strategies](./examples/error-handling.md)
- [Performance Optimization](./examples/performance-optimization.md)
- [Testing Strategies](./examples/testing-strategies.md)

## Troubleshooting

### Common Issues

#### 1. Workflow Not Found

```
Error: Workflow 'myWorkflow' not found
```

**Solution**: Ensure the workflow is registered before execution:

```javascript
// Check if workflow exists
const workflow = workflowRegistry.getWorkflow("myWorkflow");
if (!workflow) {
  console.error("Workflow not registered");
}
```

#### 2. Step Execution Timeout

```
Error: Step 'slowStep' timed out
```

**Solutions**:

- Increase timeout in configuration
- Optimize step performance
- Break down into smaller steps

```javascript
// Increase timeout for specific workflow
const config = getComponentWorkflowConfig("form");
config.timeout = 30000; // 30 seconds
```

#### 3. Context Data Missing

```
Error: Cannot read property 'userId' of undefined
```

**Solution**: Validate context in step execution:

```javascript
const step = {
  name: "processUser",
  execute: async (context) => {
    if (!context.userId) {
      throw new Error("userId is required in context");
    }
    // Continue processing
  },
};
```

#### 4. Memory Leaks in Long-Running Workflows

**Solution**: Use lifecycle management and cleanup:

```javascript
const workflow = {
  steps: [
    {
      name: "resourceIntensiveStep",
      lifecycle: {
        hooks: {
          onUnmount: async () => {
            // Cleanup resources
            await cleanupResources();
          },
        },
      },
      execute: async (context) => {
        // Process with resources
      },
    },
  ],
};
```

### Debugging Workflow Issues

1. **Enable Debug Mode**:

   ```javascript
   const session = workflowDebugger.createDebugSession("problematicWorkflow", {
     stepMode: true,
     logLevel: "debug",
   });
   ```

2. **Add Breakpoints**:

   ```javascript
   session.stepper.addBreakpoint("problematicStep", "data.value > 100");
   ```

3. **Watch Variables**:

   ```javascript
   session.watcher.watch("user.status");
   session.watcher.watch("processing.stage");
   ```

4. **Analyze Performance**:
   ```javascript
   const analysis = workflowDebugger.analyzeExecutionPatterns(
     "problematicWorkflow"
   );
   console.log(analysis.patterns.performanceBottlenecks);
   ```

### Performance Optimization

1. **Identify Bottlenecks**:

   ```javascript
   const metrics = workflowMonitor.getPerformanceMetrics("slowWorkflow");
   console.log("Average duration:", metrics.averageDuration);
   console.log("Step metrics:", metrics.stepMetrics);
   ```

2. **Use Parallel Execution**:

   ```javascript
   // Mark independent steps as parallel
   {
     name: 'sendEmail',
     parallel: true,
     execute: sendEmailNotification
   },
   {
     name: 'updateDatabase',
     parallel: true,
     execute: updateUserRecord
   }
   ```

3. **Optimize Step Granularity**:

   - Break large steps into smaller ones
   - Combine very small steps if overhead is significant
   - Use conditional execution to skip unnecessary steps

4. **Configure Appropriate Timeouts**:
   ```javascript
   // Set realistic timeouts in selectVals.json
   {
     "value": "heavyProcessing",
     "timeout": 60000,
     "description": "Heavy processing workflow"
   }
   ```

For more detailed troubleshooting, see the [Troubleshooting Guide](./troubleshooting.md).

---

## Contributing

When contributing to the workflow system:

1. Follow config-driven development principles
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use the monitoring system to validate performance
5. Follow the established patterns and conventions

## License

This workflow system is part of the WhatsFresh monorepo and follows the same licensing terms.
