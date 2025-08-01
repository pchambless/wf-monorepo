/**
 * Workflow Architecture Modules
 *
 * New workflow architecture with registry, orchestration, and monitoring
 * Following config-driven development standards
 */

// Core workflow architecture
export { workflowRegistry, WorkflowRegistry } from "./WorkflowRegistry.js";
export { WorkflowInstance } from "./WorkflowInstance.js";
export { workflowComposer } from "./WorkflowComposer.js";
export { workflowIntegrator } from "./integration/WorkflowIntegrator.js";

// Configuration system
export * from "../config/workflowConfig.js";

// Monitoring and debugging
export { workflowMonitor } from "./monitoring/WorkflowMonitor.js";
export { workflowDebugger } from "./monitoring/WorkflowDebugger.js";

// Testing framework
export { workflowTestFramework } from "./testing/WorkflowTestFramework.js";
export * from "./testing/IntegrationTestHelpers.js";

// Component lifecycle
export { componentLifecycleManager } from "./ComponentLifecycleManager.js";

// Import workflow definitions to register them
import "./plan/PlanOperationsWorkflow.js";
import "./communication/CommunicationWorkflow.js";
import "./impact/ImpactTracker.js";

// Initialize config-driven workflow system
import { workflowRegistry } from "./WorkflowRegistry.js";

// Auto-register workflows from config documentation as placeholders
// This ensures all documented workflows are available even if not fully implemented
try {
  const autoRegResult = workflowRegistry.autoRegisterFromConfig({
    registerPlaceholders: true,
  });

  console.log("Config-driven workflow initialization:", {
    autoRegistered: autoRegResult.registered,
    totalDocumented: autoRegResult.total,
    validationStatus: workflowRegistry.validateAllWorkflows(),
  });
} catch (error) {
  console.warn("Failed to initialize config-driven workflows:", error.message);
}

// Legacy workflow modules (for backward compatibility)
export {
  createPlan,
  completePlan,
  deletePlan,
  createPlanImpact,
  createPlanImpactBatch,
  trackDocumentCreation,
} from "./plans/index.js";

export { createCommunication } from "./communications/index.js";
export { createAnalysis } from "./analysis/index.js";
export { createGuidance } from "./guidance/index.js";
