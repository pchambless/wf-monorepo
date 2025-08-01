/**
 * Config-Driven Workflow System Tests
 *
 * Tests the integration between selectVals.json workflow documentation
 * and the WorkflowRegistry system
 */

import { workflowRegistry } from "../WorkflowRegistry.js";
import { 
  getRegisteredWorkflows, 
  getWorkflowDocumentation, 
  validateWorkflowDocumentation 
} from "../config/workflowConfig.js";

describe("Config-Driven Workflow System", () => {
  beforeEach(() => {
    // Clear registry for clean tests
    workflowRegistry.clear();
  });

  describe("Workflow Documentation Integration", () => {
    test("should load workflow documentation from config", () => {
      const workflows = getRegisteredWorkflows();
      
      expect(workflows).toBeInstanceOf(Array);
      expect(workflows.length).toBeGreaterThan(0);
      
      // Check that our documented workflows exist
      const workflowNames = workflows.map(w => w.value);
      expect(workflowNames).toContain("createPlan");
      expect(workflowNames).toContain("updatePlan");
      expect(workflowNames).toContain("archivePlan");
    });

    test("should get specific workflow documentation", () => {
      const createPlanDoc = getWorkflowDocumentation("createPlan");
      
      expect(createPlanDoc).toBeTruthy();
      expect(createPlanDoc.name).toBe("createPlan");
      expect(createPlanDoc.category).toBe("plan-operations");
      expect(createPlanDoc.timeout).toBe(15000);
      expect(createPlanDoc.steps).toContain("validatePlanData");
      expect(createPlanDoc.steps).toContain("createPlanRecord");
      expect(createPlanDoc.steps).toContain("initializeImpactTracking");
    });

    test("should validate workflow documentation", () => {
      const validation = validateWorkflowDocumentation("createPlan");
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test("should detect undocumented workflows", () => {
      const validation = validateWorkflowDocumentation("nonExistentWorkflow");
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Workflow 'nonExistentWorkflow' is not documented in selectVals.json");
    });
  });

  describe("WorkflowRegistry Integration", () => {
    test("should auto-register workflows from config", () => {
      const result = workflowRegistry.autoRegisterFromConfig();
      
      expect(result.registered).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      
      // Check that workflows are registered
      const registeredWorkflows = workflowRegistry.listWorkflows();
      expect(registeredWorkflows).toContain("createPlan");
      expect(registeredWorkflows).toContain("updatePlan");
      expect(registeredWorkflows).toContain("archivePlan");
    });

    test("should merge config documentation with registered workflows", () => {
      // Import plan workflows to register them
      await import("../plan/PlanOperationsWorkflow.js");
      
      const createPlanWorkflow = workflowRegistry.getWorkflow("createPlan");
      
      expect(createPlanWorkflow).toBeTruthy();
      expect(createPlanWorkflow.category).toBe("plan-operations");
      expect(createPlanWorkflow.timeout).toBe(15000);
      expect(createPlanWorkflow.configDocumentation).toBeTruthy();
    });

    test("should validate all workflows against config", () => {
      // Import plan workflows
      await import("../plan/PlanOperationsWorkflow.js");
      
      const validation = workflowRegistry.validateAllWorkflows();
      
      expect(validation.registered).toBeGreaterThan(0);
      expect(validation.documented).toBeGreaterThan(0);
      expect(validation.validated).toContain("createPlan");
      expect(validation.validated).toContain("updatePlan");
      expect(validation.validated).toContain("archivePlan");
    });

    test("should get workflows by category", () => {
      // Import plan workflows
      await import("../plan/PlanOperationsWorkflow.js");
      
      const planWorkflows = workflowRegistry.getWorkflowsByCategory("plan-operations");
      
      expect(planWorkflows.length).toBeGreaterThan(0);
      expect(planWorkflows.map(w => w.name)).toContain("createPlan");
      expect(planWorkflows.map(w => w.name)).toContain("updatePlan");
      expect(planWorkflows.map(w => w.name)).toContain("archivePlan");
    });

    test("should provide documentation status", () => {
      // Import plan workflows
      await import("../plan/PlanOperationsWorkflow.js");
      
      const status = workflowRegistry.getDocumentationStatus("createPlan");
      
      expect(status.name).toBe("createPlan");
      expect(status.registered).toBe(true);
      expect(status.documented).toBe(true);
      expect(status.isPlaceholder).toBe(false);
      expect(status.validation.valid).toBe(true);
      expect(status.configDocumentation).toBeTruthy();
      expect(status.registeredDefinition).toBeTruthy();
    });
  });

  describe("Placeholder Workflow System", () => {
    test("should create placeholder workflows for documented but unimplemented workflows", () => {
      // Register only config-documented workflows as placeholders
      workflowRegistry.autoRegisterFromConfig({ registerPlaceholders: true });
      
      const trackImpactWorkflow = workflowRegistry.getWorkflow("trackImpact");
      
      expect(trackImpactWorkflow).toBeTruthy();
      expect(trackImpactWorkflow.isPlaceholder).toBe(true);
      expect(trackImpactWorkflow.category).toBe("impact-tracking");
      expect(trackImpactWorkflow.timeout).toBe(12000);
    });

    test("should throw helpful error when executing placeholder workflow", async () => {
      workflowRegistry.autoRegisterFromConfig({ registerPlaceholders: true });
      
      await expect(
        workflowRegistry.execute("trackImpact", {})
      ).rejects.toThrow("is documented in config but not implemented");
    });
  });

  describe("Config-Driven Development Benefits", () => {
    test("should provide working documentation for developers", () => {
      const allWorkflows = getRegisteredWorkflows();
      
      // Each workflow should have comprehensive documentation
      allWorkflows.forEach(workflow => {
        expect(workflow.value).toBeTruthy();
        expect(workflow.label).toBeTruthy();
        expect(workflow.description).toBeTruthy();
        expect(workflow.category).toBeTruthy();
        expect(workflow.timeout).toBeGreaterThan(0);
        expect(workflow.steps).toBeInstanceOf(Array);
        expect(workflow.contextRefresh).toBeInstanceOf(Array);
        expect(workflow.errorHandling).toBeTruthy();
        expect(typeof workflow.retryable).toBe("boolean");
      });
    });

    test("should enable workflow discovery and tooling", () => {
      const categories = workflowRegistry.getWorkflowsByCategory("plan-operations");
      const communicationWorkflows = workflowRegistry.getWorkflowsByCategory("communication");
      const impactWorkflows = workflowRegistry.getWorkflowsByCategory("impact-tracking");
      
      // Should be able to discover workflows by category
      expect(categories.length).toBeGreaterThan(0);
      
      // Should provide metadata for tooling
      categories.forEach(workflow => {
        expect(workflow.category).toBe("plan-operations");
        expect(workflow.timeout).toBeGreaterThan(0);
      });
    });
  });
});