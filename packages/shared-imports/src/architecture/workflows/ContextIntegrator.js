/**
 * Context Integrator
 *
 * Manages context refresh notifications across components
 * Integrates with Plan 34's context refresh system
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ContextIntegrator");

class ContextIntegrator {
  constructor() {
    this.refreshHandlers = new Map();
    this.refreshHistory = [];
    this.batchTimeout = null;
    this.pendingRefreshes = new Set();
  }

  /**
   * Refresh multiple targets with optional data
   * @param {string|Array} refreshTargets - Target(s) to refresh
   * @param {Object} data - Optional data to pass to refresh handlers
   */
  async refresh(refreshTargets, data = {}) {
    if (!refreshTargets) {
      log.warn("No refresh targets specified");
      return;
    }

    // Normalize to array
    const targets = Array.isArray(refreshTargets)
      ? refreshTargets
      : [refreshTargets];

    log.debug("Context refresh requested", {
      targets,
      data: this.sanitizeData(data),
    });

    // Add to pending refreshes for batching
    targets.forEach((target) => this.pendingRefreshes.add(target));

    // Batch refreshes to avoid excessive updates
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(async () => {
      await this.executeBatchedRefresh(data);
    }, 50); // 50ms batch window
  }

  /**
   * Execute batched refresh operations
   * @param {Object} data - Data to pass to refresh handlers
   * @private
   */
  async executeBatchedRefresh(data) {
    const targets = Array.from(this.pendingRefreshes);
    this.pendingRefreshes.clear();
    this.batchTimeout = null;

    if (targets.length === 0) return;

    log.debug("Executing batched refresh", { targets });

    const refreshPromises = targets.map((target) =>
      this.refreshTarget(target, data).catch((error) => {
        log.error("Refresh target failed", { target, error: error.message });
        return { target, error: error.message };
      })
    );

    const results = await Promise.allSettled(refreshPromises);

    // Record refresh history
    this.recordRefresh(targets, data, results);

    log.debug("Batched refresh completed", {
      targets,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    });
  }

  /**
   * Refresh a specific target
   * @param {string} target - Target to refresh
   * @param {Object} data - Data to pass to refresh handler
   * @private
   */
  async refreshTarget(target, data) {
    switch (target) {
      case "planList":
        await this.triggerPlanListRefresh(data);
        break;

      case "planContext":
        await this.triggerPlanContextRefresh(data);
        break;

      case "communicationHistory":
        await this.triggerCommunicationRefresh(data);
        break;

      case "impactTracking":
        await this.triggerImpactTrackingRefresh(data);
        break;

      case "planTools":
        await this.triggerPlanToolsRefresh(data);
        break;

      default:
        // Check for custom refresh handlers
        if (this.refreshHandlers.has(target)) {
          await this.refreshHandlers.get(target)(data);
        } else {
          log.warn(`Unknown refresh target: ${target}`);
        }
    }
  }

  /**
   * Trigger refresh of SelPlan components
   * @param {Object} data - Refresh data
   */
  async triggerPlanListRefresh(data) {
    try {
      const event = new CustomEvent("planListRefresh", {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
          source: "workflow",
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
        log.debug("Plan list refresh event dispatched");
      }
    } catch (error) {
      log.error("Failed to trigger plan list refresh", {
        error: error.message,
      });
    }
  }

  /**
   * Trigger refresh of plan context (integrates with Plan 34)
   * @param {Object} data - Refresh data
   */
  async triggerPlanContextRefresh(data) {
    try {
      // Use existing plan context system from Plan 34
      const { default: contextStore } = await import(
        "../../stores/contextStore.js"
      );
      const currentPlanId = contextStore.getParameter("planID");

      if (currentPlanId) {
        // Trigger refresh by setting the same planID (will notify subscribers)
        contextStore.setParameter("planID", currentPlanId);
        log.debug("Plan context refresh triggered", { planId: currentPlanId });
      } else {
        log.debug("No current plan ID for context refresh");
      }
    } catch (error) {
      log.error("Failed to trigger plan context refresh", {
        error: error.message,
      });
    }
  }

  /**
   * Trigger refresh of communication history components
   * @param {Object} data - Refresh data
   */
  async triggerCommunicationRefresh(data) {
    try {
      const event = new CustomEvent("communicationRefresh", {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
          source: "workflow",
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
        log.debug("Communication refresh event dispatched");
      }
    } catch (error) {
      log.error("Failed to trigger communication refresh", {
        error: error.message,
      });
    }
  }

  /**
   * Trigger refresh of impact tracking components
   * @param {Object} data - Refresh data
   */
  async triggerImpactTrackingRefresh(data) {
    try {
      const event = new CustomEvent("impactTrackingRefresh", {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
          source: "workflow",
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
        log.debug("Impact tracking refresh event dispatched");
      }
    } catch (error) {
      log.error("Failed to trigger impact tracking refresh", {
        error: error.message,
      });
    }
  }

  /**
   * Trigger refresh of plan tools components
   * @param {Object} data - Refresh data
   */
  async triggerPlanToolsRefresh(data) {
    try {
      const event = new CustomEvent("planToolsRefresh", {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
          source: "workflow",
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(event);
        log.debug("Plan tools refresh event dispatched");
      }
    } catch (error) {
      log.error("Failed to trigger plan tools refresh", {
        error: error.message,
      });
    }
  }

  /**
   * Register custom refresh handler
   * @param {string} target - Target name
   * @param {Function} handler - Refresh handler function
   */
  registerRefreshHandler(target, handler) {
    if (typeof handler !== "function") {
      throw new Error("Refresh handler must be a function");
    }

    this.refreshHandlers.set(target, handler);
    log.debug("Custom refresh handler registered", { target });
  }

  /**
   * Unregister custom refresh handler
   * @param {string} target - Target name
   */
  unregisterRefreshHandler(target) {
    const removed = this.refreshHandlers.delete(target);
    if (removed) {
      log.debug("Custom refresh handler unregistered", { target });
    }
    return removed;
  }

  /**
   * Get list of available refresh targets
   * @returns {Array} Array of target names
   */
  getAvailableTargets() {
    const builtInTargets = [
      "planList",
      "planContext",
      "communicationHistory",
      "impactTracking",
      "planTools",
    ];

    const customTargets = Array.from(this.refreshHandlers.keys());

    return [...builtInTargets, ...customTargets];
  }

  /**
   * Get refresh statistics
   * @param {string} target - Optional target filter
   * @returns {Object} Refresh statistics
   */
  getRefreshStats(target = null) {
    const filteredHistory = target
      ? this.refreshHistory.filter((h) => h.targets.includes(target))
      : this.refreshHistory;

    const totalRefreshes = filteredHistory.length;
    const successfulRefreshes = filteredHistory.filter(
      (h) => h.successful
    ).length;
    const failedRefreshes = totalRefreshes - successfulRefreshes;

    return {
      totalRefreshes,
      successfulRefreshes,
      failedRefreshes,
      successRate:
        totalRefreshes > 0 ? (successfulRefreshes / totalRefreshes) * 100 : 0,
      recentRefreshes: filteredHistory.slice(-10), // Last 10 refreshes
    };
  }

  /**
   * Clear refresh history (mainly for testing)
   */
  clearHistory() {
    this.refreshHistory = [];
    log.debug("Refresh history cleared");
  }

  /**
   * Record refresh operation for analytics
   * @param {Array} targets - Refresh targets
   * @param {Object} data - Refresh data
   * @param {Array} results - Refresh results
   * @private
   */
  recordRefresh(targets, data, results) {
    const successful = results.every((r) => r.status === "fulfilled");

    this.refreshHistory.push({
      targets,
      data: this.sanitizeData(data),
      successful,
      results: results.map((r) => ({
        status: r.status,
        error: r.reason?.message,
      })),
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 refresh operations to prevent memory issues
    if (this.refreshHistory.length > 1000) {
      this.refreshHistory = this.refreshHistory.slice(-1000);
    }
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   * @private
   */
  sanitizeData(data) {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ["password", "token", "apiKey", "secret"];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Force immediate refresh (bypass batching)
   * @param {string|Array} refreshTargets - Target(s) to refresh
   * @param {Object} data - Optional data to pass to refresh handlers
   */
  async forceRefresh(refreshTargets, data = {}) {
    const targets = Array.isArray(refreshTargets)
      ? refreshTargets
      : [refreshTargets];

    log.debug("Force refresh requested", { targets });

    const refreshPromises = targets.map((target) =>
      this.refreshTarget(target, data).catch((error) => {
        log.error("Force refresh target failed", {
          target,
          error: error.message,
        });
        return { target, error: error.message };
      })
    );

    const results = await Promise.allSettled(refreshPromises);

    // Record refresh history
    this.recordRefresh(targets, data, results);

    return results;
  }
}

// Create singleton instance
export const contextIntegrator = new ContextIntegrator();

// Export class for testing
export { ContextIntegrator };

export default contextIntegrator;
