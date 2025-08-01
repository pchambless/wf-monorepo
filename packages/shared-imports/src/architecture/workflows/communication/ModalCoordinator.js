/**
 * Modal Coordinator
 *
 * Manages agent coordination modal triggers for communication workflows
 * Integrates with existing AgentCoordinationModal from Plan 32
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ModalCoordinator");

class ModalCoordinator {
  constructor() {
    this.activeModals = new Map();
    this.modalHistory = [];
  }

  /**
   * Trigger coordination modal for agent handoffs
   * @param {string} scenario - Modal scenario type
   * @param {Object} modalData - Data to pass to modal
   */
  async trigger(scenario, modalData) {
    log.debug("Triggering coordination modal", { scenario, modalData });

    try {
      // Validate scenario
      const validScenarios = [
        "user-issue",
        "user-guidance",
        "kiro-completion",
        "claude-guidance",
        "agent-coordination",
      ];

      if (!validScenarios.includes(scenario)) {
        throw new Error(`Invalid modal scenario: ${scenario}`);
      }

      // Generate modal ID
      const modalId = this.generateModalId(scenario, modalData);

      // Prepare modal event data
      const eventData = {
        modalId,
        scenario,
        communication: modalData,
        timestamp: new Date().toISOString(),
        source: "workflow",
      };

      // Store active modal
      this.activeModals.set(modalId, {
        scenario,
        data: modalData,
        triggeredAt: new Date().toISOString(),
        status: "active",
      });

      // Trigger modal via custom event (integrates with existing modal system)
      if (typeof window !== "undefined") {
        const modalEvent = new CustomEvent("agentCoordinationModal", {
          detail: eventData,
        });

        window.dispatchEvent(modalEvent);

        log.info("Agent coordination modal triggered", {
          modalId,
          scenario,
          communicationId: modalData.id,
        });
      } else {
        // Server-side or non-browser environment
        log.warn("Modal trigger attempted in non-browser environment", {
          scenario,
        });
      }

      // Record in history
      this.recordModalTrigger(modalId, scenario, modalData);

      return {
        success: true,
        modalId,
        scenario,
      };
    } catch (error) {
      log.error("Failed to trigger coordination modal", {
        scenario,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Close/dismiss a modal
   * @param {string} modalId - Modal ID to close
   * @param {string} reason - Reason for closing
   */
  async close(modalId, reason = "user_dismissed") {
    const modal = this.activeModals.get(modalId);

    if (modal) {
      modal.status = "closed";
      modal.closedAt = new Date().toISOString();
      modal.closeReason = reason;

      // Remove from active modals
      this.activeModals.delete(modalId);

      log.debug("Modal closed", { modalId, reason });

      return { success: true };
    }

    return { success: false, error: "Modal not found" };
  }

  /**
   * Get active modals
   * @returns {Array} Array of active modal data
   */
  getActiveModals() {
    return Array.from(this.activeModals.entries()).map(([id, data]) => ({
      modalId: id,
      ...data,
    }));
  }

  /**
   * Get modal history
   * @param {number} limit - Number of recent modals to return
   * @returns {Array} Array of modal history
   */
  getModalHistory(limit = 10) {
    return this.modalHistory.slice(-limit);
  }

  /**
   * Generate unique modal ID
   * @param {string} scenario - Modal scenario
   * @param {Object} modalData - Modal data
   * @returns {string} Unique modal ID
   * @private
   */
  generateModalId(scenario, modalData) {
    const timestamp = Date.now();
    const communicationId = modalData.id || "unknown";
    return `${scenario}_${communicationId}_${timestamp}`;
  }

  /**
   * Record modal trigger in history
   * @param {string} modalId - Modal ID
   * @param {string} scenario - Modal scenario
   * @param {Object} modalData - Modal data
   * @private
   */
  recordModalTrigger(modalId, scenario, modalData) {
    this.modalHistory.push({
      modalId,
      scenario,
      communicationId: modalData.id,
      planId: modalData.plan_id,
      fromAgent: modalData.from_agent,
      toAgent: modalData.to_agent,
      triggeredAt: new Date().toISOString(),
    });

    // Keep only last 100 modal triggers to prevent memory issues
    if (this.modalHistory.length > 100) {
      this.modalHistory = this.modalHistory.slice(-100);
    }
  }

  /**
   * Clear modal history (mainly for testing)
   */
  clearHistory() {
    this.modalHistory = [];
    this.activeModals.clear();
    log.debug("Modal history cleared");
  }

  /**
   * Get modal statistics
   * @returns {Object} Modal usage statistics
   */
  getModalStats() {
    const totalTriggered = this.modalHistory.length;
    const activeCount = this.activeModals.size;

    // Count by scenario
    const scenarioBreakdown = {};
    this.modalHistory.forEach((modal) => {
      scenarioBreakdown[modal.scenario] =
        (scenarioBreakdown[modal.scenario] || 0) + 1;
    });

    return {
      totalTriggered,
      activeCount,
      scenarioBreakdown,
      recentModals: this.modalHistory.slice(-5), // Last 5 modals
    };
  }
}

// Create singleton instance
export const modalCoordinator = new ModalCoordinator();

// Export class for testing
export { ModalCoordinator };

export default modalCoordinator;
