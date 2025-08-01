/**
 * ImpactTracker Tests
 */

import { ImpactTracker } from "../impact/ImpactTracker.js";

// Mock execDml
const mockExecDml = jest.fn();
jest.doMock("@whatsfresh/shared-imports/api", () => ({
  execDml: mockExecDml,
}));

// Mock context integrator
const mockContextIntegrator = {
  refresh: jest.fn(),
};
jest.doMock("../ContextIntegrator.js", () => ({
  contextIntegrator: mockContextIntegrator,
}));

describe("ImpactTracker", () => {
  let tracker;

  beforeEach(() => {
    tracker = new ImpactTracker();
    jest.clearAllMocks();
    mockExecDml.mockResolvedValue({ success: true, insertId: "impact123" });
  });

  describe("recordImpact", () => {
    it("should record impact successfully", async () => {
      const impactData = {
        planId: "plan123",
        type: "CREATE",
        description: "Created new component",
        phase: "development",
        userID: "user123",
        file: "src/components/NewComponent.jsx",
      };

      const result = await tracker.recordImpact(impactData);

      expect(result.success).toBe(true);
      expect(result.impactId).toBe("impact123");
      expect(mockExecDml).toHaveBeenCalledWith("INSERT", {
        table: "api_wf.plan_impacts",
        method: "INSERT",
        data: expect.objectContaining({
          plan_id: "plan123",
          type: "CREATE",
          description: "Created new component",
          phase: "development",
          created_by: "user123",
          file: "src/components/NewComponent.jsx",
        }),
      });
    });

    it("should handle database errors gracefully", async () => {
      mockExecDml.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await tracker.recordImpact({
        planId: "plan123",
        type: "CREATE",
        userID: "user123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("should validate and normalize impact type", async () => {
      await tracker.recordImpact({
        planId: "plan123",
        type: "invalid_type",
        userID: "user123",
      });

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            type: "MODIFY", // Should default to MODIFY for invalid types
          }),
        })
      );
    });

    it("should validate and normalize phase", async () => {
      await tracker.recordImpact({
        planId: "plan123",
        type: "CREATE",
        phase: "invalid_phase",
        userID: "user123",
      });

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            phase: "development", // Should default to development for invalid phases
          }),
        })
      );
    });
  });

  describe("categorizeFileChange", () => {
    it("should categorize test files correctly", async () => {
      const result = await tracker.categorizeFileChange(
        "src/components/__tests__/Component.test.js",
        "create",
        "plan123",
        "user123"
      );

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            type: "CREATE",
            phase: "development",
          }),
        })
      );
    });

    it("should categorize specification files correctly", async () => {
      await tracker.categorizeFileChange(
        ".kiro/0035/specs/requirements.md",
        "modify",
        "plan123",
        "user123"
      );

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            type: "PLAN",
            phase: "idea",
          }),
        })
      );
    });

    it("should categorize documentation files correctly", async () => {
      await tracker.categorizeFileChange(
        "docs/README.md",
        "modify",
        "plan123",
        "user123"
      );

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            type: "COMMUNICATE",
            phase: "development",
          }),
        })
      );
    });

    it("should categorize component files correctly", async () => {
      await tracker.categorizeFileChange(
        "src/components/MyComponent.jsx",
        "modify",
        "plan123",
        "user123"
      );

      expect(mockExecDml).toHaveBeenCalledWith(
        "INSERT",
        expect.objectContaining({
          data: expect.objectContaining({
            type: "MODIFY",
            phase: "development",
          }),
        })
      );
    });
  });

  describe("categorizeFile", () => {
    it("should match test file patterns", () => {
      const result = tracker.categorizeFile("src/__tests__/test.js", "create");
      expect(result.type).toBe("CREATE");
      expect(result.phase).toBe("development");
      expect(result.reason).toBe("matched_pattern_tests");
    });

    it("should match specification patterns", () => {
      const result = tracker.categorizeFile("specs/requirements.md", "modify");
      expect(result.type).toBe("PLAN");
      expect(result.phase).toBe("idea");
      expect(result.reason).toBe("matched_pattern_specifications");
    });

    it("should provide default categorization for unknown files", () => {
      const result = tracker.categorizeFile("some/random/file.xyz", "modify");
      expect(result.type).toBe("MODIFY");
      expect(result.phase).toBe("development");
      expect(result.reason).toBe("default_categorization");
    });

    it("should handle missing file path", () => {
      const result = tracker.categorizeFile(null, "create");
      expect(result.type).toBe("CREATE");
      expect(result.reason).toBe("no_file_path");
    });
  });

  describe("validateImpactType", () => {
    it("should validate known impact types", () => {
      expect(tracker.validateImpactType("CREATE")).toBe("CREATE");
      expect(tracker.validateImpactType("create")).toBe("CREATE");
      expect(tracker.validateImpactType("MODIFY")).toBe("MODIFY");
      expect(tracker.validateImpactType("DELETE")).toBe("DELETE");
    });

    it("should default to MODIFY for unknown types", () => {
      expect(tracker.validateImpactType("UNKNOWN")).toBe("MODIFY");
      expect(tracker.validateImpactType("")).toBe("MODIFY");
      expect(tracker.validateImpactType(null)).toBe("MODIFY");
    });
  });

  describe("validatePhase", () => {
    it("should validate known phases", () => {
      expect(tracker.validatePhase("idea")).toBe("idea");
      expect(tracker.validatePhase("development")).toBe("development");
      expect(tracker.validatePhase("adhoc")).toBe("adhoc");
    });

    it("should default to development for unknown phases", () => {
      expect(tracker.validatePhase("unknown")).toBe("development");
      expect(tracker.validatePhase("")).toBe("development");
      expect(tracker.validatePhase(null)).toBe("development");
    });
  });

  describe("extractPackageName", () => {
    it("should extract package name from path", () => {
      expect(
        tracker.extractPackageName("packages/shared-imports/src/file.js")
      ).toBe("shared-imports");
      expect(
        tracker.extractPackageName("packages/wf-client/components/App.jsx")
      ).toBe("wf-client");
    });

    it("should return null for non-package paths", () => {
      expect(tracker.extractPackageName("src/components/file.js")).toBeNull();
      expect(tracker.extractPackageName("")).toBeNull();
      expect(tracker.extractPackageName(null)).toBeNull();
    });
  });

  describe("getFileName", () => {
    it("should extract file name from path", () => {
      expect(tracker.getFileName("src/components/MyComponent.jsx")).toBe(
        "MyComponent.jsx"
      );
      expect(tracker.getFileName("file.js")).toBe("file.js");
    });

    it("should handle edge cases", () => {
      expect(tracker.getFileName("")).toBe("");
      expect(tracker.getFileName(null)).toBe("");
      expect(tracker.getFileName("path/to/")).toBe("");
    });
  });

  describe("getImpactStats", () => {
    beforeEach(() => {
      // Add some test impacts to history
      tracker.impactHistory = [
        { plan_id: "plan1", type: "CREATE", phase: "development" },
        { plan_id: "plan1", type: "MODIFY", phase: "development" },
        { plan_id: "plan2", type: "CREATE", phase: "idea" },
        { plan_id: "plan1", type: "DELETE", phase: "development" },
      ];
    });

    it("should return overall statistics", () => {
      const stats = tracker.getImpactStats();

      expect(stats.totalImpacts).toBe(4);
      expect(stats.typeBreakdown.CREATE).toBe(2);
      expect(stats.typeBreakdown.MODIFY).toBe(1);
      expect(stats.typeBreakdown.DELETE).toBe(1);
      expect(stats.phaseBreakdown.development).toBe(3);
      expect(stats.phaseBreakdown.idea).toBe(1);
    });

    it("should filter statistics by plan ID", () => {
      const stats = tracker.getImpactStats("plan1");

      expect(stats.totalImpacts).toBe(3);
      expect(stats.typeBreakdown.CREATE).toBe(1);
      expect(stats.typeBreakdown.MODIFY).toBe(1);
      expect(stats.typeBreakdown.DELETE).toBe(1);
    });
  });

  describe("addCategoryPattern", () => {
    it("should add custom category pattern", () => {
      const config = {
        patterns: [/\.custom$/],
        type: "CUSTOM",
        phase: "idea",
        descriptionTemplate: "Custom {changeType}: {fileName}",
      };

      tracker.addCategoryPattern("custom", config);

      const result = tracker.categorizeFile("test.custom", "create");
      expect(result.type).toBe("CUSTOM");
      expect(result.phase).toBe("idea");
      expect(result.reason).toBe("matched_pattern_custom");
    });

    it("should throw error for invalid config", () => {
      expect(() => {
        tracker.addCategoryPattern("invalid", { type: "TEST" });
      }).toThrow("Category config must have patterns array");
    });
  });

  describe("clearHistory", () => {
    it("should clear impact history", () => {
      tracker.impactHistory = [{ test: "data" }];

      tracker.clearHistory();

      expect(tracker.impactHistory).toHaveLength(0);
    });
  });
});
