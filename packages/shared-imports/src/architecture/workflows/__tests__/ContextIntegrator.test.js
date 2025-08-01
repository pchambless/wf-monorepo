/**
 * ContextIntegrator Tests
 */

import { ContextIntegrator } from "../ContextIntegrator.js";

// Mock window and events
const mockWindow = {
  dispatchEvent: jest.fn(),
};

// Mock contextStore
const mockContextStore = {
  getParameter: jest.fn(),
  setParameter: jest.fn(),
};

// Setup global mocks
global.window = mockWindow;
global.CustomEvent = jest.fn().mockImplementation((type, options) => ({
  type,
  detail: options?.detail,
}));

describe("ContextIntegrator", () => {
  let integrator;

  beforeEach(() => {
    integrator = new ContextIntegrator();
    jest.clearAllMocks();

    // Mock dynamic import for contextStore
    jest.doMock("../../../stores/contextStore.js", () => ({
      default: mockContextStore,
    }));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("refresh", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should handle single target refresh", async () => {
      const refreshPromise = integrator.refresh("planList", { planId: "123" });

      // Fast-forward timers to trigger batched refresh
      jest.advanceTimersByTime(100);
      await refreshPromise;

      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "planListRefresh",
          detail: expect.objectContaining({
            planId: "123",
            source: "workflow",
          }),
        })
      );
    });

    it("should handle multiple target refresh", async () => {
      const refreshPromise = integrator.refresh([
        "planList",
        "communicationHistory",
      ]);

      jest.advanceTimersByTime(100);
      await refreshPromise;

      expect(mockWindow.dispatchEvent).toHaveBeenCalledTimes(2);
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "planListRefresh" })
      );
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "communicationRefresh" })
      );
    });

    it("should batch multiple refresh calls", async () => {
      const promise1 = integrator.refresh("planList");
      const promise2 = integrator.refresh("communicationHistory");

      jest.advanceTimersByTime(100);
      await Promise.all([promise1, promise2]);

      // Should only dispatch events once due to batching
      expect(mockWindow.dispatchEvent).toHaveBeenCalledTimes(2);
    });

    it("should handle empty refresh targets gracefully", async () => {
      const refreshPromise = integrator.refresh(null);

      jest.advanceTimersByTime(100);
      await refreshPromise;

      expect(mockWindow.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe("triggerPlanContextRefresh", () => {
    it("should trigger plan context refresh when planID exists", async () => {
      mockContextStore.getParameter.mockReturnValue("123");

      await integrator.triggerPlanContextRefresh({});

      expect(mockContextStore.getParameter).toHaveBeenCalledWith("planID");
      expect(mockContextStore.setParameter).toHaveBeenCalledWith(
        "planID",
        "123"
      );
    });

    it("should handle missing planID gracefully", async () => {
      mockContextStore.getParameter.mockReturnValue(null);

      await integrator.triggerPlanContextRefresh({});

      expect(mockContextStore.getParameter).toHaveBeenCalledWith("planID");
      expect(mockContextStore.setParameter).not.toHaveBeenCalled();
    });
  });

  describe("registerRefreshHandler", () => {
    it("should register custom refresh handler", () => {
      const handler = jest.fn();

      integrator.registerRefreshHandler("customTarget", handler);

      expect(integrator.refreshHandlers.has("customTarget")).toBe(true);
      expect(integrator.refreshHandlers.get("customTarget")).toBe(handler);
    });

    it("should throw error for invalid handler", () => {
      expect(() => {
        integrator.registerRefreshHandler("customTarget", "not a function");
      }).toThrow("Refresh handler must be a function");
    });
  });

  describe("unregisterRefreshHandler", () => {
    it("should unregister custom refresh handler", () => {
      const handler = jest.fn();
      integrator.registerRefreshHandler("customTarget", handler);

      const removed = integrator.unregisterRefreshHandler("customTarget");

      expect(removed).toBe(true);
      expect(integrator.refreshHandlers.has("customTarget")).toBe(false);
    });

    it("should return false for non-existent handler", () => {
      const removed = integrator.unregisterRefreshHandler("nonExistent");
      expect(removed).toBe(false);
    });
  });

  describe("getAvailableTargets", () => {
    it("should return built-in targets", () => {
      const targets = integrator.getAvailableTargets();

      expect(targets).toContain("planList");
      expect(targets).toContain("planContext");
      expect(targets).toContain("communicationHistory");
      expect(targets).toContain("impactTracking");
      expect(targets).toContain("planTools");
    });

    it("should include custom targets", () => {
      integrator.registerRefreshHandler("customTarget", jest.fn());

      const targets = integrator.getAvailableTargets();
      expect(targets).toContain("customTarget");
    });
  });

  describe("forceRefresh", () => {
    it("should bypass batching and refresh immediately", async () => {
      const result = await integrator.forceRefresh("planList", {
        planId: "123",
      });

      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "planListRefresh",
          detail: expect.objectContaining({
            planId: "123",
            source: "workflow",
          }),
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("fulfilled");
    });
  });

  describe("getRefreshStats", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should return refresh statistics", async () => {
      // Perform some refreshes
      await integrator.forceRefresh("planList");
      await integrator.forceRefresh("communicationHistory");

      const stats = integrator.getRefreshStats();

      expect(stats.totalRefreshes).toBe(2);
      expect(stats.successfulRefreshes).toBe(2);
      expect(stats.failedRefreshes).toBe(0);
      expect(stats.successRate).toBe(100);
    });

    it("should filter statistics by target", async () => {
      await integrator.forceRefresh("planList");
      await integrator.forceRefresh("communicationHistory");

      const stats = integrator.getRefreshStats("planList");

      expect(stats.totalRefreshes).toBe(1);
    });
  });

  describe("sanitizeData", () => {
    it("should remove sensitive fields", () => {
      const data = {
        planId: "123",
        password: "secret",
        token: "abc123",
        normalField: "value",
      };

      const sanitized = integrator.sanitizeData(data);

      expect(sanitized.planId).toBe("123");
      expect(sanitized.normalField).toBe("value");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.token).toBe("[REDACTED]");
    });

    it("should handle non-object data", () => {
      expect(integrator.sanitizeData("string")).toBe("string");
      expect(integrator.sanitizeData(123)).toBe(123);
      expect(integrator.sanitizeData(null)).toBe(null);
    });
  });

  describe("clearHistory", () => {
    it("should clear refresh history", async () => {
      await integrator.forceRefresh("planList");

      expect(integrator.refreshHistory).toHaveLength(1);

      integrator.clearHistory();

      expect(integrator.refreshHistory).toHaveLength(0);
    });
  });
});
