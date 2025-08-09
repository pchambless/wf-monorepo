/**
 * Tests for PlanContextAnalyzer
 */

import { PlanContextAnalyzer } from "../PlanContextAnalyzer.js";
import { PLAN_CONTEXT_SOURCES } from "../types.js";
import fs from "fs/promises";
import path from "path";

// Mock fs module
jest.mock("fs/promises");

describe("PlanContextAnalyzer", () => {
  let analyzer;
  let mockContextStore;

  beforeEach(() => {
    mockContextStore = new Map();
    analyzer = new PlanContextAnalyzer({
      monorepoRoot: "/test/monorepo",
      contextStore: mockContextStore,
      planRegistryPath: "claude-plans/plan-registry.json",
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("extractPlanFromContextStore", () => {
    test("should extract plan from context store with planID", async () => {
      mockContextStore.set("planID", "40");

      // Mock plan registry
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "40", name: "Plan Management MVP" }],
        })
      );

      const context = await analyzer.extractPlanFromContextStore();

      expect(context).toEqual({
        planId: 40,
        planName: "Plan Management MVP",
        source: PLAN_CONTEXT_SOURCES.CONTEXT_STORE,
        confidence: 0.95,
      });
    });

    test("should extract plan from context store with currentPlan", async () => {
      mockContextStore.set("currentPlan", "25");

      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "25", name: "Database Migration" }],
        })
      );

      const context = await analyzer.extractPlanFromContextStore();

      expect(context.planId).toBe(25);
      expect(context.source).toBe(PLAN_CONTEXT_SOURCES.CONTEXT_STORE);
    });

    test("should return null when no plan in context store", async () => {
      const context = await analyzer.extractPlanFromContextStore();
      expect(context).toBeNull();
    });
  });

  describe("extractPlanFromPath", () => {
    test("should extract plan from .kiro directory path", async () => {
      const filePath = "/test/monorepo/.kiro/0040/requirements.md";

      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "40", name: "Plan Management MVP" }],
        })
      );

      const context = await analyzer.extractPlanFromPath(filePath);

      expect(context).toEqual({
        planId: 40,
        planName: "Plan Management MVP",
        source: PLAN_CONTEXT_SOURCES.FILE_SYSTEM,
        confidence: 0.9,
      });
    });

    test("should return null for non-plan paths", async () => {
      const filePath = "/test/monorepo/apps/wf-client/src/component.jsx";

      const context = await analyzer.extractPlanFromPath(filePath);
      expect(context).toBeNull();
    });
  });

  describe("extractPlanFromText", () => {
    test('should extract plan from "plan 40" format', () => {
      const text = "Working on plan 40 for impact tracking";
      const context = analyzer.extractPlanFromText(text);

      expect(context).toEqual({
        planId: 40,
        planName: "Plan 40",
      });
    });

    test('should extract plan from "#0040" format', () => {
      const text = "This is for #0040 implementation";
      const context = analyzer.extractPlanFromText(text);

      expect(context).toEqual({
        planId: 40,
        planName: "Plan 40",
      });
    });

    test('should extract plan from "current plan: 25" format', () => {
      const text = "Current plan: 25\nWorking on database changes";
      const context = analyzer.extractPlanFromText(text);

      expect(context).toEqual({
        planId: 25,
        planName: "Plan 25",
      });
    });

    test("should return null for text without plan references", () => {
      const text = "Just some regular text without any plan information";
      const context = analyzer.extractPlanFromText(text);

      expect(context).toBeNull();
    });
  });

  describe("extractPlanFromGuidance", () => {
    test("should extract plan from guidance file", async () => {
      fs.readFile
        .mockResolvedValueOnce("Working on plan 40 for impact tracking")
        .mockRejectedValueOnce(new Error("File not found"))
        .mockRejectedValueOnce(new Error("File not found"))
        .mockRejectedValueOnce(new Error("File not found"));

      const context = await analyzer.extractPlanFromGuidance();

      expect(context).toEqual({
        planId: 40,
        planName: "Plan 40",
        source: PLAN_CONTEXT_SOURCES.GUIDANCE,
        confidence: 0.7,
      });
    });

    test("should return null when no guidance files contain plan info", async () => {
      fs.readFile.mockRejectedValue(new Error("File not found"));

      const context = await analyzer.extractPlanFromGuidance();
      expect(context).toBeNull();
    });
  });

  describe("extractPlanFromEnvironment", () => {
    test("should extract plan from CURRENT_PLAN environment variable", async () => {
      process.env.CURRENT_PLAN = "30";

      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "30", name: "Environment Test Plan" }],
        })
      );

      const context = await analyzer.extractPlanFromEnvironment();

      expect(context).toEqual({
        planId: 30,
        planName: "Environment Test Plan",
        source: PLAN_CONTEXT_SOURCES.MANUAL,
        confidence: 0.6,
      });

      delete process.env.CURRENT_PLAN;
    });

    test("should return null when no environment variables set", async () => {
      const context = await analyzer.extractPlanFromEnvironment();
      expect(context).toBeNull();
    });
  });

  describe("getCurrentPlanContext", () => {
    test("should prioritize context store over other methods", async () => {
      // Set up multiple sources
      mockContextStore.set("planID", "40");
      process.env.CURRENT_PLAN = "30";

      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [
            { id: "40", name: "Context Store Plan" },
            { id: "30", name: "Environment Plan" },
          ],
        })
      );

      const context = await analyzer.getCurrentPlanContext();

      expect(context.planId).toBe(40);
      expect(context.source).toBe(PLAN_CONTEXT_SOURCES.CONTEXT_STORE);
      expect(context.planName).toBe("Context Store Plan");

      delete process.env.CURRENT_PLAN;
    });

    test("should fall back to environment when context store is empty", async () => {
      process.env.CURRENT_PLAN = "30";

      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "30", name: "Environment Plan" }],
        })
      );

      const context = await analyzer.getCurrentPlanContext();

      expect(context.planId).toBe(30);
      expect(context.source).toBe(PLAN_CONTEXT_SOURCES.MANUAL);

      delete process.env.CURRENT_PLAN;
    });

    test("should return null when no context can be determined", async () => {
      fs.readFile.mockRejectedValue(new Error("File not found"));

      const context = await analyzer.getCurrentPlanContext();
      expect(context).toBeNull();
    });
  });

  describe("getPlanNameById", () => {
    test("should return plan name for valid ID", async () => {
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [
            { id: "40", name: "Plan Management MVP" },
            { id: "25", name: "Database Migration" },
          ],
        })
      );

      const name = await analyzer.getPlanNameById(40);
      expect(name).toBe("Plan Management MVP");
    });

    test("should return null for invalid ID", async () => {
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "40", name: "Plan Management MVP" }],
        })
      );

      const name = await analyzer.getPlanNameById(999);
      expect(name).toBeNull();
    });
  });

  describe("findPlanByName", () => {
    test("should find plan by exact name match", async () => {
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [
            { id: "40", name: "Plan Management MVP" },
            { id: "25", name: "Database Migration" },
          ],
        })
      );

      const id = await analyzer.findPlanByName("Plan Management MVP");
      expect(id).toBe(40);
    });

    test("should find plan by partial name match", async () => {
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [
            { id: "40", name: "Plan Management MVP Completion" },
            { id: "25", name: "Database Migration" },
          ],
        })
      );

      const id = await analyzer.findPlanByName("Plan Management");
      expect(id).toBe(40);
    });

    test("should return null for no match", async () => {
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          plans: [{ id: "40", name: "Plan Management MVP" }],
        })
      );

      const id = await analyzer.findPlanByName("Nonexistent Plan");
      expect(id).toBeNull();
    });
  });
});
