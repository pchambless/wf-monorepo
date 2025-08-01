/**
 * Plan Operations Workflows
 *
 * Standardized workflows for plan create/update/archive operations
 * Includes automatic impact tracking and context refresh
 */

import { workflowRegistry } from "../WorkflowRegistry.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("PlanOperationsWorkflow");

/**
 * Create Plan Workflow
 * Creates a new plan with validation and impact tracking
 */
const createPlanWorkflow = {
  name: "createPlan",
  description: "Creates a new plan with validation and impact tracking",
  category: "plan-operations",
  timeout: 15000,
  steps: [
    {
      name: "validatePlanData",
      execute: async (context, state) => {
        log.debug("Validating plan data", { planData: context.planData });

        const { name, description, cluster } = context.planData || {};

        if (!name || !name.trim()) {
          throw new Error("Plan name is required");
        }

        if (!description || !description.trim()) {
          throw new Error("Plan description is required");
        }

        if (!cluster || !cluster.trim()) {
          throw new Error("Plan cluster is required");
        }

        // Validate cluster against known values
        const validClusters = ["DEVTOOLS", "PLANS", "UI", "API"];
        if (!validClusters.includes(cluster.toUpperCase())) {
          throw new Error(
            `Invalid cluster. Must be one of: ${validClusters.join(", ")}`
          );
        }

        return {
          validatedData: {
            ...context.planData,
            name: name.trim(),
            description: description.trim(),
            cluster: cluster.toUpperCase(),
          },
        };
      },
    },

    {
      name: "createPlanRecord",
      execute: async (context, state) => {
        log.debug("Creating plan record", { planData: state.validatedData });

        const { execDml } = await import("@whatsfresh/shared-imports/api");

        const dmlData = {
          table: "api_wf.plans",
          method: "INSERT",
          data: {
            ...state.validatedData,
            status: "new",
            priority: state.validatedData.priority || "medium",
            created_by: context.userID, // Agent name (varchar) for plans
            created_at: new Date().toISOString(),
            active: 1,
          },
        };

        const result = await execDml("INSERT", dmlData);

        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to create plan record");
        }

        log.info("Plan record created", { planId: result.insertId });

        return {
          planId: result.insertId,
          planData: dmlData.data,
        };
      },
    },

    {
      name: "initializeImpactTracking",
      execute: async (context, state) => {
        log.debug("Initializing impact tracking", { planId: state.planId });

        const { impactTracker } = await import("../impact/ImpactTracker.js");

        const impactResult = await impactTracker.recordImpact({
          planId: state.planId,
          type: "PLAN",
          description: `Plan created: ${state.planData.name}`,
          phase: "idea",
          userID: context.userID,
          metadata: {
            planName: state.planData.name,
            cluster: state.planData.cluster,
            priority: state.planData.priority,
          },
        });

        if (!impactResult.success) {
          log.warn("Impact tracking failed during plan creation", {
            error: impactResult.error,
          });
        }

        return {
          impactInitialized: impactResult.success,
          impactId: impactResult.impactId,
        };
      },
    },
  ],

  contextRefresh: ["planList", "impactTracking"],
  errorHandling: "fail-fast",
  retryable: true,

  userFriendlyMessages: {
    "Plan name is required": "Please enter a plan name",
    "Plan description is required": "Please enter a plan description",
    "Plan cluster is required": "Please select a cluster",
    "Invalid cluster":
      "Please select a valid cluster (DEVTOOLS, PLANS, UI, or API)",
    "Failed to create plan record": "Unable to save plan. Please try again.",
    "Database connection failed":
      "Unable to save plan. Please check your connection.",
  },
};

/**
 * Update Plan Workflow
 * Updates an existing plan with validation and impact tracking
 */
const updatePlanWorkflow = {
  name: "updatePlan",
  description: "Updates an existing plan with validation and impact tracking",
  category: "plan-operations",
  timeout: 10000,
  steps: [
    {
      name: "validateUpdateData",
      execute: async (context, state) => {
        log.debug("Validating update data", {
          planId: context.planId,
          updateData: context.updateData,
        });

        if (!context.planId) {
          throw new Error("Plan ID is required for updates");
        }

        if (
          !context.updateData ||
          Object.keys(context.updateData).length === 0
        ) {
          throw new Error("No update data provided");
        }

        // Validate specific fields if they're being updated
        const { name, description, cluster, status, priority } =
          context.updateData;

        if (name !== undefined && (!name || !name.trim())) {
          throw new Error("Plan name cannot be empty");
        }

        if (
          description !== undefined &&
          (!description || !description.trim())
        ) {
          throw new Error("Plan description cannot be empty");
        }

        if (cluster !== undefined) {
          const validClusters = ["DEVTOOLS", "PLANS", "UI", "API"];
          if (!validClusters.includes(cluster.toUpperCase())) {
            throw new Error(
              `Invalid cluster. Must be one of: ${validClusters.join(", ")}`
            );
          }
        }

        if (status !== undefined) {
          const validStatuses = [
            "new",
            "active",
            "in-progress",
            "on-hold",
            "completed",
            "ongoing",
            "archived",
          ];
          if (!validStatuses.includes(status.toLowerCase())) {
            throw new Error(
              `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            );
          }
        }

        if (priority !== undefined) {
          const validPriorities = ["low", "medium", "high", "urgent"];
          if (!validPriorities.includes(priority.toLowerCase())) {
            throw new Error(
              `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
            );
          }
        }

        // Clean and normalize update data
        const cleanedData = {};
        if (name !== undefined) cleanedData.name = name.trim();
        if (description !== undefined)
          cleanedData.description = description.trim();
        if (cluster !== undefined) cleanedData.cluster = cluster.toUpperCase();
        if (status !== undefined) cleanedData.status = status.toLowerCase();
        if (priority !== undefined)
          cleanedData.priority = priority.toLowerCase();

        // Copy other fields as-is
        Object.keys(context.updateData).forEach((key) => {
          if (
            !["name", "description", "cluster", "status", "priority"].includes(
              key
            )
          ) {
            cleanedData[key] = context.updateData[key];
          }
        });

        return {
          planId: context.planId,
          updateData: cleanedData,
          changedFields: Object.keys(cleanedData),
        };
      },
    },

    {
      name: "updatePlanRecord",
      execute: async (context, state) => {
        log.debug("Updating plan record", {
          planId: state.planId,
          updateData: state.updateData,
        });

        const { execDml } = await import("@whatsfresh/shared-imports/api");

        const dmlData = {
          table: "api_wf.plans",
          method: "UPDATE",
          data: {
            ...state.updateData,
            updated_at: new Date().toISOString(),
            userID: context.userID,
          },
          where: { id: parseInt(state.planId) },
        };

        const result = await execDml("UPDATE", dmlData);

        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to update plan record");
        }

        log.info("Plan record updated", {
          planId: state.planId,
          changedFields: state.changedFields,
        });

        return {
          updated: true,
          planData: dmlData.data,
          affectedRows: result.affectedRows,
        };
      },
    },

    {
      name: "recordUpdateImpact",
      execute: async (context, state) => {
        log.debug("Recording update impact", {
          planId: state.planId,
          changedFields: state.changedFields,
        });

        const { impactTracker } = await import("../impact/ImpactTracker.js");

        const description = `Plan updated: ${state.changedFields.join(", ")}`;

        const impactResult = await impactTracker.recordImpact({
          planId: state.planId,
          type: "MODIFY",
          description,
          phase: "development",
          userID: context.userID,
          metadata: {
            changedFields: state.changedFields,
            updateData: state.updateData,
          },
        });

        if (!impactResult.success) {
          log.warn("Impact tracking failed during plan update", {
            error: impactResult.error,
          });
        }

        return {
          impactRecorded: impactResult.success,
          impactId: impactResult.impactId,
        };
      },
    },
  ],

  contextRefresh: ["planContext", "impactTracking", "planList"],
  errorHandling: "fail-fast",
  retryable: true,

  userFriendlyMessages: {
    "Plan ID is required for updates":
      "Unable to identify which plan to update",
    "No update data provided": "No changes were specified",
    "Plan name cannot be empty": "Plan name is required",
    "Plan description cannot be empty": "Plan description is required",
    "Invalid cluster": "Please select a valid cluster",
    "Invalid status": "Please select a valid status",
    "Invalid priority": "Please select a valid priority",
    "Failed to update plan record": "Unable to save changes. Please try again.",
    "Plan not found": "The selected plan no longer exists",
  },
};

/**
 * Archive Plan Workflow
 * Archives a plan using soft delete (deleted_at, active=0)
 */
const archivePlanWorkflow = {
  name: "archivePlan",
  description: "Archives a plan using soft delete (deleted_at, active=0)",
  category: "plan-operations",
  timeout: 8000,
  steps: [
    {
      name: "validateArchiveRequest",
      execute: async (context, state) => {
        log.debug("Validating archive request", { planId: context.planId });

        if (!context.planId) {
          throw new Error("Plan ID is required for archiving");
        }

        // Optional: Check if plan exists and is not already archived
        // This could be added as a separate validation step if needed

        return {
          planId: context.planId,
          archiveReason: context.archiveReason || "Manual archive",
        };
      },
    },

    {
      name: "archivePlanRecord",
      execute: async (context, state) => {
        log.debug("Archiving plan record", { planId: state.planId });

        const { execDml } = await import("@whatsfresh/shared-imports/api");

        // Soft delete: set deleted_at and active=0
        const dmlData = {
          table: "api_wf.plans",
          method: "UPDATE",
          data: {
            active: 0,
            deleted_at: new Date().toISOString(),
            deleted_by: context.userID,
            updated_at: new Date().toISOString(),
            userID: context.userID,
          },
          where: { id: parseInt(state.planId) },
        };

        const result = await execDml("UPDATE", dmlData);

        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to archive plan record");
        }

        log.info("Plan record archived", {
          planId: state.planId,
          affectedRows: result.affectedRows,
        });

        return {
          archived: true,
          archivedAt: dmlData.data.deleted_at,
        };
      },
    },

    {
      name: "recordArchiveImpact",
      execute: async (context, state) => {
        log.debug("Recording archive impact", { planId: state.planId });

        const { impactTracker } = await import("../impact/ImpactTracker.js");

        const description = `Plan archived (soft delete): ${state.archiveReason}`;

        const impactResult = await impactTracker.recordImpact({
          planId: state.planId,
          type: "PLAN",
          description,
          phase: "development",
          userID: context.userID,
          metadata: {
            archiveReason: state.archiveReason,
            archivedAt: state.archivedAt,
          },
        });

        if (!impactResult.success) {
          log.warn("Impact tracking failed during plan archive", {
            error: impactResult.error,
          });
        }

        return {
          impactRecorded: impactResult.success,
          impactId: impactResult.impactId,
        };
      },
    },
  ],

  contextRefresh: ["planList", "planContext", "impactTracking"],
  errorHandling: "fail-fast",
  retryable: true,

  userFriendlyMessages: {
    "Plan ID is required for archiving":
      "Unable to identify which plan to archive",
    "Failed to archive plan record":
      "Unable to archive plan. Please try again.",
    "Plan not found": "The selected plan no longer exists",
  },
};

// Register workflows with the registry
workflowRegistry.register("createPlan", createPlanWorkflow);
workflowRegistry.register("updatePlan", updatePlanWorkflow);
workflowRegistry.register("archivePlan", archivePlanWorkflow);

log.info("Plan operation workflows registered", {
  workflows: ["createPlan", "updatePlan", "archivePlan"],
});

// Export workflows for testing
export { createPlanWorkflow, updatePlanWorkflow, archivePlanWorkflow };
