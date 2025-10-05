/**
 * EventType Integration Utility for Plan 0039
 * Provides connection between eventTypes and modal-based workflows
 */

// Import eventTypes (TODO: Update path when shared-imports is installed)
// import { gridPlanList, formPlanDetail, selectPlanStatus } from '@whatsfresh/shared-imports';

/**
 * Execute a grid eventType query
 * @param {string} eventType - The eventType name (e.g., 'grid-planList')
 * @param {Object} params - Parameters for the query
 * @returns {Promise} - Query results
 */
export const executeGridQuery = async (eventType, params = {}) => {
  // TODO: Connect to actual eventType execution system
  console.log(`Executing ${eventType} with params:`, params);

  // Mock implementation for now
  if (eventType === "grid-planList") {
    return mockPlanListData(params.planStatus);
  }

  return [];
};

/**
 * Execute a form eventType query
 * @param {string} eventType - The eventType name (e.g., 'form-planDetail')
 * @param {Object} params - Parameters for the query
 * @returns {Promise} - Query results
 */
export const executeFormQuery = async (eventType, params = {}) => {
  console.log(`Executing ${eventType} with params:`, params);

  // Mock implementation
  if (eventType === "form-planDetail") {
    return mockPlanDetail(params.planID);
  }

  return null;
};

/**
 * Execute a workflow action
 * @param {string} workflow - The workflow name (e.g., 'createPlan', 'updatePlan')
 * @param {Object} data - Data to pass to the workflow
 * @returns {Promise} - Workflow result
 */
export const executeWorkflow = async (workflow, data = {}) => {
  console.log(`Executing workflow ${workflow} with data:`, data);

  // TODO: Connect to actual workflow system
  // This would integrate with the workflowTriggers from eventTypes

  // Mock implementation
  switch (workflow) {
    case "createPlan":
      return mockCreatePlan(data);
    case "updatePlan":
      return mockUpdatePlan(data);
    default:
      throw new Error(`Unknown workflow: ${workflow}`);
  }
};

// Mock data functions (remove when real integration is complete)
const mockPlanListData = (status) => {
  const allPlans = [
    {
      id: 39,
      name: "EventType → Workflow → Modal Generic Layer",
      cluster: "DEVTOOLS",
      status: "new",
      priority: "medium",
      description:
        "Prove the marriage of eventTypes <-> workflows with modal-based generic UI layer",
      assigned_to: null,
    },
    {
      id: 38,
      name: "Plan Management UI Foundation",
      cluster: "DEVTOOLS",
      status: "completed",
      priority: "high",
      description: "Build basic plan management interface",
      assigned_to: "Paul",
    },
    {
      id: 37,
      name: "Authentication System Upgrade",
      cluster: "CLIENT",
      status: "active",
      priority: "high",
      description: "Upgrade authentication system with new security features",
      assigned_to: "Paul",
    },
  ];

  return status === "all"
    ? allPlans
    : allPlans.filter((p) => p.status === status);
};

const mockPlanDetail = (planID) => {
  const plans = mockPlanListData("all");
  return plans.find((p) => p.id === parseInt(planID));
};

const mockCreatePlan = (data) => {
  // Mock plan creation
  return {
    success: true,
    id: Math.floor(Math.random() * 1000) + 100,
    ...data,
    created_at: new Date().toISOString(),
    created_by: "kiro",
  };
};

const mockUpdatePlan = (data) => {
  // Mock plan update
  return {
    success: true,
    ...data,
    updated_at: new Date().toISOString(),
    updated_by: "kiro",
  };
};

export default {
  executeGridQuery,
  executeFormQuery,
  executeWorkflow,
};
