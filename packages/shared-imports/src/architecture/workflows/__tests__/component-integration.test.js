/**
 * Component Integration Tests
 *
 * Tests for component integration with workflow system using config-driven approach
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { workflowRegistry } from "../WorkflowRegistry.js";
import {
  getComponentWorkflowConfig,
  getWorkflowTimeout,
} from "../config/workflowConfig.js";

describe("Component Workflow Integration", () => {
  beforeEach(() => {
    workflowRegistry.clear();
  });

  describe("Config-Driven Workflow Options", () => {
    it("should provide form-specific workflow configuration", () => {
      const formConfig = getComponentWorkflowConfig("form");

      expect(formConfig).toHaveProperty("timeout");
      expect(formConfig).toHaveProperty("retryPolicy");
      expect(formConfig).toHaveProperty("errorHandling");
      expect(formConfig.timeout).toBe(15000); // Form-specific timeout
      expect(formConfig.errorHandling).toBe("fail-fast");
    });

    it("should provide editor-specific workflow configuration", () => {
      const editorConfig = getComponentWorkflowConfig("editor");

      expect(editorConfig).toHaveProperty("timeout");
      expect(editorConfig).toHaveProperty("retryPolicy");
      expect(editorConfig).toHaveProperty("errorHandling");
      expect(editorConfig.timeout).toBe(10000); // Editor-specific timeout
      expect(editorConfig.errorHandling).toBe("continue"); // More lenient for editors
    });

    it("should provide modal-specific workflow configuration", () => {
      const modalConfig = getComponentWorkflowConfig("modal");

      expect(modalConfig).toHaveProperty("timeout");
      expect(modalConfig).toHaveProperty("retryPolicy");
      expect(modalConfig).toHaveProperty("errorHandling");
      expect(modalConfig.timeout).toBe(8000); // Shorter timeout for modals
      expect(modalConfig.errorHandling).toBe("fail-fast");
    });

    it("should get workflow-specific timeouts from config", () => {
      const createPlanTimeout = getWorkflowTimeout("createPlan");
      const updatePlanTimeout = getWorkflowTimeout("updatePlan");
      const createCommunicationTimeout = getWorkflowTimeout(
        "createCommunication"
      );

      expect(createPlanTimeout).toBe(15000);
      expect(updatePlanTimeout).toBe(10000);
      expect(createCommunicationTimeout).toBe(10000);
    });

    it("should provide default timeout for unknown workflows", () => {
      const unknownTimeout = getWorkflowTimeout("unknownWorkflow");
      expect(unknownTimeout).toBe(30000); // Default timeout
    });
  });

  describe("Component Integration Patterns", () => {
    it("should integrate form components with workflows", async () => {
      // Register a test workflow
      workflowRegistry.register("testFormWorkflow", {
        name: "testFormWorkflow",
        steps: [
          {
            name: "processForm",
            execute: async (context) => ({
              processed: true,
              formData: context.formData,
            }),
          },
        ],
      });

      const formConfig = getComponentWorkflowConfig("form");
      const result = await workflowRegistry.execute(
        "testFormWorkflow",
        {
          formData: { name: "Test", value: "Data" },
        },
        formConfig
      );

      expect(result.success).toBe(true);
      expect(result.data.processed).toBe(true);
      expect(result.data.formData).toEqual({ name: "Test", value: "Data" });
    });

    it("should integrate editor components with workflows", async () => {
      // Register a test workflow
      workflowRegistry.register("testEditorWorkflow", {
        name: "testEditorWorkflow",
        steps: [
          {
            name: "processEdit",
            execute: async (context) => ({
              edited: true,
              changes: context.changes,
            }),
          },
        ],
      });

      const editorConfig = getComponentWorkflowConfig("editor");
      const result = await workflowRegistry.execute(
        "testEditorWorkflow",
        {
          changes: { field: "updated value" },
        },
        editorConfig
      );

      expect(result.success).toBe(true);
      expect(result.data.edited).toBe(true);
      expect(result.data.changes).toEqual({ field: "updated value" });
    });

    it("should handle workflow errors according to component configuration", async () => {
      // Register a failing workflow
      workflowRegistry.register("failingWorkflow", {
        name: "failingWorkflow",
        steps: [
          {
            name: "fail",
            execute: async () => {
              throw new Error("Workflow failed");
            },
          },
        ],
      });

      const formConfig = getComponentWorkflowConfig("form");
      const result = await workflowRegistry.execute(
        "failingWorkflow",
        {},
        formConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Workflow failed");
    });
  });

  describe("Config Validation", () => {
    it("should validate workflow configurations", () => {
      const { validateWorkflowConfig } = require("../config/workflowConfig.js");

      const validConfig = {
        timeout: 10000,
        errorHandling: "fail-fast",
        communicationPattern: "sequential",
        dataPassingStrategy: "merge",
      };

      const validation = validateWorkflowConfig(validConfig);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid workflow configurations", () => {
      const { validateWorkflowConfig } = require("../config/workflowConfig.js");

      const invalidConfig = {
        timeout: -1000, // Invalid timeout
        errorHandling: "invalid-strategy", // Invalid strategy
        communicationPattern: "unknown-pattern", // Invalid pattern
      };

      const validation = validateWorkflowConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Workflow Registry Integration", () => {
    it("should register workflows with config-driven defaults", () => {
      const workflow = {
        name: "configDrivenWorkflow",
        steps: [
          {
            name: "step1",
            execute: async () => ({ success: true }),
          },
        ],
      };

      workflowRegistry.register(workflow);
      const registered = workflowRegistry.getWorkflow("configDrivenWorkflow");

      expect(registered).toBeDefined();
      expect(registered.name).toBe("configDrivenWorkflow");
    });

    it("should execute workflows with component-specific configurations", async () => {
      workflowRegistry.register("componentSpecificWorkflow", {
        name: "componentSpecificWorkflow",
        steps: [
          {
            name: "execute",
            execute: async (context) => ({
              componentType: context.componentType,
              executed: true,
            }),
          },
        ],
      });

      // Test with different component configurations
      const formResult = await workflowRegistry.execute(
        "componentSpecificWorkflow",
        { componentType: "form" },
        getComponentWorkflowConfig("form")
      );

      const editorResult = await workflowRegistry.execute(
        "componentSpecificWorkflow",
        { componentType: "editor" },
        getComponentWorkflowConfig("editor")
      );

      expect(formResult.success).toBe(true);
      expect(formResult.data.componentType).toBe("form");

      expect(editorResult.success).toBe(true);
      expect(editorResult.data.componentType).toBe("editor");
    });
  });
});
