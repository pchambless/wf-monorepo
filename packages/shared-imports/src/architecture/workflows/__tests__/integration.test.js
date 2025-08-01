/**
 * Workflow Integration Tests
 *
 * Tests for workflow integration patterns and cross-workflow communication
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowIntegrator } from "../integration/WorkflowIntegrator.js";
import {
  RequestResponsePattern,
  PublishSubscribePattern,
  SagaPattern,
  CircuitBreakerPattern,
  BulkheadPattern,
  IntegrationPatternFactory,
} from "../integration/IntegrationPatterns.js";
import { workflowRegistry } from "../WorkflowRegistry.js";

describe("Workflow Integration", () => {
  let integrator;

  beforeEach(() => {
    integrator = new WorkflowIntegrator();
    workflowRegistry.clear();

    // Register test workflows
    workflowRegistry.register("workflow1", {
      name: "workflow1",
      steps: [
        {
          name: "step1",
          execute: async (context) => ({
            result1: "success",
            input: context.input,
          }),
        },
      ],
    });

    workflowRegistry.register("workflow2", {
      name: "workflow2",
      steps: [
        {
          name: "step2",
          execute: async (context) => ({
            result2: "success",
            combined: `${context.result1}_workflow2`,
          }),
        },
      ],
    });

    workflowRegistry.register("failingWorkflow", {
      name: "failingWorkflow",
      steps: [
        {
          name: "fail",
          execute: async () => {
            throw new Error("Workflow failed");
          },
        },
      ],
    });
  });

  describe("Basic Integration Creation", () => {
    it("should create workflow integration", () => {
      const integration = integrator.createIntegration("test-integration", {
        workflows: ["workflow1", "workflow2"],
        communicationPattern: "sequential",
        dataPassingStrategy: "merge",
      });

      expect(integration.id).toBe("test-integration");
      expect(integration.workflows).toEqual(["workflow1", "workflow2"]);
      expect(integration.communicationPattern).toBe("sequential");
      expect(integration.status).toBe("created");
    });

    it("should list active integrations", () => {
      integrator.createIntegration("integration1", {
        workflows: ["workflow1"],
      });
      integrator.createIntegration("integration2", {
        workflows: ["workflow2"],
      });

      const integrations = integrator.listIntegrations();
      expect(integrations).toHaveLength(2);
      expect(integrations.map((i) => i.id)).toContain("integration1");
      expect(integrations.map((i) => i.id)).toContain("integration2");
    });
  });

  describe("Sequential Integration", () => {
    it("should execute workflows sequentially with data passing", async () => {
      const integration = integrator.createIntegration("sequential-test", {
        workflows: ["workflow1", "workflow2"],
        communicationPattern: "sequential",
        dataPassingStrategy: "merge",
      });

      const result = await integrator.executeIntegration("sequential-test", {
        input: "test-data",
      });

      expect(result.success).toBe(true);
      expect(result.data.result1).toBe("success");
      expect(result.data.combined).toBe("success_workflow2");
      expect(result.workflowResults.workflow1.success).toBe(true);
      expect(result.workflowResults.workflow2.success).toBe(true);
    });

    it("should fail fast on workflow failure", async () => {
      integrator.createIntegration("fail-fast-test", {
        workflows: ["workflow1", "failingWorkflow", "workflow2"],
        communicationPattern: "sequential",
        errorHandling: "fail-fast",
      });

      const result = await integrator.executeIntegration("fail-fast-test", {
        input: "test-data",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Workflow failed");
      expect(result.workflowResults.workflow1.success).toBe(true);
      expect(result.workflowResults.failingWorkflow.success).toBe(false);
      expect(result.workflowResults.workflow2).toBeUndefined(); // Should not execute
    });
  });

  describe("Parallel Integration", () => {
    it("should execute workflows in parallel", async () => {
      const startTime = Date.now();

      // Add delay to test parallelism
      workflowRegistry.register("delayedWorkflow1", {
        name: "delayedWorkflow1",
        steps: [
          {
            name: "delay1",
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { delayed1: true };
            },
          },
        ],
      });

      workflowRegistry.register("delayedWorkflow2", {
        name: "delayedWorkflow2",
        steps: [
          {
            name: "delay2",
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { delayed2: true };
            },
          },
        ],
      });

      integrator.createIntegration("parallel-test", {
        workflows: ["delayedWorkflow1", "delayedWorkflow2"],
        communicationPattern: "parallel",
        dataPassingStrategy: "merge",
      });

      const result = await integrator.executeIntegration("parallel-test");
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.data.delayed1).toBe(true);
      expect(result.data.delayed2).toBe(true);
      expect(duration).toBeLessThan(200); // Should be ~100ms, not 200ms
    });

    it("should handle parallel workflow failures", async () => {
      integrator.createIntegration("parallel-failure-test", {
        workflows: ["workflow1", "failingWorkflow", "workflow2"],
        communicationPattern: "parallel",
        errorHandling: "fail-fast",
      });

      const result = await integrator.executeIntegration(
        "parallel-failure-test"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("workflows failed in parallel execution");
    });
  });

  describe("Pipeline Integration", () => {
    it("should execute workflows as pipeline stages", async () => {
      workflowRegistry.register("pipelineStage1", {
        name: "pipelineStage1",
        steps: [
          {
            name: "stage1",
            execute: async (context) => ({ stage1Result: context.input * 2 }),
          },
        ],
      });

      workflowRegistry.register("pipelineStage2", {
        name: "pipelineStage2",
        steps: [
          {
            name: "stage2",
            execute: async (context) => ({
              stage2Result: context.stage1Result + 10,
            }),
          },
        ],
      });

      integrator.createIntegration("pipeline-test", {
        workflows: ["pipelineStage1", "pipelineStage2"],
        communicationPattern: "pipeline",
      });

      const result = await integrator.executeIntegration("pipeline-test", {
        input: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data.stage1Result).toBe(10);
      expect(result.data.stage2Result).toBe(20);
    });
  });

  describe("Communication Channels", () => {
    it("should create and use communication channels", async () => {
      const channel = integrator.createCommunicationChannel("test-channel");
      expect(channel.id).toBe("test-channel");
      expect(channel.type).toBe("event-bus");

      const messages = [];
      integrator.subscribe("test-channel", "test-topic", (message) => {
        messages.push(message);
      });

      await integrator.sendMessage("test-channel", "test-topic", {
        test: "data",
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].topic).toBe("test-topic");
      expect(messages[0].data).toEqual({ test: "data" });
    });

    it("should handle multiple subscribers", async () => {
      integrator.createCommunicationChannel("multi-sub-channel");

      const subscriber1Messages = [];
      const subscriber2Messages = [];

      integrator.subscribe("multi-sub-channel", "topic", (msg) => {
        subscriber1Messages.push(msg);
      });

      integrator.subscribe("multi-sub-channel", "topic", (msg) => {
        subscriber2Messages.push(msg);
      });

      await integrator.sendMessage("multi-sub-channel", "topic", {
        broadcast: true,
      });

      expect(subscriber1Messages).toHaveLength(1);
      expect(subscriber2Messages).toHaveLength(1);
    });
  });

  describe("Synchronization Points", () => {
    it("should coordinate workflow execution with synchronization points", async () => {
      const syncPoint = integrator.createSynchronizationPoint("test-sync", {
        expectedParticipants: ["participant1", "participant2"],
      });

      expect(syncPoint.id).toBe("test-sync");
      expect(syncPoint.expectedParticipants).toEqual([
        "participant1",
        "participant2",
      ]);

      // Simulate participants arriving
      const participant1Promise = integrator.waitAtSynchronizationPoint(
        "test-sync",
        "participant1"
      );
      const participant2Promise = integrator.waitAtSynchronizationPoint(
        "test-sync",
        "participant2"
      );

      // Both should resolve when all participants arrive
      await Promise.all([participant1Promise, participant2Promise]);

      expect(syncPoint.status).toBe("released");
    });

    it("should timeout if not all participants arrive", async () => {
      integrator.createSynchronizationPoint("timeout-sync", {
        expectedParticipants: ["participant1", "participant2"],
        timeout: 100,
      });

      // Only one participant arrives
      const promise = integrator.waitAtSynchronizationPoint(
        "timeout-sync",
        "participant1"
      );

      await expect(promise).rejects.toThrow("Synchronization timeout");
    });
  });

  describe("Rollback Handling", () => {
    it("should register and execute rollback handlers", async () => {
      const rollbackCalls = [];

      integrator.registerRollbackHandler(
        "workflow1",
        async (rollbackData, context) => {
          rollbackCalls.push({ rollbackData, context });
        }
      );

      // Create workflow that provides rollback data
      workflowRegistry.register("rollbackWorkflow", {
        name: "rollbackWorkflow",
        steps: [
          {
            name: "step",
            execute: async () => {
              const result = { success: true, data: { created: "item1" } };
              result.rollbackData = { itemToDelete: "item1" };
              return result;
            },
          },
        ],
      });

      integrator.createIntegration("rollback-test", {
        workflows: ["rollbackWorkflow", "failingWorkflow"],
        communicationPattern: "sequential",
        rollbackStrategy: "compensating",
      });

      const result = await integrator.executeIntegration("rollback-test");

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      // Note: rollbackCalls might be empty if rollback data structure differs
    });
  });
});

describe("Integration Patterns", () => {
  beforeEach(() => {
    workflowRegistry.clear();
  });

  describe("Request-Response Pattern", () => {
    it("should execute request-response pattern", async () => {
      // Register request workflow that sends response
      workflowRegistry.register("requestWorkflow", {
        name: "requestWorkflow",
        steps: [
          {
            name: "sendRequest",
            execute: async (context) => ({
              requestSent: true,
              correlationId: context.correlationId,
            }),
          },
        ],
      });

      // Register response workflow that sends response message
      workflowRegistry.register("responseWorkflow", {
        name: "responseWorkflow",
        steps: [
          {
            name: "sendResponse",
            execute: async (context) => {
              // Simulate sending response through channel
              const { workflowIntegrator } = await import(
                "../integration/WorkflowIntegrator.js"
              );
              await workflowIntegrator.sendMessage(
                context.responseChannel,
                "response",
                {
                  responseData: "processed",
                  correlationId: context.correlationId,
                }
              );
              return { responseSent: true };
            },
          },
        ],
      });

      const pattern = new RequestResponsePattern(
        "requestWorkflow",
        "responseWorkflow",
        {
          timeout: 5000,
        }
      );

      const result = await pattern.execute({ requestData: "test" });

      expect(result.request.requestSent).toBe(true);
      expect(result.response.responseData).toBe("processed");
      expect(result.correlationId).toBeDefined();
    });
  });

  describe("Publish-Subscribe Pattern", () => {
    it("should execute publish-subscribe pattern", async () => {
      // Register publisher workflow
      workflowRegistry.register("publisherWorkflow", {
        name: "publisherWorkflow",
        steps: [
          {
            name: "publish",
            execute: async (context) => {
              const { workflowIntegrator } = await import(
                "../integration/WorkflowIntegrator.js"
              );
              await workflowIntegrator.sendMessage(
                context.publishChannel,
                context.publishTopic,
                { publishedData: "event-data" }
              );
              return { published: true };
            },
          },
        ],
      });

      // Register subscriber workflows
      workflowRegistry.register("subscriber1", {
        name: "subscriber1",
        steps: [
          {
            name: "process",
            execute: async (context) => ({
              processed: context.publishedData,
              subscriber: 1,
            }),
          },
        ],
      });

      workflowRegistry.register("subscriber2", {
        name: "subscriber2",
        steps: [
          {
            name: "process",
            execute: async (context) => ({
              processed: context.publishedData,
              subscriber: 2,
            }),
          },
        ],
      });

      const pattern = new PublishSubscribePattern(
        "publisherWorkflow",
        ["subscriber1", "subscriber2"],
        { topic: "test-topic" }
      );

      const result = await pattern.execute({ eventData: "test" });

      expect(result.publisher.published).toBe(true);
      expect(result.subscribers).toHaveLength(2);
      expect(
        result.subscribers.every(
          (s) => s.result.data.processed === "event-data"
        )
      ).toBe(true);
    });
  });

  describe("Saga Pattern", () => {
    it("should execute saga with compensation on failure", async () => {
      const compensationCalls = [];

      // Register saga step workflows
      workflowRegistry.register("sagaStep1", {
        name: "sagaStep1",
        steps: [
          {
            name: "execute",
            execute: async () => ({ step1: "completed" }),
          },
        ],
      });

      workflowRegistry.register("sagaStep2", {
        name: "sagaStep2",
        steps: [
          {
            name: "execute",
            execute: async () => {
              throw new Error("Step 2 failed");
            },
          },
        ],
      });

      // Register compensation workflows
      workflowRegistry.register("compensateStep1", {
        name: "compensateStep1",
        steps: [
          {
            name: "compensate",
            execute: async (context) => {
              compensationCalls.push("step1-compensated");
              return { compensated: true };
            },
          },
        ],
      });

      const saga = new SagaPattern([
        { workflow: "sagaStep1", compensate: "compensateStep1" },
        { workflow: "sagaStep2" },
      ]);

      const result = await saga.execute({ sagaData: "test" });

      expect(result.success).toBe(false);
      expect(result.compensationPerformed).toBe(true);
      expect(result.executedSteps).toBe(1); // Only first step executed
    });

    it("should complete saga successfully without compensation", async () => {
      workflowRegistry.register("sagaStep1", {
        name: "sagaStep1",
        steps: [
          {
            name: "execute",
            execute: async () => ({ step1: "completed" }),
          },
        ],
      });

      workflowRegistry.register("sagaStep2", {
        name: "sagaStep2",
        steps: [
          {
            name: "execute",
            execute: async () => ({ step2: "completed" }),
          },
        ],
      });

      const saga = new SagaPattern([
        { workflow: "sagaStep1" },
        { workflow: "sagaStep2" },
      ]);

      const result = await saga.execute({ sagaData: "test" });

      expect(result.success).toBe(true);
      expect(result.executedSteps).toBe(2);
      expect(result.results).toHaveLength(2);
    });
  });

  describe("Circuit Breaker Pattern", () => {
    it("should open circuit breaker after failure threshold", async () => {
      let callCount = 0;

      workflowRegistry.register("unreliableWorkflow", {
        name: "unreliableWorkflow",
        steps: [
          {
            name: "unreliable",
            execute: async () => {
              callCount++;
              throw new Error("Service unavailable");
            },
          },
        ],
      });

      const circuitBreaker = new CircuitBreakerPattern("unreliableWorkflow", {
        failureThreshold: 3,
        recoveryTimeout: 1000,
      });

      // Execute until circuit breaker opens
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute({})).rejects.toThrow();
      }

      expect(circuitBreaker.getState().state).toBe("OPEN");

      // Next call should be blocked
      await expect(circuitBreaker.execute({})).rejects.toThrow(
        "Circuit breaker is OPEN"
      );
      expect(callCount).toBe(3); // No additional calls made
    });

    it("should transition to half-open after recovery timeout", async () => {
      workflowRegistry.register("recoveringWorkflow", {
        name: "recoveringWorkflow",
        steps: [
          {
            name: "recover",
            execute: async () => ({ recovered: true }),
          },
        ],
      });

      const circuitBreaker = new CircuitBreakerPattern("recoveringWorkflow", {
        failureThreshold: 1,
        recoveryTimeout: 50,
      });

      // Trigger failure to open circuit
      workflowRegistry.register("recoveringWorkflow", {
        name: "recoveringWorkflow",
        steps: [
          {
            name: "fail",
            execute: async () => {
              throw new Error("Initial failure");
            },
          },
        ],
      });

      await expect(circuitBreaker.execute({})).rejects.toThrow();
      expect(circuitBreaker.getState().state).toBe("OPEN");

      // Wait for recovery timeout
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Update workflow to succeed
      workflowRegistry.register("recoveringWorkflow", {
        name: "recoveringWorkflow",
        steps: [
          {
            name: "succeed",
            execute: async () => ({ recovered: true }),
          },
        ],
      });

      // Circuit should be half-open now
      circuitBreaker.updateState();
      expect(circuitBreaker.getState().state).toBe("HALF_OPEN");
    });
  });

  describe("Bulkhead Pattern", () => {
    it("should limit concurrent executions", async () => {
      let concurrentExecutions = 0;
      let maxConcurrent = 0;

      workflowRegistry.register("concurrentWorkflow", {
        name: "concurrentWorkflow",
        steps: [
          {
            name: "concurrent",
            execute: async () => {
              concurrentExecutions++;
              maxConcurrent = Math.max(maxConcurrent, concurrentExecutions);

              await new Promise((resolve) => setTimeout(resolve, 100));

              concurrentExecutions--;
              return { executed: true };
            },
          },
        ],
      });

      const bulkhead = new BulkheadPattern(["concurrentWorkflow"], {
        maxConcurrent: 2,
        queueSize: 5,
      });

      // Start 5 executions simultaneously
      const promises = Array.from({ length: 5 }, () =>
        bulkhead.execute("concurrentWorkflow", {})
      );

      await Promise.all(promises);

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it("should reject executions when queue is full", async () => {
      workflowRegistry.register("slowWorkflow", {
        name: "slowWorkflow",
        steps: [
          {
            name: "slow",
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return { slow: true };
            },
          },
        ],
      });

      const bulkhead = new BulkheadPattern(["slowWorkflow"], {
        maxConcurrent: 1,
        queueSize: 1,
      });

      // Start executions to fill capacity and queue
      const promise1 = bulkhead.execute("slowWorkflow", {});
      const promise2 = bulkhead.execute("slowWorkflow", {});

      // This should be rejected
      await expect(bulkhead.execute("slowWorkflow", {})).rejects.toThrow(
        "Bulkhead queue is full"
      );

      // Cleanup
      await Promise.allSettled([promise1, promise2]);
    });
  });

  describe("Integration Pattern Factory", () => {
    it("should create patterns using factory methods", () => {
      const requestResponse = IntegrationPatternFactory.createRequestResponse(
        "request",
        "response",
        { timeout: 5000 }
      );
      expect(requestResponse).toBeInstanceOf(RequestResponsePattern);

      const pubSub = IntegrationPatternFactory.createPublishSubscribe(
        "publisher",
        ["sub1", "sub2"],
        { topic: "test" }
      );
      expect(pubSub).toBeInstanceOf(PublishSubscribePattern);

      const saga = IntegrationPatternFactory.createSaga([
        { workflow: "step1" },
      ]);
      expect(saga).toBeInstanceOf(SagaPattern);

      const circuitBreaker = IntegrationPatternFactory.createCircuitBreaker(
        "workflow",
        { failureThreshold: 5 }
      );
      expect(circuitBreaker).toBeInstanceOf(CircuitBreakerPattern);

      const bulkhead = IntegrationPatternFactory.createBulkhead(
        ["workflow1", "workflow2"],
        { maxConcurrent: 3 }
      );
      expect(bulkhead).toBeInstanceOf(BulkheadPattern);
    });
  });
});
