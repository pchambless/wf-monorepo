/**
 * useWorkflowProgress Hook
 *
 * React hook for tracking workflow progress in components
 * Provides real-time progress updates and user feedback
 */

import { useState, useEffect, useCallback } from "react";
import { progressTracker } from "../ProgressTracker.js";

/**
 * Hook for tracking workflow progress
 * @param {string} executionId - Workflow execution ID to track
 * @returns {Object} Progress tracking state and controls
 */
export const useWorkflowProgress = (executionId) => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update progress state
  const updateProgress = useCallback((event, data) => {
    switch (event) {
      case "started":
        setProgress(data);
        setIsLoading(true);
        setError(null);
        break;

      case "progress":
        setProgress(data);
        setIsLoading(data.status === "running");
        break;

      case "completed":
        setProgress(data);
        setIsLoading(false);
        if (data.status === "failed") {
          setError(data.progress.message);
        }
        break;

      case "cancelled":
        setProgress(data);
        setIsLoading(false);
        break;

      default:
        break;
    }
  }, []);

  // Subscribe to progress updates
  useEffect(() => {
    if (!executionId) return;

    // Get initial progress if workflow is already running
    const initialProgress = progressTracker.getProgress(executionId);
    if (initialProgress) {
      setProgress(initialProgress);
      setIsLoading(initialProgress.status === "running");
    }

    // Subscribe to updates
    const unsubscribe = progressTracker.subscribe(executionId, updateProgress);

    return unsubscribe;
  }, [executionId, updateProgress]);

  // Cancel workflow
  const cancelWorkflow = useCallback(
    (reason = "User cancelled") => {
      if (executionId && progress?.progress?.canCancel) {
        progressTracker.cancelTracking(executionId, reason);
      }
    },
    [executionId, progress]
  );

  return {
    progress,
    isLoading,
    error,
    canCancel: progress?.progress?.canCancel || false,
    cancelWorkflow,

    // Computed values for easy access
    percentage: progress?.progress?.percentage || 0,
    message: progress?.progress?.message || "",
    currentStep: progress?.currentStep,
    completedSteps: progress?.completedSteps || 0,
    totalSteps: progress?.totalSteps || 0,
    estimatedCompletion: progress?.estimatedCompletion,
    status: progress?.status || "unknown",
  };
};

/**
 * Hook for tracking all active workflows
 * @returns {Object} All active workflows and statistics
 */
export const useAllWorkflowProgress = () => {
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [stats, setStats] = useState(null);

  // Update active workflows
  const updateActiveWorkflows = useCallback(() => {
    const workflows = progressTracker.getActiveWorkflows();
    const statistics = progressTracker.getProgressStats();

    setActiveWorkflows(workflows);
    setStats(statistics);
  }, []);

  // Subscribe to all workflow updates
  useEffect(() => {
    // Initial load
    updateActiveWorkflows();

    // Subscribe to all workflow updates
    const unsubscribe = progressTracker.subscribe("all", updateActiveWorkflows);

    // Periodic refresh for statistics
    const interval = setInterval(updateActiveWorkflows, 5000); // Every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [updateActiveWorkflows]);

  return {
    activeWorkflows,
    stats,
    totalActive: activeWorkflows.length,
    refresh: updateActiveWorkflows,
  };
};

/**
 * Hook for workflow execution with progress tracking
 * @param {Function} workflowExecutor - Function that executes the workflow
 * @returns {Object} Execution state and controls
 */
export const useWorkflowExecution = (workflowExecutor) => {
  const [executionId, setExecutionId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

  // Get progress for current execution
  const progressData = useWorkflowProgress(executionId);

  // Execute workflow
  const execute = useCallback(
    async (...args) => {
      if (isExecuting) return;

      setIsExecuting(true);
      setResult(null);

      try {
        const workflowResult = await workflowExecutor(...args);

        // Extract execution ID from result if available
        if (workflowResult?.executionId) {
          setExecutionId(workflowResult.executionId);
        }

        setResult(workflowResult);
        return workflowResult;
      } catch (error) {
        setResult({ success: false, error: error.message });
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [workflowExecutor, isExecuting]
  );

  // Reset execution state
  const reset = useCallback(() => {
    setExecutionId(null);
    setIsExecuting(false);
    setResult(null);
  }, []);

  return {
    execute,
    reset,
    isExecuting,
    result,
    executionId,
    ...progressData,
  };
};

export default useWorkflowProgress;
