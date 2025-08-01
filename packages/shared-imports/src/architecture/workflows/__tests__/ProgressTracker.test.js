/**
 * ProgressTracker Tests
 */

import { ProgressTracker } from "../ProgressTracker.js";

describe("ProgressTracker", () => {
  let tracker;

  beforeEach(() => {
    tracker = new ProgressTracker();
  });

  describe("startTracking", () => {
    it("should start tracking a workflow", () => {
      const executionId = "test-execution-1";
      const workflowInfo = {
        name: "testWorkflow",
        steps: [{ name: "step1" }, { name: "step2" }],
      };

      const result = tracker.startTracking(executionId, workflowInfo);

      expect(result.executionId).toBe(executionId);
      expect(result.workflowName).toBe("testWorkflow");
      expect(result.totalSteps).toBe(2);
      expect(result.completedSteps).toBe(0);
      expect(result.status).toBe("running");
      expect(result.progress.percentage).toBe(0);
      expect(result.progress.message).toBe("Starting workflow...");
    });

    it("should handle workflows without steps", () => {
      const executionId = "test-execution-2";
      const workflowInfo = { name: "emptyWorkflow" };

      const result = tracker.startTracking(executionId, workflowInfo);

      expect(result.totalSteps).toBe(0);
    });
  });

  describe("updateProgress", () => {
    beforeEach(() => {
      tracker.startTracking("test-execution", {
        name: "testWorkflow",
        steps: [{ name: "step1" }, { name: "step2" }, { name: "step3" }],
      });
    });

    it("should update workflow progress", () => {
      const result = tracker.updateProgress("test-execution", {
        currentStep: "step2",
        completedSteps: 1,
        status: "running",
      });

      expect(result.currentStep).toBe("step2");
      expect(result.completedSteps).toBe(1);
      expect(result.progress.percentage).toBe(33); // 1/3 * 100, rounded
      expect(result.lastUpdated).toBeTruthy();
    });

    it("should calculate progress percentage correctly", () => {
      tracker.updateProgress("test-execution", { completedSteps: 2 });
      const progress = tracker.getProgress("test-execution");

      expect(progress.progress.percentage).toBe(67); // 2/3 * 100, rounded
    });

    it("should handle unknown execution ID", () => {
      const result = tracker.updateProgress("unknown-execution", {
        completedSteps: 1,
      });

      expect(result).toBeNull();
    });
  });

  describe("completeTracking", () => {
    beforeEach(() => {
      tracker.startTracking("test-execution", {
        name: "testWorkflow",
        steps: [{ name: "step1" }],
      });
    });

    it("should complete successful workflow tracking", () => {
      const result = { success: true, data: { result: "success" } };

      const tracking = tracker.completeTracking("test-execution", result);

      expect(tracking.status).toBe("completed");
      expect(tracking.endTime).toBeTruthy();
      expect(tracking.duration).toBeTruthy();
      expect(tracking.progress.percentage).toBe(100);
      expect(tracking.progress.message).toBe("Workflow completed successfully");

      // Should be removed from active workflows
      expect(tracker.getProgress("test-execution")).toBeNull();
    });

    it("should complete failed workflow tracking", () => {
      const result = {
        success: false,
        error: { message: "Test error" },
      };

      const tracking = tracker.completeTracking("test-execution", result);

      expect(tracking.status).toBe("failed");
      expect(tracking.progress.message).toBe("Workflow failed: Test error");
      expect(tracking.progress.phase).toBe("failed");
    });
  });

  describe("cancelTracking", () => {
    beforeEach(() => {
      tracker.startTracking("test-execution", {
        name: "testWorkflow",
        steps: [{ name: "step1" }],
      });
    });

    it("should cancel workflow tracking", () => {
      const reason = "User cancelled";

      const tracking = tracker.cancelTracking("test-execution", reason);

      expect(tracking.status).toBe("cancelled");
      expect(tracking.cancelReason).toBe(reason);
      expect(tracking.progress.message).toBe(
        "Workflow cancelled: User cancelled"
      );
      expect(tracking.progress.phase).toBe("cancelled");

      // Should be removed from active workflows
      expect(tracker.getProgress("test-execution")).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("should subscribe to progress updates", () => {
      const callback = jest.fn();

      const unsubscribe = tracker.subscribe("test-execution", callback);

      // Start tracking should trigger callback
      tracker.startTracking("test-execution", {
        name: "testWorkflow",
        steps: [{ name: "step1" }],
      });

      expect(callback).toHaveBeenCalledWith("started", expect.any(Object));

      // Update progress should trigger callback
      tracker.updateProgress("test-execution", { completedSteps: 1 });

      expect(callback).toHaveBeenCalledWith("progress", expect.any(Object));

      // Unsubscribe should work
      unsubscribe();
      callback.mockClear();

      tracker.updateProgress("test-execution", { completedSteps: 2 });
      expect(callback).not.toHaveBeenCalled();
    });

    it("should subscribe to all workflows", () => {
      const callback = jest.fn();

      tracker.subscribe("all", callback);

      tracker.startTracking("execution-1", { name: "workflow1", steps: [] });
      tracker.startTracking("execution-2", { name: "workflow2", steps: [] });

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("getActiveWorkflows", () => {
    it("should return all active workflows", () => {
      tracker.startTracking("execution-1", { name: "workflow1", steps: [] });
      tracker.startTracking("execution-2", { name: "workflow2", steps: [] });

      const active = tracker.getActiveWorkflows();

      expect(active).toHaveLength(2);
      expect(active[0].workflowName).toBe("workflow1");
      expect(active[1].workflowName).toBe("workflow2");
    });

    it("should return empty array when no active workflows", () => {
      const active = tracker.getActiveWorkflows();
      expect(active).toHaveLength(0);
    });
  });

  describe("getExecutionStats", () => {
    beforeEach(() => {
      // Create some test history
      tracker.startTracking("execution-1", { name: "workflow1", steps: [] });
      tracker.completeTracking("execution-1", { success: true });

      tracker.startTracking("execution-2", { name: "workflow2", steps: [] });
      tracker.completeTracking("execution-2", {
        success: false,
        error: { message: "Failed" },
      });

      tracker.startTracking("execution-3", { name: "workflow1", steps: [] });
      tracker.cancelTracking("execution-3", "User cancelled");
    });

    it("should return overall execution statistics", () => {
      const stats = tracker.getExecutionStats();

      expect(stats.totalExecutions).toBe(3);
      expect(stats.successful).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.cancelled).toBe(1);
      expect(stats.successRate).toBe(33.33333333333333); // 1/3 * 100
    });

    it("should filter statistics by workflow name", () => {
      const stats = tracker.getExecutionStats("workflow1");

      expect(stats.totalExecutions).toBe(2);
      expect(stats.successful).toBe(1);
      expect(stats.cancelled).toBe(1);
    });
  });

  describe("estimateDuration", () => {
    it("should return known workflow estimates", () => {
      expect(tracker.estimateDuration("createPlan")).toBe(3000);
      expect(tracker.estimateDuration("updatePlan")).toBe(2000);
    });

    it("should return default estimate for unknown workflows", () => {
      expect(tracker.estimateDuration("unknownWorkflow")).toBe(5000);
    });
  });

  describe("clearHistory", () => {
    it("should clear all tracking data", () => {
      tracker.startTracking("execution-1", { name: "workflow1", steps: [] });
      tracker.completeTracking("execution-1", { success: true });

      expect(tracker.progressHistory).toHaveLength(1);

      tracker.clearHistory();

      expect(tracker.progressHistory).toHaveLength(0);
      expect(tracker.getActiveWorkflows()).toHaveLength(0);
    });
  });
});
