/**
 * Progress Tracker
 *
 * Provides progress tracking and user feedback for workflow execution
 * Integrates with WorkflowInstance to provide real-time progress updates
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ProgressTracker");

class ProgressTracker {
  constructor() {
    this.activeWorkflows = new Map();
    this.progressHistory = [];
    this.subscribers = new Map();
  }

  /**
   * Start tracking a workflow
   * @param {string} executionId - Workflow execution ID
   * @param {Object} workflowInfo - Workflow information
   */
  startTracking(executionId, workflowInfo) {
    const trackingData = {
      executionId,
      workflowName: workflowInfo.name,
      totalSteps: workflowInfo.steps?.length || 0,
      completedSteps: 0,
      currentStep: null,
      status: "running",
      startTime: new Date(),
      estimatedDuration: this.estimateDuration(workflowInfo.name),
      progress: {
        percentage: 0,
        message: "Starting workflow...",
        canCancel: true,
      },
    };

    this.activeWorkflows.set(executionId, trackingData);

    log.debug("Started tracking workflow", {
      executionId,
      workflowName: workflowInfo.name,
      totalSteps: trackingData.totalSteps,
    });

    // Notify subscribers
    this.notifySubscribers(executionId, "started", trackingData);

    return trackingData;
  }

  /**
   * Update workflow progress
   * @param {string} executionId - Workflow execution ID
   * @param {Object} progressUpdate - Progress update data
   */
  updateProgress(executionId, progressUpdate) {
    const tracking = this.activeWorkflows.get(executionId);
    if (!tracking) {
      log.warn("Attempted to update progress for unknown workflow", {
        executionId,
      });
      return null;
    }

    // Update tracking data
    if (progressUpdate.currentStep !== undefined) {
      tracking.currentStep = progressUpdate.currentStep;
    }

    if (progressUpdate.completedSteps !== undefined) {
      tracking.completedSteps = progressUpdate.completedSteps;
    }

    if (progressUpdate.status !== undefined) {
      tracking.status = progressUpdate.status;
    }

    // Calculate progress percentage
    if (tracking.totalSteps > 0) {
      tracking.progress.percentage = Math.round(
        (tracking.completedSteps / tracking.totalSteps) * 100
      );
    }

    // Update progress message
    tracking.progress.message = this.generateProgressMessage(
      tracking,
      progressUpdate
    );

    // Update estimated completion time
    if (tracking.status === "running") {
      tracking.estimatedCompletion =
        this.calculateEstimatedCompletion(tracking);
    }

    // Handle completion
    if (tracking.status === "completed" || tracking.status === "failed") {
      tracking.endTime = new Date();
      tracking.actualDuration = tracking.endTime - tracking.startTime;
      tracking.progress.canCancel = false;

      if (tracking.status === "completed") {
        tracking.progress.percentage = 100;
        tracking.progress.message = "Workflow completed successfully";
      } else {
        tracking.progress.message = progressUpdate.error || "Workflow failed";
      }
    }

    log.debug("Updated workflow progress", {
      executionId,
      percentage: tracking.progress.percentage,
      currentStep: tracking.currentStep,
      status: tracking.status,
    });

    // Notify subscribers
    this.notifySubscribers(executionId, "progress", tracking);

    return tracking;
  }

  /**
   * Complete workflow tracking
   * @param {string} executionId - Workflow execution ID
   * @param {Object} result - Workflow result
   */
  completeTracking(executionId, result) {
    const tracking = this.activeWorkflows.get(executionId);
    if (!tracking) {
      return null;
    }

    tracking.status = result.success ? "completed" : "failed";
    tracking.endTime = new Date();
    tracking.actualDuration = tracking.endTime - tracking.startTime;
    tracking.result = result;

    if (result.success) {
      tracking.progress.percentage = 100;
      tracking.progress.message = "Workflow completed successfully";
    } else {
      tracking.progress.message = result.error?.message || "Workflow failed";
    }

    tracking.progress.canCancel = false;

    // Move to history
    this.recordInHistory(tracking);

    // Remove from active workflows
    this.activeWorkflows.delete(executionId);

    log.info("Completed workflow tracking", {
      executionId,
      success: result.success,
      duration: tracking.actualDuration,
    });

    // Notify subscribers
    this.notifySubscribers(executionId, "completed", tracking);

    return tracking;
  }

  /**
   * Cancel workflow tracking
   * @param {string} executionId - Workflow execution ID
   * @param {string} reason - Cancellation reason
   */
  cancelTracking(executionId, reason = "User cancelled") {
    const tracking = this.activeWorkflows.get(executionId);
    if (!tracking) {
      return null;
    }

    tracking.status = "cancelled";
    tracking.endTime = new Date();
    tracking.actualDuration = tracking.endTime - tracking.startTime;
    tracking.cancelReason = reason;
    tracking.progress.message = `Cancelled: ${reason}`;
    tracking.progress.canCancel = false;

    // Move to history
    this.recordInHistory(tracking);

    // Remove from active workflows
    this.activeWorkflows.delete(executionId);

    log.info("Cancelled workflow tracking", { executionId, reason });

    // Notify subscribers
    this.notifySubscribers(executionId, "cancelled", tracking);

    return tracking;
  }

  /**
   * Get current progress for a workflow
   * @param {string} executionId - Workflow execution ID
   * @returns {Object|null} Current progress data
   */
  getProgress(executionId) {
    return this.activeWorkflows.get(executionId) || null;
  }

  /**
   * Get all active workflows
   * @returns {Array} Array of active workflow tracking data
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Subscribe to progress updates
   * @param {string} executionId - Workflow execution ID (or 'all' for all workflows)
   * @param {Function} callback - Callback function for progress updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(executionId, callback) {
    if (!this.subscribers.has(executionId)) {
      this.subscribers.set(executionId, []);
    }

    this.subscribers.get(executionId).push(callback);

    log.debug("Added progress subscriber", { executionId });

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(executionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }

        // Clean up empty subscriber arrays
        if (callbacks.length === 0) {
          this.subscribers.delete(executionId);
        }
      }
    };
  }

  /**
   * Notify subscribers of progress updates
   * @param {string} executionId - Workflow execution ID
   * @param {string} event - Event type
   * @param {Object} data - Progress data
   * @private
   */
  notifySubscribers(executionId, event, data) {
    // Notify specific workflow subscribers
    const specificSubscribers = this.subscribers.get(executionId) || [];
    const allSubscribers = this.subscribers.get("all") || [];

    const allCallbacks = [...specificSubscribers, ...allSubscribers];

    allCallbacks.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        log.error("Error in progress subscriber callback", {
          executionId,
          event,
          error: error.message,
        });
      }
    });
  }

  /**
   * Generate progress message based on current state
   * @param {Object} tracking - Tracking data
   * @param {Object} update - Progress update
   * @returns {string} Progress message
   * @private
   */
  generateProgressMessage(tracking, update) {
    if (update.message) {
      return update.message;
    }

    if (tracking.currentStep) {
      return `Executing: ${tracking.currentStep}`;
    }

    if (tracking.completedSteps > 0) {
      return `Completed ${tracking.completedSteps} of ${tracking.totalSteps} steps`;
    }

    return "Processing...";
  }

  /**
   * Estimate workflow duration based on historical data
   * @param {string} workflowName - Workflow name
   * @returns {number} Estimated duration in milliseconds
   * @private
   */
  estimateDuration(workflowName) {
    // Get historical data for this workflow type
    const historicalData = this.progressHistory
      .filter((h) => h.workflowName === workflowName && h.actualDuration)
      .slice(-10); // Last 10 executions

    if (historicalData.length === 0) {
      // Default estimates based on workflow type
      const defaultEstimates = {
        createPlan: 5000,
        updatePlan: 3000,
        archivePlan: 2000,
        createCommunication: 2000,
        updateCommunicationStatus: 1000,
      };

      return defaultEstimates[workflowName] || 5000; // 5 second default
    }

    // Calculate average duration
    const totalDuration = historicalData.reduce(
      (sum, h) => sum + h.actualDuration,
      0
    );
    return Math.round(totalDuration / historicalData.length);
  }

  /**
   * Calculate estimated completion time
   * @param {Object} tracking - Tracking data
   * @returns {Date} Estimated completion time
   * @private
   */
  calculateEstimatedCompletion(tracking) {
    if (tracking.progress.percentage === 0) {
      return new Date(Date.now() + tracking.estimatedDuration);
    }

    const elapsed = Date.now() - tracking.startTime.getTime();
    const estimatedTotal = (elapsed / tracking.progress.percentage) * 100;
    const remaining = estimatedTotal - elapsed;

    return new Date(Date.now() + Math.max(remaining, 0));
  }

  /**
   * Record completed workflow in history
   * @param {Object} tracking - Tracking data
   * @private
   */
  recordInHistory(tracking) {
    this.progressHistory.push({
      executionId: tracking.executionId,
      workflowName: tracking.workflowName,
      status: tracking.status,
      startTime: tracking.startTime,
      endTime: tracking.endTime,
      actualDuration: tracking.actualDuration,
      totalSteps: tracking.totalSteps,
      completedSteps: tracking.completedSteps,
      cancelReason: tracking.cancelReason,
    });

    // Keep only last 1000 workflow executions to prevent memory issues
    if (this.progressHistory.length > 1000) {
      this.progressHistory = this.progressHistory.slice(-1000);
    }
  }

  /**
   * Get progress statistics
   * @param {string} workflowName - Optional workflow name filter
   * @returns {Object} Progress statistics
   */
  getProgressStats(workflowName = null) {
    const filteredHistory = workflowName
      ? this.progressHistory.filter((h) => h.workflowName === workflowName)
      : this.progressHistory;

    const totalExecutions = filteredHistory.length;
    const completedExecutions = filteredHistory.filter(
      (h) => h.status === "completed"
    ).length;
    const failedExecutions = filteredHistory.filter(
      (h) => h.status === "failed"
    ).length;
    const cancelledExecutions = filteredHistory.filter(
      (h) => h.status === "cancelled"
    ).length;

    // Calculate average duration for completed workflows
    const completedWithDuration = filteredHistory.filter(
      (h) => h.status === "completed" && h.actualDuration
    );
    const averageDuration =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, h) => sum + h.actualDuration, 0) /
          completedWithDuration.length
        : 0;

    return {
      totalExecutions,
      completedExecutions,
      failedExecutions,
      cancelledExecutions,
      successRate:
        totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0,
      averageDuration: Math.round(averageDuration),
      activeWorkflows: this.activeWorkflows.size,
      recentExecutions: filteredHistory.slice(-10),
    };
  }

  /**
   * Clear progress history (mainly for testing)
   */
  clearHistory() {
    this.progressHistory = [];
    this.activeWorkflows.clear();
    this.subscribers.clear();
    log.debug("Progress history cleared");
  }
}

// Create singleton instance
export const progressTracker = new ProgressTracker();

// Export class for testing
export { ProgressTracker };

export default progressTracker;
