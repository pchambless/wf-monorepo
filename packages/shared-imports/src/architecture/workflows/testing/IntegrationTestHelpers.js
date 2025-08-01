/**
 * Integration Test Helpers
 *
 * Utilities for testing workflow chains, end-to-end scenarios, and system integration
 */

import { workflowTestFramework } from "./WorkflowTestFramework.js";
import { workflowIntegrator } from "../integration/WorkflowIntegrator.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("IntegrationTestHelpers");

/**
 * Create end-to-end test scenario for complete workflow chains
 */
export class EndToEndTestBuilder {
  constructor(scenarioName) {
    this.scenarioName = scenarioName;
    this.setupSteps = [];
    this.workflowSteps = [];
    this.assertionSteps = [];
    this.teardownSteps = [];
    this.testData = {};
  }

  /**
   * Add setup step
   * @param {string} name - Step name
   * @param {Function} setupFn - Setup function
   */
  setup(name, setupFn) {
    this.setupSteps.push({ name, execute: setupFn });
    return this;
  }

  /**
   * Add workflow execution step
   * @param {string} workflowName - Workflow to execute
   * @param {Object} context - Workflow context
   * @param {Object} options - Workflow options
   */
  executeWorkflow(workflowName, context = {}, options = {}) {
    this.workflowSteps.push({
      name: `execute_${workflowName}`,
      workflow: workflowName,
      context,
      options,
    });
    return this;
  }

  /**
   * Add workflow integration step
   * @param {string} integrationId - Integration ID
   * @param {Object} context - Integration context
   */
  executeIntegration(integrationId, context = {}) {
    this.workflowSteps.push({
      name: `integration_${integrationId}`,
      execute: async (testContext) => {
        return workflowIntegrator.executeIntegration(integrationId, {
          ...context,
          ...testContext,
        });
      },
    });
    return this;
  }

  /**
   * Add assertion step
   * @param {string} description - Assertion description
   * @param {Function} assertionFn - Assertion function
   */
  assert(description, assertionFn) {
    assertionFn.description = description;
    this.assertionSteps.push(assertionFn);
    return this;
  }

  /**
   * Add teardown step
   * @param {string} name - Step name
   * @param {Function} teardownFn - Teardown function
   */
  teardown(name, teardownFn) {
    this.teardownSteps.push({ name, execute: teardownFn });
    return this;
  }

  /**
   * Set test data
   * @param {Object} data - Test data
   */
  withTestData(data) {
    this.testData = { ...this.testData, ...data };
    return this;
  }

  /**
   * Build and register the test scenario
   */
  build() {
    const scenario = {
      description: `End-to-end test: ${this.scenarioName}`,
      setup: async (context) => {
        context.testData = { ...this.testData };
        for (const step of this.setupSteps) {
          await step.execute(context);
        }
      },
      steps: this.workflowSteps,
      assertions: this.assertionSteps,
      teardown: async (context) => {
        for (const step of this.teardownSteps) {
          await step.execute(context);
        }
      },
    };

    return workflowTestFramework.createTestScenario(
      this.scenarioName,
      scenario
    );
  }
}

/**
 * Database integration test helpers
 */
export class DatabaseTestHelpers {
  constructor(mockDatabase) {
    this.mockDb = mockDatabase;
  }

  /**
   * Setup test data for database operations
   * @param {Object} tableData - Data organized by table name
   */
  setupTestData(tableData) {
    Object.entries(tableData).forEach(([table, data]) => {
      this.mockDb.setTableData(table, data);
    });
  }

  /**
   * Create assertion for database state
   * @param {string} table - Table name
   * @param {Function} assertion - Assertion function
   */
  assertDatabaseState(table, assertion) {
    return (context) => {
      const tableData = this.mockDb.getTableData(table);
      return assertion(tableData, context);
    };
  }

  /**
   * Assert record exists in table
   * @param {string} table - Table name
   * @param {Object} criteria - Search criteria
   */
  assertRecordExists(table, criteria) {
    return this.assertDatabaseState(table, (data) => {
      const found = data.find((record) =>
        Object.entries(criteria).every(([key, value]) => record[key] === value)
      );
      if (!found) {
        throw new Error(
          `Record not found in ${table}: ${JSON.stringify(criteria)}`
        );
      }
      return found;
    });
  }

  /**
   * Assert record count in table
   * @param {string} table - Table name
   * @param {number} expectedCount - Expected count
   */
  assertRecordCount(table, expectedCount) {
    return this.assertDatabaseState(table, (data) => {
      if (data.length !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} records in ${table}, found ${data.length}`
        );
      }
      return data.length;
    });
  }

  /**
   * Clear all test data
   */
  clearTestData() {
    this.mockDb.clearAll();
  }
}

/**
 * API integration test helpers
 */
export class ApiTestHelpers {
  constructor(mockServices) {
    this.mockServices = mockServices;
  }

  /**
   * Setup API mock responses
   * @param {string} serviceName - Service name
   * @param {Array} responses - Response configurations
   */
  setupApiResponses(serviceName, responses) {
    if (!this.mockServices[serviceName]) {
      this.mockServices[serviceName] = { responses: [], errors: [], calls: [] };
    }
    this.mockServices[serviceName].responses = responses;
  }

  /**
   * Setup API error scenarios
   * @param {string} serviceName - Service name
   * @param {Array} errors - Error configurations
   */
  setupApiErrors(serviceName, errors) {
    if (!this.mockServices[serviceName]) {
      this.mockServices[serviceName] = { responses: [], errors: [], calls: [] };
    }
    this.mockServices[serviceName].errors = errors;
  }

  /**
   * Assert API was called
   * @param {string} serviceName - Service name
   * @param {string} method - Method name
   * @param {number} expectedCalls - Expected call count
   */
  assertApiCalled(serviceName, method, expectedCalls = 1) {
    return (context) => {
      const service = this.mockServices[serviceName];
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      const calls = service.getCalls(method);
      if (calls.length !== expectedCalls) {
        throw new Error(
          `Expected ${expectedCalls} calls to ${serviceName}.${method}, found ${calls.length}`
        );
      }
      return calls;
    };
  }

  /**
   * Assert API was called with specific parameters
   * @param {string} serviceName - Service name
   * @param {string} method - Method name
   * @param {Object} expectedParams - Expected parameters
   */
  assertApiCalledWith(serviceName, method, expectedParams) {
    return (context) => {
      const service = this.mockServices[serviceName];
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      const calls = service.getCalls(method);
      const matchingCall = calls.find((call) =>
        this.deepEqual(call.params, expectedParams)
      );

      if (!matchingCall) {
        throw new Error(
          `No call to ${serviceName}.${method} with expected parameters: ${JSON.stringify(
            expectedParams
          )}`
        );
      }
      return matchingCall;
    };
  }

  /**
   * Deep equality check for objects
   * @private
   */
  deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 === "object") {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      return keys1.every(
        (key) => keys2.includes(key) && this.deepEqual(obj1[key], obj2[key])
      );
    }

    return obj1 === obj2;
  }
}

/**
 * Workflow chain test helpers
 */
export class WorkflowChainTestHelpers {
  constructor() {
    this.chains = new Map();
  }

  /**
   * Create workflow chain test
   * @param {string} chainName - Chain name
   * @param {Array} workflows - Workflow sequence
   * @param {Object} options - Chain options
   */
  createChainTest(chainName, workflows, options = {}) {
    const chain = {
      name: chainName,
      workflows,
      options: {
        stopOnError: true,
        passDataBetween: true,
        ...options,
      },
    };

    this.chains.set(chainName, chain);
    return chain;
  }

  /**
   * Execute workflow chain
   * @param {string} chainName - Chain name
   * @param {Object} initialContext - Initial context
   */
  async executeChain(chainName, initialContext = {}) {
    const chain = this.chains.get(chainName);
    if (!chain) {
      throw new Error(`Workflow chain '${chainName}' not found`);
    }

    const results = [];
    let currentContext = { ...initialContext };

    for (let i = 0; i < chain.workflows.length; i++) {
      const workflowName = chain.workflows[i];

      try {
        const result = await workflowTestFramework.executeTestWorkflow(
          workflowName,
          currentContext
        );

        results.push({
          workflow: workflowName,
          success: result.success,
          data: result.data,
          duration: result.duration,
        });

        if (!result.success && chain.options.stopOnError) {
          break;
        }

        if (chain.options.passDataBetween && result.success) {
          currentContext = { ...currentContext, ...result.data };
        }
      } catch (error) {
        results.push({
          workflow: workflowName,
          success: false,
          error: error.message,
          duration: 0,
        });

        if (chain.options.stopOnError) {
          break;
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      chain: chainName,
      success: successCount === chain.workflows.length,
      results,
      summary: {
        total: chain.workflows.length,
        successful: successCount,
        failed: chain.workflows.length - successCount,
        totalDuration,
      },
    };
  }

  /**
   * Assert chain execution results
   * @param {Object} chainResult - Chain execution result
   * @param {Object} expectations - Expected results
   */
  assertChainResults(chainResult, expectations) {
    if (expectations.success !== undefined) {
      if (chainResult.success !== expectations.success) {
        throw new Error(
          `Expected chain success: ${expectations.success}, got: ${chainResult.success}`
        );
      }
    }

    if (expectations.successfulSteps !== undefined) {
      if (chainResult.summary.successful !== expectations.successfulSteps) {
        throw new Error(
          `Expected ${expectations.successfulSteps} successful steps, got: ${chainResult.summary.successful}`
        );
      }
    }

    if (expectations.maxDuration !== undefined) {
      if (chainResult.summary.totalDuration > expectations.maxDuration) {
        throw new Error(
          `Chain took too long: ${chainResult.summary.totalDuration}ms > ${expectations.maxDuration}ms`
        );
      }
    }

    return true;
  }
}

/**
 * Performance test helpers
 */
export class PerformanceTestHelpers {
  /**
   * Create load test for workflow
   * @param {string} workflowName - Workflow name
   * @param {Object} loadConfig - Load test configuration
   */
  async createLoadTest(workflowName, loadConfig = {}) {
    const {
      duration = 60000, // 1 minute
      rampUpTime = 10000, // 10 seconds
      maxConcurrency = 10,
      context = {},
    } = loadConfig;

    const results = {
      workflow: workflowName,
      duration,
      maxConcurrency,
      executions: [],
      errors: [],
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        requestsPerSecond: 0,
      },
    };

    const startTime = Date.now();
    const endTime = startTime + duration;
    let currentConcurrency = 1;
    const activePromises = new Set();

    // Ramp up concurrency gradually
    const rampUpInterval = setInterval(() => {
      if (currentConcurrency < maxConcurrency) {
        currentConcurrency++;
      }
    }, rampUpTime / maxConcurrency);

    // Execute load test
    while (Date.now() < endTime) {
      // Maintain target concurrency
      while (activePromises.size < currentConcurrency && Date.now() < endTime) {
        const executionPromise = this.executeWithMetrics(workflowName, context)
          .then((result) => {
            results.executions.push(result);
            if (!result.success) {
              results.errors.push(result.error);
            }
          })
          .finally(() => {
            activePromises.delete(executionPromise);
          });

        activePromises.add(executionPromise);
      }

      // Small delay to prevent tight loop
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    clearInterval(rampUpInterval);

    // Wait for remaining executions to complete
    await Promise.all(Array.from(activePromises));

    // Calculate metrics
    this.calculateLoadTestMetrics(results);

    return results;
  }

  /**
   * Execute workflow with performance metrics
   * @private
   */
  async executeWithMetrics(workflowName, context) {
    const startTime = Date.now();

    try {
      const result = await workflowTestFramework.executeTestWorkflow(
        workflowName,
        context
      );
      const duration = Date.now() - startTime;

      return {
        success: result.success,
        duration,
        timestamp: startTime,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        duration,
        timestamp: startTime,
        error: error.message,
      };
    }
  }

  /**
   * Calculate load test metrics
   * @private
   */
  calculateLoadTestMetrics(results) {
    const { executions } = results;
    const successful = executions.filter((e) => e.success);
    const failed = executions.filter((e) => !e.success);

    results.metrics.totalRequests = executions.length;
    results.metrics.successfulRequests = successful.length;
    results.metrics.failedRequests = failed.length;

    if (executions.length > 0) {
      const durations = executions.map((e) => e.duration);
      results.metrics.averageResponseTime =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      results.metrics.minResponseTime = Math.min(...durations);
      results.metrics.maxResponseTime = Math.max(...durations);
      results.metrics.requestsPerSecond =
        (executions.length / results.duration) * 1000;
    }
  }
}

// Export helper instances
export const endToEndTestBuilder = (scenarioName) =>
  new EndToEndTestBuilder(scenarioName);
export const databaseTestHelpers = new DatabaseTestHelpers(
  workflowTestFramework.mockDatabase
);
export const apiTestHelpers = new ApiTestHelpers(
  workflowTestFramework.mockServices
);
export const workflowChainTestHelpers = new WorkflowChainTestHelpers();
export const performanceTestHelpers = new PerformanceTestHelpers();

export default {
  EndToEndTestBuilder,
  DatabaseTestHelpers,
  ApiTestHelpers,
  WorkflowChainTestHelpers,
  PerformanceTestHelpers,
  endToEndTestBuilder,
  databaseTestHelpers,
  apiTestHelpers,
  workflowChainTestHelpers,
  performanceTestHelpers,
};
