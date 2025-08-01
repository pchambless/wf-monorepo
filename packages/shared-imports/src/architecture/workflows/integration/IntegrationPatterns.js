/**
 * Integration Patterns
 *
 * Common workflow integration patterns and utilities
 */

import { workflowIntegrator } from "./WorkflowIntegrator.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("IntegrationPatterns");

/**
 * Request-Response Pattern
 * One workflow sends a request and waits for a response from another
 */
export class RequestResponsePattern {
  constructor(requestWorkflow, responseWorkflow, options = {}) {
    this.requestWorkflow = requestWorkflow;
    this.responseWorkflow = responseWorkflow;
    this.timeout = options.timeout || 10000;
    this.correlationField = options.correlationField || "correlationId";
  }

  async execute(context) {
    const correlationId =
      context[this.correlationField] || this.generateCorrelationId();
    const channelId = `request-response-${correlationId}`;

    // Create communication channel
    workflowIntegrator.createCommunicationChannel(channelId);

    // Set up response listener
    const responsePromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Request-response timeout"));
      }, this.timeout);

      workflowIntegrator.subscribe(channelId, "response", (message) => {
        clearTimeout(timeoutId);
        resolve(message.data);
      });
    });

    // Execute request workflow
    const { workflowRegistry } = await import("../WorkflowRegistry.js");
    const requestResult = await workflowRegistry.execute(this.requestWorkflow, {
      ...context,
      [this.correlationField]: correlationId,
      responseChannel: channelId,
    });

    if (!requestResult.success) {
      throw new Error(
        `Request workflow failed: ${requestResult.error?.message}`
      );
    }

    // Execute response workflow
    const responseContext = {
      ...context,
      requestResult: requestResult.data,
      [this.correlationField]: correlationId,
      responseChannel: channelId,
    };

    const responseWorkflowPromise = workflowRegistry.execute(
      this.responseWorkflow,
      responseContext
    );

    // Wait for both response workflow and response message
    const [responseResult, responseData] = await Promise.all([
      responseWorkflowPromise,
      responsePromise,
    ]);

    // Cleanup
    await workflowIntegrator.cleanupIntegration(channelId);

    return {
      request: requestResult.data,
      response: responseData,
      correlationId,
    };
  }

  generateCorrelationId() {
    return `req-resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Publish-Subscribe Pattern
 * One workflow publishes events that multiple workflows can subscribe to
 */
export class PublishSubscribePattern {
  constructor(publisherWorkflow, subscriberWorkflows, options = {}) {
    this.publisherWorkflow = publisherWorkflow;
    this.subscriberWorkflows = subscriberWorkflows;
    this.topic = options.topic || "default";
    this.channelId = options.channelId || `pubsub-${this.topic}`;
  }

  async execute(context) {
    // Create communication channel
    workflowIntegrator.createCommunicationChannel(this.channelId);

    // Set up subscribers
    const subscriberPromises = this.subscriberWorkflows.map(
      async (subscriberWorkflow) => {
        return new Promise((resolve, reject) => {
          workflowIntegrator.subscribe(
            this.channelId,
            this.topic,
            async (message) => {
              try {
                const { workflowRegistry } = await import(
                  "../WorkflowRegistry.js"
                );
                const result = await workflowRegistry.execute(
                  subscriberWorkflow,
                  {
                    ...context,
                    publishedData: message.data,
                    topic: this.topic,
                  }
                );
                resolve({ workflow: subscriberWorkflow, result });
              } catch (error) {
                reject({ workflow: subscriberWorkflow, error });
              }
            }
          );
        });
      }
    );

    // Execute publisher workflow
    const { workflowRegistry } = await import("../WorkflowRegistry.js");
    const publisherResult = await workflowRegistry.execute(
      this.publisherWorkflow,
      {
        ...context,
        publishChannel: this.channelId,
        publishTopic: this.topic,
      }
    );

    if (!publisherResult.success) {
      throw new Error(
        `Publisher workflow failed: ${publisherResult.error?.message}`
      );
    }

    // Wait for all subscribers to process
    const subscriberResults = await Promise.allSettled(subscriberPromises);

    return {
      publisher: publisherResult.data,
      subscribers: subscriberResults.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
}

/**
 * Saga Pattern
 * Manages distributed transactions with compensating actions
 */
export class SagaPattern {
  constructor(steps, options = {}) {
    this.steps = steps; // Array of { workflow, compensate? }
    this.options = {
      failureStrategy: "rollback", // 'rollback' or 'continue'
      ...options,
    };
  }

  async execute(context) {
    const executedSteps = [];
    const results = [];

    try {
      // Execute steps sequentially
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];

        log.debug("Executing saga step", {
          step: i + 1,
          workflow: step.workflow,
          totalSteps: this.steps.length,
        });

        const { workflowRegistry } = await import("../WorkflowRegistry.js");
        const stepResult = await workflowRegistry.execute(step.workflow, {
          ...context,
          sagaStep: i + 1,
          previousResults: results,
        });

        if (!stepResult.success) {
          throw new Error(
            `Saga step ${i + 1} (${step.workflow}) failed: ${
              stepResult.error?.message
            }`
          );
        }

        executedSteps.push({ step, result: stepResult });
        results.push(stepResult.data);

        // Register rollback handler if compensate action is provided
        if (step.compensate) {
          workflowIntegrator.registerRollbackHandler(
            step.workflow,
            async (rollbackData, rollbackContext) => {
              await workflowRegistry.execute(step.compensate, {
                ...rollbackContext,
                rollbackData,
                originalResult: stepResult.data,
              });
            }
          );
        }
      }

      return {
        success: true,
        results,
        executedSteps: executedSteps.length,
      };
    } catch (error) {
      log.error("Saga execution failed", {
        error: error.message,
        executedSteps: executedSteps.length,
        totalSteps: this.steps.length,
      });

      // Perform compensation if rollback strategy is enabled
      if (this.options.failureStrategy === "rollback") {
        await this.performCompensation(executedSteps, context);
      }

      return {
        success: false,
        error: error.message,
        results,
        executedSteps: executedSteps.length,
        compensationPerformed: this.options.failureStrategy === "rollback",
      };
    }
  }

  async performCompensation(executedSteps, context) {
    log.info("Performing saga compensation", {
      stepsToCompensate: executedSteps.length,
    });

    // Execute compensation actions in reverse order
    const compensationPromises = executedSteps
      .reverse()
      .filter(({ step }) => step.compensate)
      .map(async ({ step, result }) => {
        try {
          const { workflowRegistry } = await import("../WorkflowRegistry.js");
          await workflowRegistry.execute(step.compensate, {
            ...context,
            compensationData: result.data,
            originalResult: result.data,
          });

          log.debug("Compensation completed", {
            workflow: step.workflow,
            compensateWorkflow: step.compensate,
          });
        } catch (error) {
          log.error("Compensation failed", {
            workflow: step.workflow,
            compensateWorkflow: step.compensate,
            error: error.message,
          });
        }
      });

    await Promise.allSettled(compensationPromises);
  }
}

/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by monitoring workflow health
 */
export class CircuitBreakerPattern {
  constructor(workflow, options = {}) {
    this.workflow = workflow;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.monitoringWindow = options.monitoringWindow || 300000; // 5 minutes

    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(context) {
    // Check circuit breaker state
    this.updateState();

    if (this.state === "OPEN") {
      throw new Error("Circuit breaker is OPEN - workflow execution blocked");
    }

    try {
      const { workflowRegistry } = await import("../WorkflowRegistry.js");
      const result = await workflowRegistry.execute(this.workflow, context);

      if (!result.success) {
        this.recordFailure();
        throw new Error(`Workflow failed: ${result.error?.message}`);
      }

      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  updateState() {
    const now = Date.now();

    // Remove old failures outside monitoring window
    this.failures = this.failures.filter(
      (failureTime) => now - failureTime < this.monitoringWindow
    );

    switch (this.state) {
      case "CLOSED":
        if (this.failures.length >= this.failureThreshold) {
          this.state = "OPEN";
          this.lastFailureTime = now;
          log.warn("Circuit breaker opened", {
            workflow: this.workflow,
            failures: this.failures.length,
          });
        }
        break;

      case "OPEN":
        if (now - this.lastFailureTime > this.recoveryTimeout) {
          this.state = "HALF_OPEN";
          this.successCount = 0;
          log.info("Circuit breaker half-opened", {
            workflow: this.workflow,
          });
        }
        break;

      case "HALF_OPEN":
        // Will transition based on next execution result
        break;
    }
  }

  recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      log.warn("Circuit breaker re-opened after half-open failure", {
        workflow: this.workflow,
      });
    }
  }

  recordSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= 3) {
        // Require 3 successes to close
        this.state = "CLOSED";
        this.failures = [];
        log.info("Circuit breaker closed after successful recovery", {
          workflow: this.workflow,
        });
      }
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount,
    };
  }
}

/**
 * Bulkhead Pattern
 * Isolates workflow resources to prevent resource exhaustion
 */
export class BulkheadPattern {
  constructor(workflows, options = {}) {
    this.workflows = workflows;
    this.maxConcurrent = options.maxConcurrent || 3;
    this.queueSize = options.queueSize || 10;
    this.timeout = options.timeout || 30000;

    this.activeExecutions = 0;
    this.queue = [];
  }

  async execute(workflowName, context) {
    if (!this.workflows.includes(workflowName)) {
      throw new Error(
        `Workflow '${workflowName}' not managed by this bulkhead`
      );
    }

    return new Promise((resolve, reject) => {
      const execution = {
        workflowName,
        context,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      if (this.activeExecutions < this.maxConcurrent) {
        this.executeWorkflow(execution);
      } else if (this.queue.length < this.queueSize) {
        this.queue.push(execution);
      } else {
        reject(new Error("Bulkhead queue is full"));
      }
    });
  }

  async executeWorkflow(execution) {
    this.activeExecutions++;

    try {
      const { workflowRegistry } = await import("../WorkflowRegistry.js");
      const result = await Promise.race([
        workflowRegistry.execute(execution.workflowName, execution.context),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Bulkhead execution timeout")),
            this.timeout
          )
        ),
      ]);

      execution.resolve(result);
    } catch (error) {
      execution.reject(error);
    } finally {
      this.activeExecutions--;
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.activeExecutions < this.maxConcurrent) {
      const nextExecution = this.queue.shift();
      this.executeWorkflow(nextExecution);
    }
  }

  getStats() {
    return {
      activeExecutions: this.activeExecutions,
      queueLength: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      queueSize: this.queueSize,
    };
  }
}

/**
 * Integration Pattern Factory
 * Creates common integration patterns
 */
export class IntegrationPatternFactory {
  static createRequestResponse(requestWorkflow, responseWorkflow, options) {
    return new RequestResponsePattern(
      requestWorkflow,
      responseWorkflow,
      options
    );
  }

  static createPublishSubscribe(
    publisherWorkflow,
    subscriberWorkflows,
    options
  ) {
    return new PublishSubscribePattern(
      publisherWorkflow,
      subscriberWorkflows,
      options
    );
  }

  static createSaga(steps, options) {
    return new SagaPattern(steps, options);
  }

  static createCircuitBreaker(workflow, options) {
    return new CircuitBreakerPattern(workflow, options);
  }

  static createBulkhead(workflows, options) {
    return new BulkheadPattern(workflows, options);
  }

  /**
   * Create a complete integration with multiple patterns
   */
  static createCompositeIntegration(config) {
    const integration = workflowIntegrator.createIntegration(config.id, {
      workflows: config.workflows,
      communicationPattern: config.pattern || "sequential",
      dataPassingStrategy: config.dataStrategy || "merge",
      errorHandling: config.errorHandling || "fail-fast",
    });

    // Add circuit breakers if configured
    if (config.circuitBreakers) {
      config.circuitBreakers.forEach((cb) => {
        const circuitBreaker = new CircuitBreakerPattern(
          cb.workflow,
          cb.options
        );
        // Store circuit breaker for later use
        integration.circuitBreakers = integration.circuitBreakers || new Map();
        integration.circuitBreakers.set(cb.workflow, circuitBreaker);
      });
    }

    // Add bulkheads if configured
    if (config.bulkheads) {
      config.bulkheads.forEach((bh) => {
        const bulkhead = new BulkheadPattern(bh.workflows, bh.options);
        integration.bulkheads = integration.bulkheads || new Map();
        integration.bulkheads.set(bh.id, bulkhead);
      });
    }

    return integration;
  }
}

export default {
  RequestResponsePattern,
  PublishSubscribePattern,
  SagaPattern,
  CircuitBreakerPattern,
  BulkheadPattern,
  IntegrationPatternFactory,
};
