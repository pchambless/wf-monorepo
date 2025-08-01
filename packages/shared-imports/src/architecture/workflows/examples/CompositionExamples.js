/**
 * Workflow Composition Examples
 *
 * Demonstrates common workflow composition patterns
 */

import { workflowComposer } from "../WorkflowComposer.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("CompositionExamples");

/**
 * Initialize example workflow compositions
 */
export function initializeCompositionExamples() {
  // Example 1: Plan Creation Pipeline
  workflowComposer.createSequential(
    "planCreationPipeline",
    [
      "validatePlanData",
      "createPlan",
      "trackPlanCreation",
      "refreshPlanContext",
    ],
    {
      failFast: true,
      passDataBetween: true,
      description: "Complete plan creation with validation and tracking",
    }
  );

  // Example 2: Parallel Data Processing
  workflowComposer.createParallel(
    "parallelDataProcessing",
    ["processUserData", "processMetrics", "processNotifications"],
    {
      failFast: false,
      aggregateResults: true,
      description: "Process multiple data streams in parallel",
    }
  );

  // Example 3: Conditional Communication Flow
  workflowComposer.createConditional(
    "conditionalCommunication",
    {
      'userType === "admin"': "adminCommunicationFlow",
      'userType === "agent"': "agentCommunicationFlow",
      'priority === "urgent"': "urgentCommunicationFlow",
    },
    {
      defaultWorkflow: "standardCommunicationFlow",
      evaluateAll: false,
      description: "Route communication based on user type and priority",
    }
  );

  // Example 4: Retry Wrapper for Unreliable Operations
  workflowComposer.createRetry("reliableApiCall", "externalApiWorkflow", {
    maxAttempts: 3,
    backoffStrategy: "exponential",
    baseDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error) => error.code !== "VALIDATION_ERROR",
    description: "Retry external API calls with exponential backoff",
  });

  // Example 5: Complex Multi-Stage Pipeline
  const complexPipeline = workflowComposer.createSequential(
    "complexDataPipeline",
    [
      // Stage 1: Parallel data collection
      workflowComposer.createParallel(
        "dataCollection",
        ["collectUserData", "collectSystemMetrics", "collectExternalData"],
        { aggregateResults: true }
      ),

      // Stage 2: Data validation and processing
      "validateCollectedData",
      "processAndTransformData",

      // Stage 3: Conditional storage based on data size
      workflowComposer.createConditional(
        "storageStrategy",
        {
          "dataSize > 1000000": "bulkStorageWorkflow",
          "dataSize > 10000": "batchStorageWorkflow",
        },
        { defaultWorkflow: "standardStorageWorkflow" }
      ),

      // Stage 4: Notification and cleanup
      "sendProcessingNotification",
      "cleanupTempData",
    ],
    {
      failFast: true,
      passDataBetween: true,
      description: "Complex multi-stage data processing pipeline",
    }
  );

  log.info("Workflow composition examples initialized", {
    compositions: workflowComposer.listCompositions().map((c) => ({
      name: c.name,
      type: c.type,
      description: c.options.description,
    })),
  });
}

/**
 * Example workflow definitions for demonstration
 */
export const exampleWorkflows = {
  // Simple validation workflow
  validatePlanData: {
    name: "validatePlanData",
    steps: [
      {
        name: "checkRequiredFields",
        execute: async (context) => {
          const required = ["title", "description", "phase"];
          const missing = required.filter((field) => !context[field]);

          if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(", ")}`);
          }

          return { validationPassed: true };
        },
      },
      {
        name: "validatePhase",
        execute: async (context) => {
          const validPhases = ["idea", "development", "adhoc"];
          if (!validPhases.includes(context.phase)) {
            throw new Error(`Invalid phase: ${context.phase}`);
          }

          return { phaseValid: true };
        },
      },
    ],
  },

  // Data processing workflow with conditional steps
  processUserData: {
    name: "processUserData",
    steps: [
      {
        name: "loadUserData",
        execute: async (context) => {
          // Simulate data loading
          return {
            userData: {
              id: context.userId,
              name: "Test User",
              preferences: { theme: "dark" },
            },
          };
        },
      },
      {
        name: "enrichUserData",
        condition: "userData.id exists",
        execute: async (context, state) => {
          // Enrich user data with additional information
          return {
            userData: {
              ...state.data.userData,
              enriched: true,
              lastLogin: new Date().toISOString(),
            },
          };
        },
      },
    ],
  },

  // Parallel processing example
  processMetrics: {
    name: "processMetrics",
    steps: [
      {
        name: "calculateMetrics",
        parallel: true,
        execute: async (context) => {
          // Simulate metrics calculation
          await new Promise((resolve) => setTimeout(resolve, 100));
          return {
            metrics: {
              performance: 0.95,
              reliability: 0.98,
              satisfaction: 0.92,
            },
          };
        },
      },
    ],
  },

  // Error-prone workflow for retry demonstration
  externalApiWorkflow: {
    name: "externalApiWorkflow",
    steps: [
      {
        name: "callExternalApi",
        execute: async (context) => {
          // Simulate unreliable API call
          if (Math.random() < 0.7) {
            const error = new Error("API temporarily unavailable");
            error.retryable = true;
            throw error;
          }

          return { apiResponse: { status: "success", data: "API data" } };
        },
      },
    ],
  },
};

/**
 * Register example workflows with the registry
 */
export async function registerExampleWorkflows() {
  const { workflowRegistry } = await import("../WorkflowRegistry.js");

  Object.values(exampleWorkflows).forEach((workflow) => {
    workflowRegistry.register(workflow);
  });

  log.info("Example workflows registered", {
    workflows: Object.keys(exampleWorkflows),
  });
}

/**
 * Demonstrate workflow composition usage
 */
export async function demonstrateCompositions() {
  log.info("Demonstrating workflow compositions...");

  // Example 1: Sequential pipeline
  try {
    const pipelineResult = await workflowComposer
      .getComposition("planCreationPipeline")
      .execute({
        title: "Test Plan",
        description: "A test plan for demonstration",
        phase: "development",
        userId: 123,
      });

    log.info("Plan creation pipeline result", pipelineResult);
  } catch (error) {
    log.error("Plan creation pipeline failed", { error: error.message });
  }

  // Example 2: Parallel processing
  try {
    const parallelResult = await workflowComposer
      .getComposition("parallelDataProcessing")
      .execute({ userId: 123 });

    log.info("Parallel processing result", parallelResult);
  } catch (error) {
    log.error("Parallel processing failed", { error: error.message });
  }

  // Example 3: Conditional execution
  try {
    const conditionalResult = await workflowComposer
      .getComposition("conditionalCommunication")
      .execute({
        userType: "admin",
        priority: "normal",
        message: "Test message",
      });

    log.info("Conditional communication result", conditionalResult);
  } catch (error) {
    log.error("Conditional communication failed", { error: error.message });
  }

  // Example 4: Retry mechanism
  try {
    const retryResult = await workflowComposer
      .getComposition("reliableApiCall")
      .execute({ endpoint: "/api/test" });

    log.info("Retry workflow result", retryResult);
  } catch (error) {
    log.error("Retry workflow failed", { error: error.message });
  }
}

export default {
  initializeCompositionExamples,
  exampleWorkflows,
  registerExampleWorkflows,
  demonstrateCompositions,
};
