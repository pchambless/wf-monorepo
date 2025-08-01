/**
 * Workflow Monitor
 *
 * Comprehensive monitoring and debugging system for workflow execution
 * Provides logging, metrics collection, performance tracking, and debugging tools
 */

import { createLogger } from "@whatsfresh/shared-imports";
import { getWorkflowTimeout } from "../../config/workflowConfig.js";

const log = createLogger("WorkflowMonitor");

export class WorkflowMonitor {
  constructor() {
    this.executionLogs = new Map();
    this.performanceMetrics = new Map();
    this.debugSessions = new Map();
    this.alerts = [];
    this.thresholds = {
      executionTime: 30000, // 30 seconds
      errorRate: 0.1, // 10%
      memoryUsage: 100 * 1024 * 1024, // 100MB
    };
    this.isEnabled = true;
  }

  /**
   * Start monitoring a workflow execution
   * @param {string} executionId - Execution identifier
   * @param {Object} workflow - Workflow definition
   * @param {Object} context - Execution context
   */
  startExecution(executionId, workflow, context) {
    if (!this.isEnabled) return;

    const executionLog = {
      executionId,
      workflowName: workflow.name,
      startTime: Date.now(),
      context: this.sanitizeContext(context),
      steps: [],
      metrics: {
        memoryStart: this.getMemoryUsage(),
        cpuStart: process.cpuUsage ? process.cpuUsage() : null,
      },
      status: "running",
      debugInfo: {
        breakpoints: [],
        variables: new Map(),
        callStack: [],
      },
    };

    this.executionLogs.set(executionId, executionLog);

    log.info("Workflow execution started", {
      executionId,
      workflowName: workflow.name,
      expectedTimeout: getWorkflowTimeout(workflow.name),
    });

    // Set up performance monitoring
    this.setupPerformanceMonitoring(executionId);
  }

  /**
   * Log workflow step execution
   * @param {string} executionId - Execution identifier
   * @param {Object} step - Step definition
   * @param {string} status - Step status (started, completed, failed)
   * @param {Object} data - Step data or error
   */
  logStep(executionId, step, status, data = {}) {
    if (!this.isEnabled) return;

    const executionLog = this.executionLogs.get(executionId);
    if (!executionLog) return;

    const stepLog = {
      stepName: step.name,
      status,
      timestamp: Date.now(),
      duration: null,
      data: status === "failed" ? { error: data.message } : data,
      memoryUsage: this.getMemoryUsage(),
      debugInfo: {
        variables: new Map(),
        stackTrace: status === "failed" ? data.stack : null,
      },
    };

    // Calculate duration for completed/failed steps
    const existingStep = executionLog.steps.find(
      (s) => s.stepName === step.name && s.status === "started"
    );
    if (existingStep && (status === "completed" || status === "failed")) {
      stepLog.duration = stepLog.timestamp - existingStep.timestamp;
    }

    executionLog.steps.push(stepLog);

    // Check for performance issues
    this.checkStepPerformance(executionId, stepLog);

    log.debug("Workflow step logged", {
      executionId,
      stepName: step.name,
      status,
      duration: stepLog.duration,
    });
  }

  /**
   * Complete workflow execution monitoring
   * @param {string} executionId - Execution identifier
   * @param {Object} result - Execution result
   */
  completeExecution(executionId, result) {
    if (!this.isEnabled) return;

    const executionLog = this.executionLogs.get(executionId);
    if (!executionLog) return;

    const endTime = Date.now();
    const totalDuration = endTime - executionLog.startTime;

    executionLog.endTime = endTime;
    executionLog.totalDuration = totalDuration;
    executionLog.status = result.success ? "completed" : "failed";
    executionLog.result = {
      success: result.success,
      error: result.error?.message,
      data: result.success ? Object.keys(result.data || {}) : null,
    };
    executionLog.metrics.memoryEnd = this.getMemoryUsage();
    executionLog.metrics.cpuEnd = process.cpuUsage ? process.cpuUsage() : null;

    // Update performance metrics
    this.updatePerformanceMetrics(executionLog);

    // Check for alerts
    this.checkAlerts(executionLog);

    log.info("Workflow execution completed", {
      executionId,
      workflowName: executionLog.workflowName,
      success: result.success,
      duration: totalDuration,
      stepsExecuted: executionLog.steps.filter((s) => s.status === "completed")
        .length,
    });

    // Cleanup old logs (keep last 1000)
    this.cleanupOldLogs();
  }

  /**
   * Set up performance monitoring for execution
   * @private
   */
  setupPerformanceMonitoring(executionId) {
    const interval = setInterval(() => {
      const executionLog = this.executionLogs.get(executionId);
      if (!executionLog || executionLog.status !== "running") {
        clearInterval(interval);
        return;
      }

      // Collect performance metrics
      const metrics = {
        timestamp: Date.now(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: process.cpuUsage ? process.cpuUsage() : null,
        activeSteps: executionLog.steps.filter((s) => s.status === "started")
          .length,
      };

      if (!executionLog.performanceSnapshots) {
        executionLog.performanceSnapshots = [];
      }
      executionLog.performanceSnapshots.push(metrics);

      // Check for memory leaks or excessive CPU usage
      this.checkResourceUsage(executionId, metrics);
    }, 1000); // Check every second

    // Store interval reference for cleanup
    const executionLog = this.executionLogs.get(executionId);
    if (executionLog) {
      executionLog.monitoringInterval = interval;
    }
  }

  /**
   * Check step performance for issues
   * @private
   */
  checkStepPerformance(executionId, stepLog) {
    if (stepLog.duration && stepLog.duration > this.thresholds.executionTime) {
      this.createAlert("SLOW_STEP", {
        executionId,
        stepName: stepLog.stepName,
        duration: stepLog.duration,
        threshold: this.thresholds.executionTime,
      });
    }

    if (stepLog.memoryUsage > this.thresholds.memoryUsage) {
      this.createAlert("HIGH_MEMORY", {
        executionId,
        stepName: stepLog.stepName,
        memoryUsage: stepLog.memoryUsage,
        threshold: this.thresholds.memoryUsage,
      });
    }
  }

  /**
   * Check resource usage during execution
   * @private
   */
  checkResourceUsage(executionId, metrics) {
    if (metrics.memoryUsage > this.thresholds.memoryUsage * 1.5) {
      this.createAlert("MEMORY_LEAK", {
        executionId,
        memoryUsage: metrics.memoryUsage,
        threshold: this.thresholds.memoryUsage,
      });
    }
  }

  /**
   * Update performance metrics
   * @private
   */
  updatePerformanceMetrics(executionLog) {
    const workflowName = executionLog.workflowName;

    if (!this.performanceMetrics.has(workflowName)) {
      this.performanceMetrics.set(workflowName, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errorRate: 0,
        lastExecution: null,
        stepMetrics: new Map(),
      });
    }

    const metrics = this.performanceMetrics.get(workflowName);
    metrics.totalExecutions++;
    metrics.totalDuration += executionLog.totalDuration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalExecutions;
    metrics.minDuration = Math.min(
      metrics.minDuration,
      executionLog.totalDuration
    );
    metrics.maxDuration = Math.max(
      metrics.maxDuration,
      executionLog.totalDuration
    );
    metrics.lastExecution = executionLog.endTime;

    if (executionLog.status === "completed") {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;

    // Update step metrics
    executionLog.steps.forEach((step) => {
      if (step.duration) {
        if (!metrics.stepMetrics.has(step.stepName)) {
          metrics.stepMetrics.set(step.stepName, {
            totalExecutions: 0,
            totalDuration: 0,
            averageDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
          });
        }

        const stepMetrics = metrics.stepMetrics.get(step.stepName);
        stepMetrics.totalExecutions++;
        stepMetrics.totalDuration += step.duration;
        stepMetrics.averageDuration =
          stepMetrics.totalDuration / stepMetrics.totalExecutions;
        stepMetrics.minDuration = Math.min(
          stepMetrics.minDuration,
          step.duration
        );
        stepMetrics.maxDuration = Math.max(
          stepMetrics.maxDuration,
          step.duration
        );
      }
    });
  }

  /**
   * Check for alert conditions
   * @private
   */
  checkAlerts(executionLog) {
    // Check error rate
    const metrics = this.performanceMetrics.get(executionLog.workflowName);
    if (metrics && metrics.errorRate > this.thresholds.errorRate) {
      this.createAlert("HIGH_ERROR_RATE", {
        workflowName: executionLog.workflowName,
        errorRate: metrics.errorRate,
        threshold: this.thresholds.errorRate,
      });
    }

    // Check execution time
    if (executionLog.totalDuration > this.thresholds.executionTime) {
      this.createAlert("SLOW_EXECUTION", {
        executionId: executionLog.executionId,
        workflowName: executionLog.workflowName,
        duration: executionLog.totalDuration,
        threshold: this.thresholds.executionTime,
      });
    }
  }

  /**
   * Create alert
   * @private
   */
  createAlert(type, data) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      data,
      timestamp: Date.now(),
      severity: this.getAlertSeverity(type),
      acknowledged: false,
    };

    this.alerts.push(alert);

    log.warn("Workflow alert created", {
      alertId: alert.id,
      type,
      severity: alert.severity,
      data,
    });

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get alert severity
   * @private
   */
  getAlertSeverity(type) {
    const severityMap = {
      SLOW_STEP: "warning",
      SLOW_EXECUTION: "warning",
      HIGH_MEMORY: "warning",
      MEMORY_LEAK: "critical",
      HIGH_ERROR_RATE: "critical",
    };
    return severityMap[type] || "info";
  }

  /**
   * Start debug session for workflow
   * @param {string} workflowName - Workflow name
   * @param {Object} debugConfig - Debug configuration
   */
  startDebugSession(workflowName, debugConfig = {}) {
    const sessionId = `debug_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 5)}`;

    const debugSession = {
      sessionId,
      workflowName,
      startTime: Date.now(),
      breakpoints: debugConfig.breakpoints || [],
      watchVariables: debugConfig.watchVariables || [],
      stepMode: debugConfig.stepMode || false,
      logLevel: debugConfig.logLevel || "debug",
      captureState: debugConfig.captureState !== false,
      executions: [],
    };

    this.debugSessions.set(sessionId, debugSession);

    log.info("Debug session started", {
      sessionId,
      workflowName,
      breakpoints: debugSession.breakpoints.length,
    });

    return sessionId;
  }

  /**
   * Add breakpoint to debug session
   * @param {string} sessionId - Debug session ID
   * @param {string} stepName - Step name to break on
   * @param {Object} condition - Optional break condition
   */
  addBreakpoint(sessionId, stepName, condition = null) {
    const session = this.debugSessions.get(sessionId);
    if (!session) return false;

    const breakpoint = {
      id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      stepName,
      condition,
      hitCount: 0,
      enabled: true,
    };

    session.breakpoints.push(breakpoint);

    log.debug("Breakpoint added", {
      sessionId,
      breakpointId: breakpoint.id,
      stepName,
    });

    return breakpoint.id;
  }

  /**
   * Check if execution should break at step
   * @param {string} executionId - Execution ID
   * @param {string} stepName - Step name
   * @param {Object} context - Current context
   */
  shouldBreak(executionId, stepName, context) {
    const executionLog = this.executionLogs.get(executionId);
    if (!executionLog) return false;

    // Find active debug sessions for this workflow
    const activeSessions = Array.from(this.debugSessions.values()).filter(
      (session) => session.workflowName === executionLog.workflowName
    );

    for (const session of activeSessions) {
      const breakpoint = session.breakpoints.find(
        (bp) => bp.enabled && bp.stepName === stepName
      );

      if (breakpoint) {
        breakpoint.hitCount++;

        // Check condition if specified
        if (breakpoint.condition) {
          try {
            const shouldBreak = this.evaluateBreakCondition(
              breakpoint.condition,
              context
            );
            if (!shouldBreak) continue;
          } catch (error) {
            log.warn("Breakpoint condition evaluation failed", {
              breakpointId: breakpoint.id,
              error: error.message,
            });
            continue;
          }
        }

        // Capture debug state
        this.captureDebugState(
          executionId,
          stepName,
          context,
          session.sessionId
        );

        log.info("Breakpoint hit", {
          sessionId: session.sessionId,
          breakpointId: breakpoint.id,
          stepName,
          hitCount: breakpoint.hitCount,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Capture debug state at breakpoint
   * @private
   */
  captureDebugState(executionId, stepName, context, sessionId) {
    const executionLog = this.executionLogs.get(executionId);
    if (!executionLog) return;

    const debugState = {
      timestamp: Date.now(),
      stepName,
      context: this.sanitizeContext(context),
      memoryUsage: this.getMemoryUsage(),
      callStack: this.getCallStack(),
      variables: this.extractVariables(context),
    };

    if (!executionLog.debugStates) {
      executionLog.debugStates = [];
    }
    executionLog.debugStates.push(debugState);

    // Add to debug session
    const session = this.debugSessions.get(sessionId);
    if (session) {
      if (!session.capturedStates) {
        session.capturedStates = [];
      }
      session.capturedStates.push({
        executionId,
        ...debugState,
      });
    }
  }

  /**
   * Evaluate break condition
   * @private
   */
  evaluateBreakCondition(condition, context) {
    if (typeof condition === "function") {
      return condition(context);
    } else if (typeof condition === "string") {
      // Simple property-based conditions
      const [property, operator, value] = condition.split(" ");
      const actualValue = this.getNestedProperty(context, property);

      switch (operator) {
        case "===":
          return actualValue === value;
        case "!==":
          return actualValue !== value;
        case ">":
          return Number(actualValue) > Number(value);
        case "<":
          return Number(actualValue) < Number(value);
        case "exists":
          return actualValue !== undefined && actualValue !== null;
        default:
          return Boolean(actualValue);
      }
    }
    return Boolean(condition);
  }

  /**
   * Get nested property from object
   * @private
   */
  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Extract variables from context for debugging
   * @private
   */
  extractVariables(context) {
    const variables = {};

    // Extract primitive values and simple objects
    Object.entries(context).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        variables[key] = value;
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        // Extract first level of object properties
        variables[key] = Object.keys(value).reduce((obj, prop) => {
          if (typeof value[prop] !== "function") {
            obj[prop] = value[prop];
          }
          return obj;
        }, {});
      }
    });

    return variables;
  }

  /**
   * Get current call stack (simplified)
   * @private
   */
  getCallStack() {
    const stack = new Error().stack;
    return stack ? stack.split("\n").slice(2, 8) : [];
  }

  /**
   * Get current memory usage
   * @private
   */
  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed;
    }
    return 0;
  }

  /**
   * Get execution logs for workflow
   * @param {string} workflowName - Workflow name
   * @param {number} limit - Maximum number of logs to return
   */
  getExecutionLogs(workflowName = null, limit = 50) {
    const logs = Array.from(this.executionLogs.values());

    const filtered = workflowName
      ? logs.filter((log) => log.workflowName === workflowName)
      : logs;

    return filtered.sort((a, b) => b.startTime - a.startTime).slice(0, limit);
  }

  /**
   * Get performance metrics for workflow
   * @param {string} workflowName - Workflow name
   */
  getPerformanceMetrics(workflowName = null) {
    if (workflowName) {
      return this.performanceMetrics.get(workflowName) || null;
    }
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Get active alerts
   * @param {string} severity - Filter by severity
   */
  getAlerts(severity = null) {
    const filtered = severity
      ? this.alerts.filter((alert) => alert.severity === severity)
      : this.alerts;

    return filtered
      .filter((alert) => !alert.acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Acknowledge alert
   * @param {string} alertId - Alert ID
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get debug session information
   * @param {string} sessionId - Session ID
   */
  getDebugSession(sessionId) {
    return this.debugSessions.get(sessionId) || null;
  }

  /**
   * Stop debug session
   * @param {string} sessionId - Session ID
   */
  stopDebugSession(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;

      log.info("Debug session stopped", {
        sessionId,
        duration: session.duration,
        executionsDebugged: session.executions.length,
      });

      return this.debugSessions.delete(sessionId);
    }
    return false;
  }

  /**
   * Set monitoring thresholds
   * @param {Object} thresholds - New threshold values
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };

    log.info("Monitoring thresholds updated", this.thresholds);
  }

  /**
   * Enable/disable monitoring
   * @param {boolean} enabled - Enable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;

    log.info(`Workflow monitoring ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Clean up old logs to prevent memory issues
   * @private
   */
  cleanupOldLogs() {
    const maxLogs = 1000;
    const logs = Array.from(this.executionLogs.entries());

    if (logs.length > maxLogs) {
      // Keep most recent logs
      const sorted = logs.sort((a, b) => b[1].startTime - a[1].startTime);
      const toKeep = sorted.slice(0, maxLogs);

      this.executionLogs.clear();
      toKeep.forEach(([id, log]) => {
        this.executionLogs.set(id, log);
      });

      log.debug("Old execution logs cleaned up", {
        removed: logs.length - maxLogs,
        remaining: maxLogs,
      });
    }
  }

  /**
   * Sanitize context for logging
   * @private
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    const sensitiveFields = ["password", "token", "apiKey", "secret"];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });
    return sanitized;
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats() {
    return {
      totalExecutions: this.executionLogs.size,
      activeDebugSessions: Array.from(this.debugSessions.values()).filter(
        (s) => !s.endTime
      ).length,
      totalAlerts: this.alerts.length,
      unacknowledgedAlerts: this.alerts.filter((a) => !a.acknowledged).length,
      monitoredWorkflows: this.performanceMetrics.size,
      isEnabled: this.isEnabled,
      thresholds: this.thresholds,
    };
  }
}

// Export singleton instance
export const workflowMonitor = new WorkflowMonitor();
export default workflowMonitor;
