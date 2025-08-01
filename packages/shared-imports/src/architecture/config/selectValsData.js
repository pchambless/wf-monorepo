/**
 * SelectVals Data
 *
 * Workflow configuration data exported as JavaScript for maximum compatibility
 * This is the essential workflow data from selectVals.json
 */

export const selectVals = {
  registeredWorkflows: {
    name: "registeredWorkflows",
    description:
      "Working documentation of all registered workflows in the system",
    choices: [
      {
        value: "createPlan",
        label: "Create Plan",
        ordr: 1,
        category: "plan-operations",
        description: "Creates a new plan with validation and impact tracking",
        timeout: 15000,
        contextRefresh: ["planList", "impactTracking"],
        steps: [
          "validatePlanData",
          "createPlanRecord",
          "initializeImpactTracking",
        ],
        errorHandling: "fail-fast",
        retryable: true,
      },
      {
        value: "updatePlan",
        label: "Update Plan",
        ordr: 2,
        category: "plan-operations",
        description:
          "Updates an existing plan with validation and impact tracking",
        timeout: 10000,
        contextRefresh: ["planContext", "impactTracking", "planList"],
        steps: ["validateUpdateData", "updatePlanRecord", "recordUpdateImpact"],
        errorHandling: "fail-fast",
        retryable: true,
      },
      {
        value: "archivePlan",
        label: "Archive Plan",
        ordr: 3,
        category: "plan-operations",
        description: "Archives a plan using soft delete (deleted_at, active=0)",
        timeout: 8000,
        contextRefresh: ["planList", "planContext", "impactTracking"],
        steps: [
          "validateArchiveRequest",
          "archivePlanRecord",
          "recordArchiveImpact",
        ],
        errorHandling: "fail-fast",
        retryable: true,
      },
      {
        value: "createCommunication",
        label: "Create Communication",
        ordr: 4,
        category: "communication",
        description:
          "Creates a new communication with validation and modal coordination",
        timeout: 10000,
        contextRefresh: ["communicationHistory"],
        steps: [
          "validateCommunicationData",
          "createCommunicationRecord",
          "triggerModalCoordination",
        ],
        errorHandling: "fail-fast",
        retryable: true,
      },
      {
        value: "trackImpact",
        label: "Track Impact",
        ordr: 5,
        category: "impact-tracking",
        description:
          "Records impact tracking data with automatic categorization",
        timeout: 12000,
        contextRefresh: ["impactTracking"],
        steps: ["validateImpactData", "categorizeImpact", "recordImpact"],
        errorHandling: "continue",
        retryable: true,
      },
    ],
  },
  workflowCategories: {
    name: "workflowCategories",
    description: "Categories for organizing workflows",
    choices: [
      {
        value: "plan-operations",
        label: "Plan Operations",
        ordr: 1,
        color: "blue",
        description: "CRUD operations for plans",
      },
      {
        value: "communication",
        label: "Communication",
        ordr: 2,
        color: "green",
        description: "Communication and messaging workflows",
      },
      {
        value: "impact-tracking",
        label: "Impact Tracking",
        ordr: 3,
        color: "purple",
        description: "Impact tracking and analysis workflows",
      },
      {
        value: "business-process",
        label: "Business Process",
        ordr: 4,
        color: "orange",
        description: "Complex business process workflows",
      },
      {
        value: "integration",
        label: "Integration",
        ordr: 5,
        color: "teal",
        description: "Cross-system integration workflows",
      },
      {
        value: "utility",
        label: "Utility",
        ordr: 6,
        color: "gray",
        description: "Utility and helper workflows",
      },
    ],
  },
  // Provide empty structures for other config sections
  workflowTimeouts: { choices: [] },
  workflowRetryPolicies: { choices: [] },
  workflowErrorHandling: { choices: [] },
  workflowCommunicationPatterns: { choices: [] },
  workflowDataPassingStrategies: { choices: [] },
  workflowAgents: { choices: [] },
  workflowPhases: { choices: [] },
  workflowImpactTypes: { choices: [] },
};

export default selectVals;
