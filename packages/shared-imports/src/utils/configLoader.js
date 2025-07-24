/**
 * Configuration loader for form dropdowns
 * Embedded config data (originally from .kiro/config/)
 */

// Embedded config data to avoid import path issues
const priorityConfig = [
  { value: "low", label: "Low - FYI/Nice to have", color: "default" },
  { value: "normal", label: "Normal - Standard input", color: "primary" },
  { value: "high", label: "High - Important for business", color: "warning" },
  { value: "urgent", label: "Urgent - Blocking decisions", color: "error" },
];

const communicationTypeConfig = [
  {
    value: "strategic-input",
    label: "Strategic Input",
    description: "Provide business context and strategic direction",
    color: "primary",
    icon: "🎯",
  },
  {
    value: "priority-change",
    label: "Priority Change",
    description: "Modify plan priorities or urgency levels",
    color: "warning",
    icon: "⚡",
  },
  {
    value: "scope-modification",
    label: "Scope Modification",
    description: "Adjust plan scope or requirements",
    color: "info",
    icon: "📋",
  },
  {
    value: "architectural-guidance",
    label: "Architectural Guidance",
    description: "Provide technical direction or constraints",
    color: "secondary",
    icon: "🏗️",
  },
  {
    value: "business-requirement",
    label: "Business Requirement",
    description: "New business needs or constraints",
    color: "success",
    icon: "💼",
  },
];

const clustersConfig = {
  API: {
    name: "API",
    blastRadius: "high",
    description: "Server endpoints and data flow",
  },
  SHARED: {
    name: "SHARED",
    blastRadius: "high",
    description: "Cross-package dependencies",
  },
  EVENTS: {
    name: "EVENTS",
    blastRadius: "high",
    description: "Cross-app functionality",
  },
  DEVTOOLS: {
    name: "DEVTOOLS",
    blastRadius: "medium",
    description: "Code generation and tooling",
  },
  LOGGING: {
    name: "LOGGING",
    blastRadius: "medium",
    description: "Debugging and monitoring",
  },
  CRUD: {
    name: "CRUD",
    blastRadius: "low",
    description: "Standard data operations",
  },
  MAPPING: {
    name: "MAPPING",
    blastRadius: "low",
    description: "Batch mapping workflows",
  },
  RECIPES: {
    name: "RECIPES",
    blastRadius: "low",
    description: "Recipe management and processing",
  },
  REPORTS: {
    name: "REPORTS",
    blastRadius: "low",
    description: "Document generation",
  },
  UX: {
    name: "UX",
    blastRadius: "low",
    description: "User interface components",
  },
  AUTH: {
    name: "AUTH",
    blastRadius: "medium",
    description: "Authentication and sessions",
  },
  NAVIGATION: {
    name: "NAVIGATION",
    blastRadius: "medium",
    description: "Routing and UI flow",
  },
};

/**
 * Get priority levels for dropdowns
 */
export const getPriorityOptions = () => {
  return priorityConfig;
};

/**
 * Get communication types for dropdowns
 */
export const getCommunicationTypeOptions = () => {
  return communicationTypeConfig;
};

/**
 * Get cluster options for dropdowns (converted from object to array)
 */
export const getClusterOptions = () => {
  return Object.entries(clustersConfig).map(([key, cluster]) => ({
    value: key,
    label: cluster.name,
    description: cluster.description,
  }));
};

/**
 * Get active plans from database (Plan 0018: Database-native)
 * Uses planList eventType instead of hardcoded data
 */
export const getActivePlans = async () => {
  try {
    // Import execEvent for database access
    const { execEvent } = await import("@whatsfresh/shared-imports/api");

    // Use planList eventType (eventID: 101)
    const result = await execEvent("planList");

    if (result && Array.isArray(result)) {
      // Filter for active/ongoing plans and format for dropdown
      return result
        .filter((plan) =>
          ["active", "ongoing", "pending"].includes(plan.status)
        )
        .map((plan) => ({
          value: plan.id.toString(),
          label: `${plan.id.toString().padStart(4, "0")} - ${plan.name}`,
        }));
    } else {
      // Fallback to static data if database fails
      return [
        { value: "18", label: "0018 - Database Migration & Event Integration" },
      ];
    }
  } catch (error) {
    console.error("Error loading plans from database:", error);
    // Fallback to static data
    return [
      { value: "18", label: "0018 - Database Migration & Event Integration" },
    ];
  }
};

/**
 * Get plans for completion (active and ongoing status)
 * Uses planList eventType with status filtering
 */
export const getCompletablePlans = async () => {
  try {
    // Import execEvent for database access
    const { execEvent } = await import("@whatsfresh/shared-imports/api");

    // Use planList eventType (eventID: 101)
    const result = await execEvent("planList");

    if (result && Array.isArray(result)) {
      // Filter for completable plans and format for dropdown
      return result
        .filter((plan) => ["active", "ongoing"].includes(plan.status))
        .map((plan) => ({
          value: plan.id.toString(),
          label: `${plan.id.toString().padStart(4, "0")} - ${plan.name}`,
          description: `${plan.cluster} | Status: ${plan.status}`,
        }));
    } else {
      // Fallback to static data if database fails
      return [
        {
          value: "18",
          label: "0018 - Database Migration & Event Integration",
          description: "PLANS | Status: active",
        },
      ];
    }
  } catch (error) {
    console.error("Error loading completable plans from database:", error);
    // Fallback to static data
    return [
      {
        value: "18",
        label: "0018 - Database Migration & Event Integration",
        description: "PLANS | Status: active",
      },
    ];
  }
};
