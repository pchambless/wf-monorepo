/**
 * Workflow Orchestration Tests
 *
 * Tests for workflow orchestration patterns including conditional execution,
 * parallel processing, dependencies, and composition
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowInstance } from "../WorkflowInstance.js";
import { workflowComposer } from "../WorkflowComposer.js";
import { workflowRegistry } from "../WorkflowRegistry.js";

describe("Workflow Orchestration", () => {
  beforeEach(() => {
    workflowRegistry.clear();
    vi.clearAllMocks();
  });

  describe("Conditional Execution", () => {
    it("should execute steps based on string conditions", async () => {
      const workflow = {
        name: "conditionalTest",
        steps: [
          {
            name: "setup",
            execute: async () => ({ value: 10 }),
          },
          {
            name: "conditionalStep",
            condition: "value > 5",
            execute: async () => ({ executed: true }),
          },
          {
            name: "skippedStep",
            condition: "value < 5",
            execute: async () => ({ shouldNotExecute: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data.executed).toBe(true);
      expect(result.data.shouldNotExecute).toBeUndefined();
    });

    it("should execute steps based on function conditions", async () => {
      const workflow = {
        name: "functionConditionTest",
        steps: [
          {
            name: "setup",
            execute: async () => ({ userType: "admin" }),
          },
          {
            name: "adminStep",
            condition: (context, state) => state.data.userType === "admin",
            execute: async () => ({ adminAction: true }),
          },
          {
            name: "userStep",
            condition: (context, state) => state.data.userType === "user",
            execute: async () => ({ userAction: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data.adminAction).toBe(true);
      expect(result.data.userAction).toBeUndefined();
    });

    it("should handle condition evaluation errors gracefully", async () => {
      const workflow = {
        name: "conditionErrorTest",
        steps: [
          {
            name: "setup",
            execute: async () => ({ value: null }),
          },
          {
            name: "errorCondition",
            condition: () => {
              throw new Error("Condition error");
            },
            execute: async () => ({ executed: true }),
          },
          {
            name: "normalStep",
            execute: async () => ({ normal: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data.executed).toBeUndefined(); // Skipped due to condition error
      expect(result.data.normal).toBe(true);
    });
  });

  describe("Parallel Execution", () => {
    it("should execute parallel steps concurrently", async () => {
      const startTime = Date.now();
      const workflow = {
        name: "parallelTest",
        steps: [
          {
            name: "parallel1",
            parallel: true,
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { step1: true };
            },
          },
          {
            name: "parallel2",
            parallel: true,
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { step2: true };
            },
          },
          {
            name: "parallel3",
            parallel: true,
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { step3: true };
            },
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.data.step1).toBe(true);
      expect(result.data.step2).toBe(true);
      expect(result.data.step3).toBe(true);
      // Should complete in roughly 100ms, not 300ms
      expect(duration).toBeLessThan(200);
    });

    it("should handle parallel step failures", async () => {
      const workflow = {
        name: "parallelFailureTest",
        steps: [
          {
            name: "parallel1",
            parallel: true,
            execute: async () => ({ success: true }),
          },
          {
            name: "parallel2",
            parallel: true,
            execute: async () => {
              throw new Error("Parallel step failed");
            },
          },
          {
            name: "parallel3",
            parallel: true,
            execute: async () => ({ success: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(false);
      expect(result.error.message).toContain("Parallel execution failed");
    });

    it("should skip parallel steps with false conditions", async () => {
      const workflow = {
        name: "parallelConditionTest",
        steps: [
          {
            name: "setup",
            execute: async () => ({ skipSecond: true }),
          },
          {
            name: "parallel1",
            parallel: true,
            execute: async () => ({ step1: true }),
          },
          {
            name: "parallel2",
            parallel: true,
            condition: "skipSecond === false",
            execute: async () => ({ step2: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data.step1).toBe(true);
      expect(result.data.step2).toBeUndefined();
    });
  });

  describe("Workflow Dependencies", () => {
    it("should resolve workflow dependencies before execution", async () => {
      // Register dependency workflow
      workflowRegistry.register("dependency", {
        name: "dependency",
        steps: [
          {
            name: "provideDependency",
            execute: async () => ({ dependencyData: "provided" }),
          },
        ],
      });

      const workflow = {
        name: "dependentWorkflow",
        dependencies: [{ workflow: "dependency" }],
        steps: [
          {
            name: "useDependency",
            execute: async (context) => ({
              used: context.dependencyData === "provided",
            }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data.used).toBe(true);
    });

    it("should fail if dependency workflow fails", async () => {
      // Register failing dependency workflow
      workflowRegistry.register("failingDependency", {
        name: "failingDependency",
        steps: [
          {
            name: "fail",
            execute: async () => {
              throw new Error("Dependency failed");
            },
          },
        ],
      });

      const workflow = {
        name: "dependentWorkflow",
        dependencies: [{ workflow: "failingDependency" }],
        steps: [
          {
            name: "shouldNotExecute",
            execute: async () => ({ executed: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(false);
      expect(result.error.message).toContain(
        "Dependency 'failingDependency' failed"
      );
    });
  });

  describe("State Persistence", () => {
    it("should persist and restore workflow state", async () => {
      const workflow = {
        name: "persistentWorkflow",
        steps: [
          {
            name: "step1",
            execute: async () => ({ step1: "completed" }),
          },
          {
            name: "step2",
            execute: async () => ({ step2: "completed" }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {}, { resumable: true });

      // Mock localStorage
      const mockStorage = {};
      global.localStorage = {
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value;
        }),
        getItem: vi.fn((key) => mockStorage[key]),
        removeItem: vi.fn((key) => {
          delete mockStorage[key];
        }),
      };

      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalled(); // Cleanup after success
    });
  });
});

describe("Workflow Composition", () => {
  beforeEach(() => {
    workflowRegistry.clear();

    // Register test workflows
    workflowRegistry.register("workflow1", {
      name: "workflow1",
      steps: [
        {
          name: "step1",
          execute: async () => ({ result1: "success" }),
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
            combined: context.result1 + "_workflow2",
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

  describe("Sequential Composition", () => {
    it("should execute workflows sequentially with data passing", async () => {
      const composition = workflowComposer.createSequential(
        "sequentialTest",
        ["workflow1", "workflow2"],
        { passDataBetween: true }
      );

      const result = await composition.execute({});

      expect(result.success).toBe(true);
      expect(result.data.result1).toBe("success");
      expect(result.data.combined).toBe("success_workflow2");
      expect(result.summary.successful).toBe(2);
    });

    it("should fail fast on workflow failure", async () => {
      const composition = workflowComposer.createSequential(
        "failFastTest",
        ["workflow1", "failingWorkflow", "workflow2"],
        { failFast: true }
      );

      const result = await composition.execute({});

      expect(result.success).toBe(false);
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("Parallel Composition", () => {
    it("should execute workflows in parallel", async () => {
      const startTime = Date.now();

      // Add delay to workflows to test parallelism
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

      const composition = workflowComposer.createParallel(
        "parallelTest",
        ["delayedWorkflow1", "delayedWorkflow2"],
        { aggregateResults: true }
      );

      const result = await composition.execute({});
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.data.delayed1).toBe(true);
      expect(result.data.delayed2).toBe(true);
      expect(duration).toBeLessThan(200); // Should be ~100ms, not 200ms
    });
  });

  describe("Conditional Composition", () => {
    it("should execute workflow based on conditions", async () => {
      const composition = workflowComposer.createConditional(
        "conditionalTest",
        {
          'userType === "admin"': "workflow1",
          'userType === "user"': "workflow2",
        },
        { defaultWorkflow: "failingWorkflow" }
      );

      const result = await composition.execute({ userType: "admin" });

      expect(result.success).toBe(true);
      expect(result.data.result1).toBe("success");
      expect(result.executed).toBe(true);
    });

    it("should execute default workflow when no conditions match", async () => {
      const composition = workflowComposer.createConditional(
        "defaultTest",
        {
          'userType === "admin"': "workflow1",
        },
        { defaultWorkflow: "workflow2" }
      );

      const result = await composition.execute({ userType: "guest" });

      expect(result.success).toBe(true);
      expect(result.data.result2).toBe("success");
    });
  });

  describe("Retry Composition", () => {
    it("should retry failed workflows", async () => {
      let attempts = 0;
      workflowRegistry.register("unreliableWorkflow", {
        name: "unreliableWorkflow",
        steps: [
          {
            name: "unreliableStep",
            execute: async () => {
              attempts++;
              if (attempts < 3) {
                const error = new Error("Temporary failure");
                error.retryable = true;
                throw error;
              }
              return { attempts, success: true };
            },
          },
        ],
      });

      const composition = workflowComposer.createRetry(
        "retryTest",
        "unreliableWorkflow",
        {
          maxAttempts: 3,
          backoffStrategy: "fixed",
          baseDelay: 10,
        }
      );

      const result = await composition.execute({});

      expect(result.success).toBe(true);
      expect(result.data.attempts).toBe(3);
      expect(result.retried).toBe(true);
    });

    it("should not retry non-retryable errors", async () => {
      workflowRegistry.register("nonRetryableWorkflow", {
        name: "nonRetryableWorkflow",
        steps: [
          {
            name: "nonRetryableStep",
            execute: async () => {
              const error = new Error("Validation error");
              error.retryable = false;
              throw error;
            },
          },
        ],
      });

      const composition = workflowComposer.createRetry(
        "nonRetryableTest",
        "nonRetryableWorkflow",
        { maxAttempts: 3 }
      );

      const result = await composition.execute({});

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(result.retried).toBe(false);
    });
  });
});

describe("Registry Composition Integration", () => {
  beforeEach(() => {
    workflowRegistry.clear();

    workflowRegistry.register("testWorkflow", {
      name: "testWorkflow",
      steps: [
        {
          name: "test",
          execute: async () => ({ test: true }),
        },
      ],
    });
  });

  it("should register and execute sequential compositions", async () => {
    const composition = workflowRegistry.createSequential(
      "registrySequential",
      ["testWorkflow"],
      { description: "Test sequential composition" }
    );

    const result = await workflowRegistry.executeComposition(
      "registrySequential",
      {}
    );

    expect(result.success).toBe(true);
    expect(result.data.test).toBe(true);
  });

  it("should list workflows and compositions separately", async () => {
    workflowRegistry.createSequential("testSequential", ["testWorkflow"]);
    workflowRegistry.createParallel("testParallel", ["testWorkflow"]);

    const all = workflowRegistry.listAll();

    expect(all.workflows).toHaveLength(1);
    expect(all.compositions).toHaveLength(2);
    expect(all.total).toBe(3);
  });
});
