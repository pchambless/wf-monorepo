# Workflow Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the WhatsFresh Workflow Architecture.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Error Messages](#common-error-messages)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Integration Issues](#integration-issues)
- [Debugging Techniques](#debugging-techniques)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Best Practices for Prevention](#best-practices-for-prevention)

## Quick Diagnostics

### Health Check Script

```javascript
import {
  workflowRegistry,
  workflowMonitor,
  workflowDebugger,
} from "@whatsfresh/shared-imports/workflows";

async function performHealthCheck(workflowName) {
  console.log(`🔍 Health Check for: ${workflowName}`);

  // 1. Check if workflow exists
  const workflow = workflowRegistry.getWorkflow(workflowName);
  if (!workflow) {
    console.error("❌ Workflow not found");
    return;
  }
  console.log("✅ Workflow found");

  // 2. Validate workflow definition
  const session = workflowDebugger.createDebugSession(workflowName);
  const validation = session.inspector.validateDefinition();

  if (!validation.valid) {
    console.error("❌ Workflow validation failed:", validation.errors);
    return;
  }
  console.log("✅ Workflow definition valid");

  // 3. Check performance metrics
  const metrics = workflowMonitor.getPerformanceMetrics(workflowName);
  if (metrics) {
    console.log("📊 Performance Metrics:");
    console.log(
      `   Success Rate: ${(
        (metrics.successfulExecutions / metrics.totalExecutions) *
        100
      ).toFixed(1)}%`
    );
    console.log(`   Average Duration: ${metrics.averageDuration}ms`);
    console.log(`   Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
  } else {
    console.log("ℹ️  No performance data available");
  }

  // 4. Check for alerts
  const alerts = workflowMonitor
    .getAlerts()
    .filter((a) => a.data.workflowName === workflowName);

  if (alerts.length > 0) {
    console.warn(`⚠️  ${alerts.length} active alerts`);
    alerts.forEach((alert) => {
      console.warn(`   ${alert.type}: ${alert.data.message || "No message"}`);
    });
  } else {
    console.log("✅ No active alerts");
  }

  // 5. Generate health report
  const healthReport = workflowDebugger.generateHealthReport(workflowName);
  console.log(
    `🏥 Overall Health: ${healthReport.status} (Score: ${healthReport.healthScore}/100)`
  );

  workflowDebugger.stopDebugSession(session.sessionId);
}

// Usage
await performHealthCheck("createUser");
```

### System Status Check

```javascript
import { workflowMonitor } from "@whatsfresh/shared-imports/workflows/monitoring";

function checkSystemStatus() {
  const stats = workflowMonitor.getMonitoringStats();

  console.log("🖥️  System Status:");
  console.log(`   Monitoring: ${stats.isEnabled ? "Enabled" : "Disabled"}`);
  console.log(`   Total Executions: ${stats.totalExecutions}`);
  console.log(`   Active Debug Sessions: ${stats.activeDebugSessions}`);
  console.log(`   Unacknowledged Alerts: ${stats.unacknowledgedAlerts}`);
  console.log(`   Monitored Workflows: ${stats.monitoredWorkflows}`);

  if (stats.unacknowledgedAlerts > 0) {
    console.warn("⚠️  There are unacknowledged alerts that need attention");
  }
}
```

## Common Error Messages

### 1. "Workflow 'workflowName' not found"

**Cause**: The workflow hasn't been registered or the name is incorrect.

**Solutions**:

```javascript
// Check if workflow is registered
const workflow = workflowRegistry.getWorkflow("myWorkflow");
if (!workflow) {
  console.log("Available workflows:", workflowRegistry.listWorkflows());
}

// Register the workflow
workflowRegistry.register("myWorkflow", {
  name: "myWorkflow",
  steps: [
    /* ... */
  ],
});
```

### 2. "Step 'stepName' must have an execute function"

**Cause**: A workflow step is missing the required `execute` function.

**Solutions**:

```javascript
// ❌ Incorrect
const badStep = {
  name: "processData",
  // Missing execute function
};

// ✅ Correct
const goodStep = {
  name: "processData",
  execute: async (context) => {
    // Step logic here
    return { processed: true };
  },
};
```

### 3. "Step 'stepName' timed out"

**Cause**: Step execution exceeded the configured timeout.

**Solutions**:

1. **Increase timeout in configuration**:

```javascript
// Update selectVals.json
{
  "workflowTimeouts": {
    "choices": [
      {"value": "slowWorkflow", "timeout": 60000} // 60 seconds
    ]
  }
}
```

2. **Optimize step performance**:

```javascript
// ❌ Slow step
const slowStep = {
  name: "processLargeDataset",
  execute: async (context) => {
    // Process all data at once
    return await processAllData(context.largeDataset);
  },
};

// ✅ Optimized step
const optimizedStep = {
  name: "processLargeDataset",
  execute: async (context) => {
    // Process in batches
    const results = [];
    const batchSize = 100;

    for (let i = 0; i < context.largeDataset.length; i += batchSize) {
      const batch = context.largeDataset.slice(i, i + batchSize);
      const batchResult = await processBatch(batch);
      results.push(...batchResult);
    }

    return { processedItems: results };
  },
};
```

3. **Break into smaller steps**:

```javascript
const workflow = {
  name: "optimizedProcessing",
  steps: [
    {
      name: "prepareData",
      execute: async (context) => {
        return { prepared: true };
      },
    },
    {
      name: "processData",
      execute: async (context, state) => {
        return { processed: true };
      },
    },
    {
      name: "finalizeData",
      execute: async (context, state) => {
        return { finalized: true };
      },
    },
  ],
};
```

### 4. "Cannot read property 'propertyName' of undefined"

**Cause**: Expected data is missing from the workflow context or state.

**Solutions**:

1. **Add context validation**:

```javascript
const step = {
  name: "processUser",
  execute: async (context) => {
    // Validate required context
    if (!context.user) {
      throw new Error("User data is required in context");
    }

    if (!context.user.id) {
      throw new Error("User ID is required");
    }

    // Safe to use context.user.id
    return { userId: context.user.id };
  },
};
```

2. **Use safe property access**:

```javascript
const step = {
  name: "processUser",
  execute: async (context) => {
    const userId = context.user?.id;
    const userEmail = context.user?.email || "no-email@example.com";

    if (!userId) {
      throw new Error("User ID is required");
    }

    return { userId, userEmail };
  },
};
```

### 5. "Workflow execution failed: Circular dependency detected"

**Cause**: Workflow dependencies form a circular reference.

**Solutions**:

```javascript
// ❌ Circular dependency
workflowRegistry.register("workflowA", {
  dependencies: [{ workflow: "workflowB" }],
  // ...
});

workflowRegistry.register("workflowB", {
  dependencies: [{ workflow: "workflowA" }], // Circular!
  // ...
});

// ✅ Resolved dependency structure
workflowRegistry.register("baseWorkflow", {
  // No dependencies
  steps: [
    /* ... */
  ],
});

workflowRegistry.register("workflowA", {
  dependencies: [{ workflow: "baseWorkflow" }],
  // ...
});

workflowRegistry.register("workflowB", {
  dependencies: [{ workflow: "baseWorkflow" }],
  // ...
});
```

## Performance Issues

### Slow Workflow Execution

**Diagnosis**:

```javascript
// Analyze performance patterns
const analysis = workflowDebugger.analyzeExecutionPatterns("slowWorkflow");
console.log(
  "Performance bottlenecks:",
  analysis.patterns.performanceBottlenecks
);

// Check individual step performance
const metrics = workflowMonitor.getPerformanceMetrics("slowWorkflow");
if (metrics.stepMetrics) {
  Object.entries(metrics.stepMetrics).forEach(([stepName, stepMetrics]) => {
    console.log(
      `${stepName}: avg ${stepMetrics.averageDuration}ms, max ${stepMetrics.maxDuration}ms`
    );
  });
}
```

**Solutions**:

1. **Use parallel execution**:

```javascript
const workflow = {
  steps: [
    {
      name: "independentTask1",
      parallel: true,
      execute: async (context) => {
        return await performTask1(context);
      },
    },
    {
      name: "independentTask2",
      parallel: true,
      execute: async (context) => {
        return await performTask2(context);
      },
    },
  ],
};
```

2. **Optimize database queries**:

```javascript
// ❌ Multiple individual queries
const slowStep = {
  name: "loadUserData",
  execute: async (context) => {
    const users = [];
    for (const userId of context.userIds) {
      const user = await database.getUser(userId);
      users.push(user);
    }
    return { users };
  },
};

// ✅ Batch query
const fastStep = {
  name: "loadUserData",
  execute: async (context) => {
    const users = await database.getUsers(context.userIds);
    return { users };
  },
};
```

3. **Implement caching**:

```javascript
const cachedStep = {
  name: "expensiveCalculation",
  execute: async (context) => {
    const cacheKey = `calc_${context.inputHash}`;

    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return { result: cached, fromCache: true };
    }

    // Perform calculation
    const result = await performExpensiveCalculation(context.input);

    // Cache result
    await cache.set(cacheKey, result, 3600); // 1 hour TTL

    return { result, fromCache: false };
  },
};
```

### Memory Leaks

**Diagnosis**:

```javascript
// Monitor memory usage
const logs = workflowMonitor.getExecutionLogs("memoryIntensiveWorkflow");
logs.forEach((log) => {
  if (log.performanceSnapshots) {
    const memoryUsage = log.performanceSnapshots.map((s) => s.memoryUsage);
    const maxMemory = Math.max(...memoryUsage);
    console.log(`Execution ${log.executionId}: Peak memory ${maxMemory} bytes`);
  }
});
```

**Solutions**:

1. **Use lifecycle management**:

```javascript
const workflow = {
  steps: [
    {
      name: "resourceIntensiveStep",
      lifecycle: {
        hooks: {
          onUnmount: async () => {
            // Clean up resources
            await cleanupLargeObjects();
            await closeConnections();
          },
        },
      },
      execute: async (context) => {
        // Process with resources
        return { processed: true };
      },
    },
  ],
};
```

2. **Process data in chunks**:

```javascript
const chunkedStep = {
  name: "processLargeDataset",
  execute: async (context) => {
    const { largeDataset } = context;
    const chunkSize = 1000;
    const results = [];

    for (let i = 0; i < largeDataset.length; i += chunkSize) {
      const chunk = largeDataset.slice(i, i + chunkSize);
      const chunkResult = await processChunk(chunk);
      results.push(chunkResult);

      // Allow garbage collection
      if (i % (chunkSize * 10) === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return { results };
  },
};
```

## Configuration Problems

### Invalid Configuration Values

**Diagnosis**:

```javascript
import { validateWorkflowConfig } from "@whatsfresh/shared-imports/workflows/config";

const config = getComponentWorkflowConfig("form");
const validation = validateWorkflowConfig(config);

if (!validation.valid) {
  console.error("Configuration errors:", validation.errors);
}
```

**Solutions**:

1. **Check selectVals.json structure**:

```json
{
  "workflowTimeouts": {
    "name": "workflowTimeouts",
    "choices": [
      {
        "value": "createPlan",
        "label": "Create Plan",
        "timeout": 15000,
        "description": "Plan creation workflow"
      }
    ]
  }
}
```

2. **Validate configuration loading**:

```javascript
import { getWorkflowTimeout } from "@whatsfresh/shared-imports/workflows/config";

// Test configuration loading
const timeout = getWorkflowTimeout("createPlan");
console.log("Loaded timeout:", timeout);

if (timeout === 30000) {
  console.warn("Using default timeout - configuration may not be loaded");
}
```

### Missing Configuration Files

**Diagnosis**:

```javascript
// Check if configuration files exist
import fs from "fs";
import path from "path";

const configPath = path.join(
  process.cwd(),
  "packages/shared-imports/src/architecture/config/selectVals.json"
);

if (!fs.existsSync(configPath)) {
  console.error("Configuration file not found:", configPath);
} else {
  console.log("Configuration file exists");
}
```

**Solutions**:

1. **Ensure file exists and is accessible**
2. **Check file permissions**
3. **Verify JSON syntax**:

```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('selectVals.json', 'utf8')))"
```

## Integration Issues

### Component Integration Problems

**Common Issues**:

- Workflow not executing from component
- Configuration not being applied
- Context not being passed correctly

**Solutions**:

1. **Verify workflow registry import**:

```javascript
// ❌ Incorrect import
import { workflowRegistry } from "wrong-path";

// ✅ Correct import
import { workflowRegistry } from "@whatsfresh/shared-imports/workflows";
```

2. **Check configuration usage**:

```javascript
// ❌ Not using configuration
const result = await workflowRegistry.execute("createUser", context, {
  timeout: 10000, // Hardcoded
});

// ✅ Using configuration
import { getComponentWorkflowConfig } from "@whatsfresh/shared-imports/workflows/config";

const workflowOptions = getComponentWorkflowConfig("form");
const result = await workflowRegistry.execute(
  "createUser",
  context,
  workflowOptions
);
```

3. **Validate context structure**:

```javascript
const handleSubmit = async (formData) => {
  console.log("Form data:", formData); // Debug context

  // Ensure required fields are present
  if (!formData.email || !formData.name) {
    console.error("Missing required fields");
    return;
  }

  const result = await workflowRegistry.execute(
    "createUser",
    formData,
    workflowOptions
  );
};
```

### Database Integration Issues

**Common Issues**:

- Database operations failing
- Transaction rollback problems
- Connection pool exhaustion

**Solutions**:

1. **Add database error handling**:

```javascript
const databaseStep = {
  name: "saveToDatabase",
  execute: async (context) => {
    try {
      const result = await database.save(context.data);
      return { saved: true, id: result.insertId };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Record already exists");
      } else if (error.code === "ER_NO_SUCH_TABLE") {
        throw new Error("Database table not found");
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
  },
};
```

2. **Implement connection retry**:

```javascript
const resilientDatabaseStep = {
  name: "resilientDatabaseOperation",
  execute: async (context) => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        return await database.operation(context.data);
      } catch (error) {
        attempts++;

        if (error.code === "ECONNRESET" && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          continue;
        }

        throw error;
      }
    }
  },
};
```

## Debugging Techniques

### Step-by-Step Debugging

```javascript
// Create debug session
const session = workflowDebugger.createDebugSession("problematicWorkflow", {
  stepMode: true,
  logLevel: "debug",
});

// Add breakpoints
session.stepper.addBreakpoint("problematicStep");
session.stepper.addBreakpoint("anotherStep", "data.value > 100");

// Watch variables
session.watcher.watch("user.id");
session.watcher.watch("processing.stage");

// Start execution trace
const traceId = session.tracer.startTrace();

// Execute workflow
const result = await workflowRegistry.execute("problematicWorkflow", context);

// Stop trace and analyze
const trace = session.tracer.stopTrace(traceId);
console.log(
  "Execution trace:",
  session.tracer.exportTrace(traceId, "timeline")
);

// Clean up
workflowDebugger.stopDebugSession(session.sessionId);
```

### Logging and Monitoring

```javascript
// Enable detailed logging
import { workflowMonitor } from "@whatsfresh/shared-imports/workflows/monitoring";

// Set monitoring thresholds for alerts
workflowMonitor.setThresholds({
  executionTime: 10000, // 10 seconds
  errorRate: 0.05, // 5%
  memoryUsage: 100 * 1024 * 1024, // 100MB
});

// Monitor specific workflow
const logs = workflowMonitor.getExecutionLogs("problematicWorkflow", 20);
logs.forEach((log) => {
  console.log(`Execution ${log.executionId}:`);
  console.log(`  Status: ${log.status}`);
  console.log(`  Duration: ${log.totalDuration}ms`);
  console.log(`  Steps: ${log.steps.length}`);

  if (log.status === "failed") {
    console.log(`  Error: ${log.result.error}`);
    console.log(
      `  Failed at step: ${log.steps.find((s) => !s.success)?.stepName}`
    );
  }
});
```

### Performance Profiling

```javascript
// Run performance test
const perfResult = await workflowTestFramework.performanceTest("slowWorkflow", {
  iterations: 50,
  concurrency: 3,
});

console.log("Performance Results:");
console.log(`Average time: ${perfResult.averageTime}ms`);
console.log(`Min time: ${perfResult.minTime}ms`);
console.log(`Max time: ${perfResult.maxTime}ms`);
console.log(`Success rate: ${perfResult.successRate}%`);

if (perfResult.averageTime > 5000) {
  console.warn("Workflow is performing slowly");
}
```

## Monitoring and Alerts

### Setting Up Alerts

```javascript
// Configure alert thresholds
workflowMonitor.setThresholds({
  executionTime: 30000, // 30 seconds
  errorRate: 0.1, // 10%
  memoryUsage: 200 * 1024 * 1024, // 200MB
});

// Check for alerts regularly
setInterval(() => {
  const criticalAlerts = workflowMonitor.getAlerts("critical");

  if (criticalAlerts.length > 0) {
    console.error(`🚨 ${criticalAlerts.length} critical alerts:`);
    criticalAlerts.forEach((alert) => {
      console.error(`  ${alert.type}: ${JSON.stringify(alert.data)}`);
    });
  }
}, 60000); // Check every minute
```

### Health Monitoring

```javascript
// Regular health checks
async function performHealthChecks() {
  const workflows = ["createUser", "processOrder", "updatePlan"];

  for (const workflowName of workflows) {
    const healthReport = workflowDebugger.generateHealthReport(workflowName);

    if (healthReport.healthScore < 70) {
      console.warn(
        `⚠️  ${workflowName} health score: ${healthReport.healthScore}/100`
      );
      console.warn("Recommendations:", healthReport.recommendations);
    }
  }
}

// Run health checks every 5 minutes
setInterval(performHealthChecks, 5 * 60 * 1000);
```

## Best Practices for Prevention

### 1. Comprehensive Testing

```javascript
// Test all scenarios
describe("Workflow Tests", () => {
  it("should handle happy path", async () => {
    // Test successful execution
  });

  it("should handle validation errors", async () => {
    // Test input validation
  });

  it("should handle timeout scenarios", async () => {
    // Test timeout handling
  });

  it("should handle database errors", async () => {
    // Test database failure scenarios
  });

  it("should perform within limits", async () => {
    // Performance testing
  });
});
```

### 2. Proper Error Handling

```javascript
const robustWorkflow = {
  name: "robustWorkflow",
  steps: [
    {
      name: "validateInput",
      execute: async (context) => {
        // Comprehensive validation
        const errors = [];

        if (!context.email) errors.push("Email is required");
        if (!context.name) errors.push("Name is required");

        if (errors.length > 0) {
          throw new Error(`Validation failed: ${errors.join(", ")}`);
        }

        return { validated: true };
      },
    },
    {
      name: "processData",
      execute: async (context) => {
        try {
          return await processUserData(context);
        } catch (error) {
          // Add context to error
          error.step = "processData";
          error.context = { userId: context.id };
          throw error;
        }
      },
    },
  ],
};
```

### 3. Configuration Management

```javascript
// Always use configuration
import {
  getComponentWorkflowConfig,
  getWorkflowTimeout,
} from "@whatsfresh/shared-imports/workflows/config";

// ✅ Good
const config = getComponentWorkflowConfig("form");
const timeout = getWorkflowTimeout("createUser");

// ❌ Bad
const hardcodedConfig = { timeout: 10000 };
```

### 4. Monitoring Integration

```javascript
// Enable monitoring for all workflows
workflowRegistry.use(async (phase, context, definition, result) => {
  if (phase === "before") {
    console.log(`Starting workflow: ${definition.name}`);
  } else if (phase === "after") {
    if (!result.success) {
      console.error(`Workflow failed: ${definition.name}`, result.error);
    }
  }
});
```

### 5. Documentation and Comments

```javascript
const documentedWorkflow = {
  name: "documentedWorkflow",
  description: "Processes user registration with validation and notifications",
  steps: [
    {
      name: "validateInput",
      // Purpose: Ensure all required fields are present and valid
      // Input: context.email, context.name, context.phone
      // Output: { validated: true, normalizedData: {...} }
      execute: async (context) => {
        // Implementation
      },
    },
  ],
};
```

---

## Getting Help

If you're still experiencing issues after following this guide:

1. **Check the logs**: Look at workflow execution logs and system logs
2. **Use the debugging tools**: Create debug sessions and analyze execution patterns
3. **Review the documentation**: Check the main README and API documentation
4. **Test in isolation**: Create minimal test cases to isolate the problem
5. **Check configuration**: Verify all configuration files are correct and accessible

For additional support, refer to the main [README](./README.md) or create a detailed issue report with:

- Workflow definition
- Execution context
- Error messages
- System configuration
- Steps to reproduce
