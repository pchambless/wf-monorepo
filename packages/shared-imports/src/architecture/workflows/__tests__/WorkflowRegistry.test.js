/**
 * WorkflowRegistry Tests
 */

import { WorkflowRegistry } from "../WorkflowRegistry.js";

describe("WorkflowRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new WorkflowRegistry();
  });

  describe("register", () => {
    it("should register a workflow successfully", () => {
      const workflow = {
        steps: [{ name: "step1", execute: async () => ({ result: "test" }) }],
      };

      expect(() => registry.register("testWorkflow", workflow)).not.toThrow();
      expect(registry.listWorkflows()).toContain("testWorkflow");
    });

    it("should throw error for invalid workflow name", () => {
      const workflow = { steps: [] };

      expect(() => registry.register("", workflow)).toThrow(
        "Workflow name must be a non-empty string"
      );
      expect(() => registry.register(null, workflow)).toThrow(
        "Workflow name must be a non-empty string"
      );
    });

    it("should throw error for invalid workflow definition", () => {
      expect(() => registry.register("test", null)).toThrow(
        "Workflow definition must have steps array"
      );
      expect(() => registry.register("test", {})).toThrow(
        "Workflow definition must have steps array"
      );
    });
  });

  describe("getWorkflow", () => {
    it("should return workflow definition when found", () => {
      const workflow = { steps: [] };
      registry.register("test", workflow);

      const retrieved = registry.getWorkflow("test");
      expect(retrieved).toBeTruthy();
      expect(retrieved.name).toBe("test");
      expect(retrieved.steps).toEqual([]);
    });

    it("should return null when workflow not found", () => {
      expect(registry.getWorkflow("nonexistent")).toBeNull();
    });
  });

  describe("middleware", () => {
    it("should add middleware successfully", () => {
      const middleware = (phase, context) => context;

      expect(() => registry.use(middleware)).not.toThrow();
    });

    it("should throw error for invalid middleware", () => {
      expect(() => registry.use("not a function")).toThrow(
        "Middleware must be a function"
      );
    });
  });

  describe("listWorkflows", () => {
    it("should return empty array when no workflows registered", () => {
      expect(registry.listWorkflows()).toEqual([]);
    });

    it("should return all registered workflow names", () => {
      registry.register("workflow1", { steps: [] });
      registry.register("workflow2", { steps: [] });

      const workflows = registry.listWorkflows();
      expect(workflows).toContain("workflow1");
      expect(workflows).toContain("workflow2");
      expect(workflows).toHaveLength(2);
    });
  });

  describe("clear", () => {
    it("should clear all workflows and middleware", () => {
      registry.register("test", { steps: [] });
      registry.use(() => {});

      registry.clear();

      expect(registry.listWorkflows()).toEqual([]);
      expect(registry.middleware).toEqual([]);
    });
  });
});
