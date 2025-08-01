/**
 * Plan Operations Workflow Tests
 */

import {
  createPlanWorkflow,
  updatePlanWorkflow,
  archivePlanWorkflow,
} from "../plan/PlanOperationsWorkflow.js";

// Mock execDml
const mockExecDml = jest.fn();
jest.doMock("@whatsfresh/shared-imports/api", () => ({
  execDml: mockExecDml,
}));

// Mock impact tracker
const mockImpactTracker = {
  recordImpact: jest.fn(),
};
jest.doMock("../impact/ImpactTracker.js", () => ({
  impactTracker: mockImpactTracker,
}));

describe("Plan Operations Workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecDml.mockResolvedValue({
      success: true,
      insertId: "plan123",
      affectedRows: 1,
    });
    mockImpactTracker.recordImpact.mockResolvedValue({
      success: true,
      impactId: "impact123",
    });
  });

  describe("createPlanWorkflow", () => {
    describe("validatePlanData step", () => {
      const step = createPlanWorkflow.steps[0];

      it("should validate required fields", async () => {
        const context = {
          planData: {
            name: "Test Plan",
            description: "Test Description",
            cluster: "DEVTOOLS",
          },
        };

        const result = await step.execute(context, {});

        expect(result.validatedData).toEqual({
          name: "Test Plan",
          description: "Test Description",
          cluster: "DEVTOOLS",
        });
      });

      it("should throw error for missing name", async () => {
        const context = {
          planData: {
            description: "Test Description",
            cluster: "DEVTOOLS",
          },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Plan name is required"
        );
      });

      it("should throw error for missing description", async () => {
        const context = {
          planData: {
            name: "Test Plan",
            cluster: "DEVTOOLS",
          },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Plan description is required"
        );
      });

      it("should throw error for missing cluster", async () => {
        const context = {
          planData: {
            name: "Test Plan",
            description: "Test Description",
          },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Plan cluster is required"
        );
      });

      it("should throw error for invalid cluster", async () => {
        const context = {
          planData: {
            name: "Test Plan",
            description: "Test Description",
            cluster: "INVALID",
          },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Invalid cluster"
        );
      });

      it("should normalize cluster to uppercase", async () => {
        const context = {
          planData: {
            name: "Test Plan",
            description: "Test Description",
            cluster: "devtools",
          },
        };

        const result = await step.execute(context, {});
        expect(result.validatedData.cluster).toBe("DEVTOOLS");
      });

      it("should trim whitespace from fields", async () => {
        const context = {
          planData: {
            name: "  Test Plan  ",
            description: "  Test Description  ",
            cluster: "  DEVTOOLS  ",
          },
        };

        const result = await step.execute(context, {});
        expect(result.validatedData.name).toBe("Test Plan");
        expect(result.validatedData.description).toBe("Test Description");
        expect(result.validatedData.cluster).toBe("DEVTOOLS");
      });
    });

    describe("createPlanRecord step", () => {
      const step = createPlanWorkflow.steps[1];

      it("should create plan record successfully", async () => {
        const context = { userID: "user123" };
        const state = {
          validatedData: {
            name: "Test Plan",
            description: "Test Description",
            cluster: "DEVTOOLS",
          },
        };

        const result = await step.execute(context, state);

        expect(mockExecDml).toHaveBeenCalledWith("INSERT", {
          table: "api_wf.plans",
          method: "INSERT",
          data: expect.objectContaining({
            name: "Test Plan",
            description: "Test Description",
            cluster: "DEVTOOLS",
            status: "new",
            priority: "medium",
            created_by: "user123",
            active: 1,
          }),
        });

        expect(result.planId).toBe("plan123");
      });

      it("should handle database errors", async () => {
        mockExecDml.mockResolvedValue({
          success: false,
          error: "Database error",
        });

        const context = { userID: "user123" };
        const state = { validatedData: {} };

        await expect(step.execute(context, state)).rejects.toThrow(
          "Database error"
        );
      });
    });

    describe("initializeImpactTracking step", () => {
      const step = createPlanWorkflow.steps[2];

      it("should record impact successfully", async () => {
        const context = { userID: "user123" };
        const state = {
          planId: "plan123",
          planData: {
            name: "Test Plan",
            cluster: "DEVTOOLS",
            priority: "high",
          },
        };

        const result = await step.execute(context, state);

        expect(mockImpactTracker.recordImpact).toHaveBeenCalledWith({
          planId: "plan123",
          type: "PLAN",
          description: "Plan created: Test Plan",
          phase: "idea",
          userID: "user123",
          metadata: {
            planName: "Test Plan",
            cluster: "DEVTOOLS",
            priority: "high",
          },
        });

        expect(result.impactInitialized).toBe(true);
        expect(result.impactId).toBe("impact123");
      });

      it("should handle impact tracking failures gracefully", async () => {
        mockImpactTracker.recordImpact.mockResolvedValue({
          success: false,
          error: "Impact tracking failed",
        });

        const context = { userID: "user123" };
        const state = { planId: "plan123", planData: { name: "Test Plan" } };

        const result = await step.execute(context, state);

        expect(result.impactInitialized).toBe(false);
        expect(result.impactId).toBeUndefined();
      });
    });
  });

  describe("updatePlanWorkflow", () => {
    describe("validateUpdateData step", () => {
      const step = updatePlanWorkflow.steps[0];

      it("should validate update data successfully", async () => {
        const context = {
          planId: "plan123",
          updateData: {
            name: "Updated Plan",
            status: "active",
            priority: "high",
          },
        };

        const result = await step.execute(context, {});

        expect(result.planId).toBe("plan123");
        expect(result.updateData.name).toBe("Updated Plan");
        expect(result.updateData.status).toBe("active");
        expect(result.updateData.priority).toBe("high");
        expect(result.changedFields).toEqual(["name", "status", "priority"]);
      });

      it("should throw error for missing plan ID", async () => {
        const context = { updateData: { name: "Test" } };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Plan ID is required for updates"
        );
      });

      it("should throw error for empty update data", async () => {
        const context = { planId: "plan123", updateData: {} };

        await expect(step.execute(context, {})).rejects.toThrow(
          "No update data provided"
        );
      });

      it("should validate status values", async () => {
        const context = {
          planId: "plan123",
          updateData: { status: "invalid_status" },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Invalid status"
        );
      });

      it("should validate priority values", async () => {
        const context = {
          planId: "plan123",
          updateData: { priority: "invalid_priority" },
        };

        await expect(step.execute(context, {})).rejects.toThrow(
          "Invalid priority"
        );
      });
    });
  });

  describe("archivePlanWorkflow", () => {
    describe("validateArchiveRequest step", () => {
      const step = archivePlanWorkflow.steps[0];

      it("should validate archive request successfully", async () => {
        const context = {
          planId: "plan123",
          archiveReason: "No longer needed",
        };

        const result = await step.execute(context, {});

        expect(result.planId).toBe("plan123");
        expect(result.archiveReason).toBe("No longer needed");
      });

      it("should provide default archive reason", async () => {
        const context = { planId: "plan123" };

        const result = await step.execute(context, {});

        expect(result.archiveReason).toBe("Manual archive");
      });

      it("should throw error for missing plan ID", async () => {
        const context = {};

        await expect(step.execute(context, {})).rejects.toThrow(
          "Plan ID is required for archiving"
        );
      });
    });

    describe("archivePlanRecord step", () => {
      const step = archivePlanWorkflow.steps[1];

      it("should archive plan record successfully", async () => {
        const context = { userID: "user123" };
        const state = { planId: "plan123" };

        const result = await step.execute(context, state);

        expect(mockExecDml).toHaveBeenCalledWith("UPDATE", {
          table: "api_wf.plans",
          method: "UPDATE",
          data: expect.objectContaining({
            active: 0,
            deleted_by: "user123",
            userID: "user123",
          }),
          where: { id: 123 },
        });

        expect(result.archived).toBe(true);
        expect(result.archivedAt).toBeTruthy();
      });
    });
  });
});
