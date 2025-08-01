/**
 * Workflow Test Framework
 *
 * Comprehensive testing utilities for workflow execution, mocking, and integration testing
 */

import { createLogger } from "@whatsfresh/shared-imports";
import { WorkflowRegistry } from "../WorkflowRegistry.js";
import { WorkflowInstance } from "../WorkflowInstance.js";

const log = createLogger("WorkflowTestFramework");

export class WorkflowTestFramework {
  constructor() {
    this.testRegistry = new WorkflowRegistry();
    this.mockDatabase = new Map();
    this.executionHistory = [];
    this.mockServices = new Map();
    this.testScenarios = new Map();
  }

  /**
   * Create a test workflow registry isolated from production
   * @returns {WorkflowRegistry} Test registry instance
   */
  createTestRegistry() {
    const testRegistry = new WorkflowRegistry();

    // Add test-specific middleware
    testRegistry.use(async (phase, context, definition, result) => {
      if (phase === "before") {
        context._testExecution = true;
        context._testStartTime = Date.now();
      } else if (phase === "after") {
        this.recordTestExecution(definition.name, context, result);
      }
      return context;
    });

    return testRegistry;
  }

  /**
   * Create mock database operations
   * @param {Object} mockData - Initial mock data
   * @returns {Object} Mock database interface
   */
  createMockDatabase(mockData = {}) {
    const mockDb = {
      data: new Map(Object.entries(mockData)),

      async execDml(operation) {
        const { method, table, data, where } = operation;

        switch (method.toUpperCase()) {
          case "INSERT":
            const id = Date.now();
            const record = {
              id,
              ...data,
              created_at: new Date().toISOString(),
            };

            if (!mockDb.data.has(table)) {
              mockDb.data.set(table, []);
            }
            mockDb.data.get(table).push(record);

            return { success: true, insertId: id, data: record };

          case "UPDATE":
            if (!mockDb.data.has(table)) {
              return { success: false, error: "Table not found" };
            }

            const records = mockDb.data.get(table);
            const updated = records.map((record) => {
              if (this.matchesWhere(record, where)) {
                return {
                  ...record,
                  ...data,
                  updated_at: new Date().toISOString(),
                };
              }
              return record;
            });

            mockDb.data.set(table, updated);
            return { success: true, affectedRows: updated.length };

          case "DELETE":
            if (!mockDb.data.has(table)) {
              return { success: false, error: "Table not found" };
            }

            const remaining = mockDb.data
              .get(table)
              .filter((record) => !this.matchesWhere(record, where));

            const deletedCount =
              mockDb.data.get(table).length - remaining.length;
            mockDb.data.set(table, remaining);

            return { success: true, affectedRows: deletedCount };

          case "SELECT":
          default:
            if (!mockDb.data.has(table)) {
              return [];
            }

            let results = mockDb.data.get(table);
            if (where) {
              results = results.filter((record) =>
                this.matchesWhere(record, where)
              );
            }

            return results;
        }
      },

      async execEvent(eventType, params = {}) {
        // Mock event execution
        const mockResults = mockDb.data.get(`event_${eventType}`) || [];
        return mockResults;
      },

      // Helper methods
      setTableData(table, data) {
        mockDb.data.set(table, Array.isArray(data) ? data : [data]);
      },

      getTableData(table) {
        return mockDb.data.get(table) || [];
      },

      clearTable(table) {
        mockDb.data.delete(table);
      },

      clearAll() {
        mockDb.data.clear();
      },
    };

    this.mockDatabase = mockDb;
    return mockDb;
  }

  /**
   * Check if record matches WHERE clause
   * @private
   */
  matchesWhere(record, where) {
    if (!where) return true;

    return Object.entries(where).every(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // Handle operators like { $gt: 5 }, { $in: [1,2,3] }
        return Object.entries(value).every(([op, opValue]) => {
          switch (op) {
            case "$gt":
              return record[key] > opValue;
            case "$lt":
              return record[key] < opValue;
            case "$gte":
              return record[key] >= opValue;
            case "$lte":
              return record[key] <= opValue;
            case "$in":
              return Array.isArray(opValue) && opValue.includes(record[key]);
            case "$ne":
              return record[key] !== opValue;
            default:
              return record[key] === opValue;
          }
        });
      }
      return record[key] === value;
    });
  }

  /**
   * Create mock external services
   * @param {Object} services - Service definitions
   * @returns {Object} Mock services
   */
  createMockServices(services = {}) {
    const mockServices = {};

    Object.entries(services).forEach(([serviceName, config]) => {
      mockServices[serviceName] = {
        calls: [],
        responses: config.responses || [],
        errors: config.errors || [],

        async call(method, params) {
          const call = {
            method,
            params,
            timestamp: new Date(),
            callId: `${serviceName}_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 5)}`,
          };

          mockServices[serviceName].calls.push(call);

          // Check for configured errors
          const errorConfig = mockServices[serviceName].errors.find(
            (e) => e.method === method || e.method === "*"
          );

          if (errorConfig && Math.random() < (errorConfig.probability || 1)) {
            throw new Error(errorConfig.message || "Mock service error");
          }

          // Return configured response
          const responseConfig = mockServices[serviceName].responses.find(
            (r) => r.method === method || r.method === "*"
          );

          if (responseConfig) {
            return typeof responseConfig.data === "function"
              ? responseConfig.data(params)
              : responseConfig.data;
          }

          // Default response
          return { success: true, mockCall: true, params };
        },

        getCalls(method = null) {
          return method
            ? mockServices[serviceName].calls.filter((c) => c.method === method)
            : mockServices[serviceName].calls;
        },

        clearCalls() {
          mockServices[serviceName].calls = [];
        },
      };
    });

    this.mockServices = mockServices;
    return mockServices;
  }

  /**
   * Create test workflow with mocked dependencies
   * @param {string} name - Workflow name
   * @param {Object} definition - Workflow definition
   * @param {Object} mocks - Mock configurations
   */
  createTestWorkflow(name, definition, mocks = {}) {
    const testWorkflow = {
      ...definition,
      name,
      _isTestWorkflow: true,
      _mocks: mocks,
    };

    // Wrap steps with mock injection
    testWorkflow.steps = definition.steps.map((step) => ({
      ...step,
      execute: async (context, state) => {
        // Inject mocks into context
        const testContext = {
          ...context,
          _mocks: {
            database: this.mockDatabase,
            services: this.mockServices,
            ...mocks,
          },
        };

        return step.execute(testContext, state);
      },
    }));

    this.testRegistry.register(name, testWorkflow);
    return testWorkflow;
  }

  /**
   * Execute workflow with test environment
   * @param {string} workflowName - Workflow name
   * @param {Object} context - Test context
   * @param {Object} options - Test options
   */
  async executeTestWorkflow(workflowName, context = {}, options = {}) {
    const testOptions = {
      timeout: 5000, // Shorter timeout for tests
      enableProgressTracking: false,
      ...options,
    };

    const testContext = {
      ...context,
      _isTest: true,
      _testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    const result = await this.testRegistry.execute(
      workflowName,
      testContext,
      testOptions
    );

    // Record execution for analysis
    this.executionHistory.push({
      workflowName,
      context: testContext,
      result,
      timestamp: new Date(),
      duration: result.duration,
    });

    return result;
  }

  /**
   * Create integration test scenario
   * @param {string} scenarioName - Scenario name
   * @param {Object} scenario - Scenario definition
   */
  createTestScenario(scenarioName, scenario) {
    const testScenario = {
      name: scenarioName,
      description: scenario.description,
      setup: scenario.setup || (() => {}),
      teardown: scenario.teardown || (() => {}),
      steps: scenario.steps || [],
      assertions: scenario.assertions || [],
      timeout: scenario.timeout || 30000,
    };

    this.testScenarios.set(scenarioName, testScenario);
    return testScenario;
  }

  /**
   * Execute integration test scenario
   * @param {string} scenarioName - Scenario name
   * @param {Object} context - Test context
   */
  async executeTestScenario(scenarioName, context = {}) {
    const scenario = this.testScenarios.get(scenarioName);
    if (!scenario) {
      throw new Error(`Test scenario '${scenarioName}' not found`);
    }

    const scenarioContext = {
      ...context,
      _scenario: scenarioName,
      _scenarioStartTime: Date.now(),
    };

    const results = {
      scenario: scenarioName,
      success: true,
      steps: [],
      assertions: [],
      errors: [],
      duration: 0,
    };

    try {
      // Setup
      if (scenario.setup) {
        await scenario.setup(scenarioContext);
      }

      // Execute steps
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        const stepStartTime = Date.now();

        try {
          const stepResult = await this.executeTestStep(step, scenarioContext);
          results.steps.push({
            name: step.name,
            success: true,
            result: stepResult,
            duration: Date.now() - stepStartTime,
          });
        } catch (error) {
          results.steps.push({
            name: step.name,
            success: false,
            error: error.message,
            duration: Date.now() - stepStartTime,
          });
          results.errors.push(error);
          results.success = false;
        }
      }

      // Execute assertions
      for (const assertion of scenario.assertions) {
        try {
          const assertionResult = await assertion(scenarioContext, results);
          results.assertions.push({
            description: assertion.description || "Assertion",
            success: true,
            result: assertionResult,
          });
        } catch (error) {
          results.assertions.push({
            description: assertion.description || "Assertion",
            success: false,
            error: error.message,
          });
          results.errors.push(error);
          results.success = false;
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(error);
    } finally {
      // Teardown
      if (scenario.teardown) {
        try {
          await scenario.teardown(scenarioContext);
        } catch (error) {
          results.errors.push(error);
        }
      }

      results.duration = Date.now() - scenarioContext._scenarioStartTime;
    }

    return results;
  }

  /**
   * Execute individual test step
   * @private
   */
  async executeTestStep(step, context) {
    if (step.workflow) {
      return this.executeTestWorkflow(
        step.workflow,
        step.context || context,
        step.options
      );
    } else if (step.execute) {
      return step.execute(context);
    } else {
      throw new Error(`Invalid test step: ${step.name}`);
    }
  }

  /**
   * Create performance test for workflow
   * @param {string} workflowName - Workflow name
   * @param {Object} options - Performance test options
   */
  async performanceTest(workflowName, options = {}) {
    const {
      iterations = 10,
      concurrency = 1,
      context = {},
      warmupIterations = 2,
    } = options;

    const results = {
      workflow: workflowName,
      iterations,
      concurrency,
      warmupTime: 0,
      executionTimes: [],
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      successRate: 0,
      errors: [],
    };

    // Warmup
    const warmupStart = Date.now();
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await this.executeTestWorkflow(workflowName, context);
      } catch (error) {
        // Ignore warmup errors
      }
    }
    results.warmupTime = Date.now() - warmupStart;

    // Performance test execution
    const executeIteration = async () => {
      const startTime = Date.now();
      try {
        await this.executeTestWorkflow(workflowName, context);
        return { success: true, duration: Date.now() - startTime };
      } catch (error) {
        return { success: false, duration: Date.now() - startTime, error };
      }
    };

    // Execute with specified concurrency
    const batches = [];
    for (let i = 0; i < iterations; i += concurrency) {
      const batchSize = Math.min(concurrency, iterations - i);
      const batch = Array.from({ length: batchSize }, executeIteration);
      batches.push(Promise.all(batch));
    }

    const batchResults = await Promise.all(batches);
    const allResults = batchResults.flat();

    // Process results
    let successCount = 0;
    allResults.forEach((result) => {
      results.executionTimes.push(result.duration);
      results.minTime = Math.min(results.minTime, result.duration);
      results.maxTime = Math.max(results.maxTime, result.duration);

      if (result.success) {
        successCount++;
      } else {
        results.errors.push(result.error);
      }
    });

    results.averageTime =
      results.executionTimes.reduce((a, b) => a + b, 0) /
      results.executionTimes.length;
    results.successRate = (successCount / iterations) * 100;

    return results;
  }

  /**
   * Record test execution for analysis
   * @private
   */
  recordTestExecution(workflowName, context, result) {
    this.executionHistory.push({
      workflowName,
      context: this.sanitizeContext(context),
      result: {
        success: result.success,
        duration: result.duration,
        error: result.error?.message,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Get test execution statistics
   * @param {string} workflowName - Optional workflow filter
   */
  getTestStats(workflowName = null) {
    const filteredHistory = workflowName
      ? this.executionHistory.filter((h) => h.workflowName === workflowName)
      : this.executionHistory;

    const totalExecutions = filteredHistory.length;
    const successfulExecutions = filteredHistory.filter(
      (h) => h.result.success
    ).length;
    const averageDuration =
      filteredHistory.reduce((sum, h) => sum + (h.result.duration || 0), 0) /
      totalExecutions;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions: totalExecutions - successfulExecutions,
      successRate:
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0,
      averageDuration,
      recentExecutions: filteredHistory.slice(-10),
    };
  }

  /**
   * Reset test framework state
   */
  reset() {
    this.testRegistry.clear();
    this.mockDatabase.clearAll();
    this.executionHistory = [];
    this.testScenarios.clear();
    Object.values(this.mockServices).forEach((service) => service.clearCalls());
  }

  /**
   * Sanitize context for logging
   * @private
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

// Export singleton instance for convenience
export const workflowTestFramework = new WorkflowTestFramework();
export default workflowTestFramework;
