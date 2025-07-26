/**
 * Business Workflow Modules
 *
 * Atomic workflow modules for complex business operations
 * Following the Business Workflow Modules architecture pattern
 */

// Plan workflows
export { createPlan, deletePlan } from "./plans/index.js";

// Communication workflows
export { createCommunication } from "./communications/index.js";
