/**
 * WorkflowInstance Tests
 */

import { WorkflowInstance } from "../WorkflowInstance.js";

describe("WorkflowInstance", () => {
  let mockDefinition;
  let mockContext;

  beforeEach(() => {
    mockDefinition = {
      name: "testWorkflow",
      steps: [
        {
          name: "step1",
          execute: jest.fn().mockResolvedValue({ result1: "value1" }),
        },
        {
          name: "step2",
          execute: jest.fn().mockResolvedValue({ result2: "value2" }),
        },
      ],
    };

    mockContext = {
      userID: "testUser",
      planId: "123",
    };
  });

  describe("constructor", () => {
    it("should initialize with correct default state", () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);

      expect(instance.state.status).toBe("initialized");
      expect(instance.state.data).toEqual({});
      expect(instance.state.errors).toEqual([]);
      expect(instance.executionId).toBeTruthy();
    });

    it("should accept custom options", () => {
      const options = { timeout: 60000, retryAttempts: 5 };
      const instance = new WorkflowInstance(
        mockDefinition,
        mockContext,
        options
      );

      expect(instance.options.timeout).toBe(60000);
      expect(instance.options.retryAttempts).toBe(5);
    });
  });

  describe("execute", () => {
    it("should execute all steps successfully", async () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result1: "value1", result2: "value2" });
      expect(result.stepsExecuted).toBe(2);
      expect(instance.state.status).toBe("completed");
    });

    it("should handle step execution failure", async () => {
      const errorStep = {
        name: "failingStep",
        execute: jest.fn().mockRejectedValue(new Error("Step failed")),
      };

      mockDefinition.steps = [errorStep];
      const instance = new WorkflowInstance(mockDefinition, mockContext);

      // Mock error handler
      jest.doMock("../ErrorHandler.js", () => ({
        errorHandler: {
          handle: jest.fn().mockResolvedValue({
            error: { message: "Step failed", retryable: false },
          }),
        },
      }));

      const result = await instance.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(instance.state.status).toBe("failed");
    });

    it("should merge step results into workflow state", async () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      await instance.execute();

      expect(instance.state.data.result1).toBe("value1");
      expect(instance.state.data.result2).toBe("value2");
    });
  });

  describe("executeStep", () => {
    it("should execute step and record result", async () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      const step = mockDefinition.steps[0];

      await instance.executeStep(step, 0);

      expect(step.execute).toHaveBeenCalledWith(mockContext, instance.state);
      expect(instance.steps).toHaveLength(1);
      expect(instance.steps[0].success).toBe(true);
      expect(instance.steps[0].name).toBe("step1");
    });

    it("should throw error for step without execute function", async () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      const invalidStep = { name: "invalidStep" };

      await expect(instance.executeStep(invalidStep, 0)).rejects.toThrow(
        "Step 'invalidStep' must have an execute function"
      );
    });
  });

  describe("getProgress", () => {
    it("should calculate progress correctly", async () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);

      // Execute first step
      await instance.executeStep(mockDefinition.steps[0], 0);

      const progress = instance.getProgress();
      expect(progress.totalSteps).toBe(2);
      expect(progress.completedSteps).toBe(1);
      expect(progress.percentage).toBe(50);
      expect(progress.isComplete).toBe(false);
    });
  });

  describe("cancel", () => {
    it("should cancel running workflow", () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      instance.state.status = "running";

      instance.cancel();

      expect(instance.state.status).toBe("cancelled");
      expect(instance.state.endTime).toBeTruthy();
    });

    it("should not cancel non-running workflow", () => {
      const instance = new WorkflowInstance(mockDefinition, mockContext);
      instance.state.status = "completed";

      instance.cancel();

      expect(instance.state.status).toBe("completed");
    });
  });
});
