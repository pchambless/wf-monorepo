/**
 * Workflow Debugger
 *
 * Interactive debugging tools for workflow development and troubleshooting
 */

import { workflowMonitor } from "./WorkflowMonitor.js";
import { workflowRegistry } from "../WorkflowRegistry.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("WorkflowDebugger");

export class WorkflowDebugger {
  constructor() {
    this.activeInspections = new Map();
    this.stepInspectors = new Map();
    this.variableWatchers = new Map();
    this.executionTraces = new Map();
  }

  /**
   * Create interactive debug session
   * @param {string} workflowName - Workflow to debug
   * @param {Object} options - Debug options
   */
  createDebugSession(workflowName, options = {}) {
    const sessionId = workflowMonitor.startDebugSession(workflowName, {
      stepMode: options.stepMode || false,
      breakpoints: options.breakpoints || [],
      watchVariables: options.watchVariables || [],
      captureState: options.captureState !== false,
      logLevel: options.logLevel || "debug",
    });

    const debugSession = {
      sessionId,
      workflowName,
      options,
      inspector: this.createWorkflowInspector(workflowName),
      stepper: this.createStepController(sessionId),
      watcher: this.createVariableWatcher(sessionId),
      tracer: this.createExecutionTracer(sessionId),
    };

    this.activeInspections.set(sessionId, debugSession);

    log.info("Debug session created", {
      sessionId,
      workflowName,
      options,
    });

    return debugSession;
  }

  /**
   * Create workflow inspector
   * @private
   */
  createWorkflowInspector(workflowName) {
    return {
      /**
       * Inspect workflow definition
       */
      inspectDefinition() {
        const workflow = workflowRegistry.getWorkflow(workflowName);
        if (!workflow) {
          throw new Error(`Workflow '${workflowName}' not found`);
        }

        return {
          name: workflow.name,
          stepCount: workflow.steps.length,
          steps: workflow.steps.map((step) => ({
            name: step.name,
            hasCondition: !!step.condition,
            isParallel: !!step.parallel,
            timeout: step.timeout,
            dependencies: step.dependencies || [],
          })),
          contextRefresh: workflow.contextRefresh,
          dependencies: workflow.dependencies,
          registeredAt: workflow.registeredAt,
        };
      },

      /**
       * Analyze workflow complexity
       */
      analyzeComplexity() {
        const workflow = workflowRegistry.getWorkflow(workflowName);
        if (!workflow) return null;

        const analysis = {
          stepCount: workflow.steps.length,
          conditionalSteps: workflow.steps.filter((s) => s.condition).length,
          parallelSteps: workflow.steps.filter((s) => s.parallel).length,
          dependencyCount: (workflow.dependencies || []).length,
          estimatedComplexity: "low",
        };

        // Calculate complexity score
        let complexityScore = analysis.stepCount;
        complexityScore += analysis.conditionalSteps * 2; // Conditional logic adds complexity
        complexityScore += analysis.parallelSteps * 1.5; // Parallel execution adds some complexity
        complexityScore += analysis.dependencyCount * 3; // Dependencies add significant complexity

        if (complexityScore > 20) {
          analysis.estimatedComplexity = "high";
        } else if (complexityScore > 10) {
          analysis.estimatedComplexity = "medium";
        }

        analysis.complexityScore = complexityScore;
        return analysis;
      },

      /**
       * Get workflow performance history
       */
      getPerformanceHistory() {
        return workflowMonitor.getPerformanceMetrics(workflowName);
      },

      /**
       * Get recent execution logs
       */
      getRecentExecutions(limit = 10) {
        return workflowMonitor.getExecutionLogs(workflowName, limit);
      },

      /**
       * Validate workflow definition
       */
      validateDefinition() {
        const workflow = workflowRegistry.getWorkflow(workflowName);
        if (!workflow) {
          return { valid: false, errors: ["Workflow not found"] };
        }

        const errors = [];
        const warnings = [];

        // Check for required properties
        if (!workflow.steps || workflow.steps.length === 0) {
          errors.push("Workflow must have at least one step");
        }

        // Validate steps
        workflow.steps.forEach((step, index) => {
          if (!step.name) {
            errors.push(`Step ${index} must have a name`);
          }
          if (!step.execute || typeof step.execute !== "function") {
            errors.push(`Step '${step.name}' must have an execute function`);
          }
          if (
            step.condition &&
            typeof step.condition !== "string" &&
            typeof step.condition !== "function"
          ) {
            warnings.push(
              `Step '${step.name}' condition should be string or function`
            );
          }
        });

        // Check for duplicate step names
        const stepNames = workflow.steps.map((s) => s.name);
        const duplicates = stepNames.filter(
          (name, index) => stepNames.indexOf(name) !== index
        );
        if (duplicates.length > 0) {
          warnings.push(`Duplicate step names found: ${duplicates.join(", ")}`);
        }

        return {
          valid: errors.length === 0,
          errors,
          warnings,
        };
      },
    };
  }

  /**
   * Create step controller for debugging
   * @private
   */
  createStepController(sessionId) {
    return {
      /**
       * Add breakpoint to specific step
       */
      addBreakpoint(stepName, condition = null) {
        return workflowMonitor.addBreakpoint(sessionId, stepName, condition);
      },

      /**
       * Remove breakpoint
       */
      removeBreakpoint(breakpointId) {
        const session = workflowMonitor.getDebugSession(sessionId);
        if (session) {
          const index = session.breakpoints.findIndex(
            (bp) => bp.id === breakpointId
          );
          if (index !== -1) {
            session.breakpoints.splice(index, 1);
            return true;
          }
        }
        return false;
      },

      /**
       * List all breakpoints
       */
      listBreakpoints() {
        const session = workflowMonitor.getDebugSession(sessionId);
        return session ? session.breakpoints : [];
      },

      /**
       * Enable/disable breakpoint
       */
      toggleBreakpoint(breakpointId, enabled = null) {
        const session = workflowMonitor.getDebugSession(sessionId);
        if (session) {
          const breakpoint = session.breakpoints.find(
            (bp) => bp.id === breakpointId
          );
          if (breakpoint) {
            breakpoint.enabled =
              enabled !== null ? enabled : !breakpoint.enabled;
            return breakpoint.enabled;
          }
        }
        return false;
      },

      /**
       * Step through execution (when at breakpoint)
       */
      step() {
        // This would be implemented with actual step-through logic
        // For now, it's a placeholder for the debugging interface
        log.debug("Step command executed", { sessionId });
        return { action: "step", sessionId };
      },

      /**
       * Continue execution (when at breakpoint)
       */
      continue() {
        log.debug("Continue command executed", { sessionId });
        return { action: "continue", sessionId };
      },
    };
  }

  /**
   * Create variable watcher
   * @private
   */
  createVariableWatcher(sessionId) {
    const watchers = new Map();

    return {
      /**
       * Watch a variable or expression
       */
      watch(expression, alias = null) {
        const watchId = `watch_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}`;
        const watcher = {
          id: watchId,
          expression,
          alias: alias || expression,
          values: [],
          lastValue: null,
          changeCount: 0,
        };

        watchers.set(watchId, watcher);

        log.debug("Variable watcher added", {
          sessionId,
          watchId,
          expression,
        });

        return watchId;
      },

      /**
       * Remove variable watcher
       */
      unwatch(watchId) {
        return watchers.delete(watchId);
      },

      /**
       * Get all watched variables
       */
      getWatched() {
        return Array.from(watchers.values());
      },

      /**
       * Update watched variables with current context
       */
      updateWatched(context) {
        watchers.forEach((watcher) => {
          try {
            const newValue = this.evaluateExpression(
              watcher.expression,
              context
            );

            if (
              JSON.stringify(newValue) !== JSON.stringify(watcher.lastValue)
            ) {
              watcher.changeCount++;
              watcher.values.push({
                value: newValue,
                timestamp: Date.now(),
              });
              watcher.lastValue = newValue;

              // Keep only last 10 values
              if (watcher.values.length > 10) {
                watcher.values = watcher.values.slice(-10);
              }
            }
          } catch (error) {
            watcher.lastError = error.message;
          }
        });
      },

      /**
       * Evaluate expression in context
       */
      evaluateExpression(expression, context) {
        // Simple property access for now
        if (expression.includes(".")) {
          return expression
            .split(".")
            .reduce((obj, key) => obj?.[key], context);
        }
        return context[expression];
      },
    };
  }

  /**
   * Create execution tracer
   * @private
   */
  createExecutionTracer(sessionId) {
    return {
      /**
       * Start tracing execution
       */
      startTrace() {
        const traceId = `trace_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}`;
        const trace = {
          id: traceId,
          sessionId,
          startTime: Date.now(),
          events: [],
          isActive: true,
        };

        this.executionTraces.set(traceId, trace);

        log.debug("Execution trace started", {
          sessionId,
          traceId,
        });

        return traceId;
      },

      /**
       * Add trace event
       */
      addEvent(type, data) {
        const activeTraces = Array.from(this.executionTraces.values()).filter(
          (trace) => trace.sessionId === sessionId && trace.isActive
        );

        activeTraces.forEach((trace) => {
          trace.events.push({
            type,
            data,
            timestamp: Date.now(),
            sequenceNumber: trace.events.length + 1,
          });
        });
      },

      /**
       * Stop tracing
       */
      stopTrace(traceId) {
        const trace = this.executionTraces.get(traceId);
        if (trace) {
          trace.isActive = false;
          trace.endTime = Date.now();
          trace.duration = trace.endTime - trace.startTime;
          return trace;
        }
        return null;
      },

      /**
       * Get trace data
       */
      getTrace(traceId) {
        return this.executionTraces.get(traceId) || null;
      },

      /**
       * Export trace for analysis
       */
      exportTrace(traceId, format = "json") {
        const trace = this.executionTraces.get(traceId);
        if (!trace) return null;

        switch (format) {
          case "json":
            return JSON.stringify(trace, null, 2);
          case "csv":
            return this.traceToCSV(trace);
          case "timeline":
            return this.traceToTimeline(trace);
          default:
            return trace;
        }
      },

      /**
       * Convert trace to CSV format
       */
      traceToCSV(trace) {
        const headers = ["Sequence", "Type", "Timestamp", "Data"];
        const rows = trace.events.map((event) => [
          event.sequenceNumber,
          event.type,
          new Date(event.timestamp).toISOString(),
          JSON.stringify(event.data),
        ]);

        return [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
      },

      /**
       * Convert trace to timeline format
       */
      traceToTimeline(trace) {
        return trace.events.map((event) => ({
          time: event.timestamp - trace.startTime,
          event: event.type,
          data: event.data,
        }));
      },
    };
  }

  /**
   * Analyze workflow execution patterns
   * @param {string} workflowName - Workflow name
   * @param {Object} options - Analysis options
   */
  analyzeExecutionPatterns(workflowName, options = {}) {
    const logs = workflowMonitor.getExecutionLogs(
      workflowName,
      options.limit || 100
    );
    const metrics = workflowMonitor.getPerformanceMetrics(workflowName);

    if (!logs.length) {
      return { error: "No execution data available" };
    }

    const analysis = {
      totalExecutions: logs.length,
      successRate: metrics
        ? metrics.successfulExecutions / metrics.totalExecutions
        : 0,
      averageDuration: metrics ? metrics.averageDuration : 0,
      patterns: {
        commonFailurePoints: this.findCommonFailurePoints(logs),
        performanceBottlenecks: this.findPerformanceBottlenecks(logs),
        executionTrends: this.analyzeExecutionTrends(logs),
        resourceUsage: this.analyzeResourceUsage(logs),
      },
      recommendations: [],
    };

    // Generate recommendations
    if (analysis.successRate < 0.9) {
      analysis.recommendations.push({
        type: "reliability",
        message: "Consider adding retry logic or improving error handling",
        priority: "high",
      });
    }

    if (analysis.averageDuration > 30000) {
      analysis.recommendations.push({
        type: "performance",
        message: "Workflow execution time is high, consider optimization",
        priority: "medium",
      });
    }

    return analysis;
  }

  /**
   * Find common failure points in executions
   * @private
   */
  findCommonFailurePoints(logs) {
    const failedLogs = logs.filter((log) => log.status === "failed");
    const failurePoints = {};

    failedLogs.forEach((log) => {
      const lastStep = log.steps[log.steps.length - 1];
      if (lastStep && lastStep.status === "failed") {
        failurePoints[lastStep.stepName] =
          (failurePoints[lastStep.stepName] || 0) + 1;
      }
    });

    return Object.entries(failurePoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([stepName, count]) => ({ stepName, failureCount: count }));
  }

  /**
   * Find performance bottlenecks
   * @private
   */
  findPerformanceBottlenecks(logs) {
    const stepDurations = {};

    logs.forEach((log) => {
      log.steps.forEach((step) => {
        if (step.duration) {
          if (!stepDurations[step.stepName]) {
            stepDurations[step.stepName] = [];
          }
          stepDurations[step.stepName].push(step.duration);
        }
      });
    });

    const bottlenecks = Object.entries(stepDurations)
      .map(([stepName, durations]) => ({
        stepName,
        averageDuration:
          durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        executionCount: durations.length,
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5);

    return bottlenecks;
  }

  /**
   * Analyze execution trends over time
   * @private
   */
  analyzeExecutionTrends(logs) {
    const sortedLogs = logs.sort((a, b) => a.startTime - b.startTime);
    const trends = {
      durationTrend: "stable",
      successRateTrend: "stable",
      volumeTrend: "stable",
    };

    if (sortedLogs.length < 10) {
      return trends;
    }

    // Analyze duration trend
    const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2));
    const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2));

    const firstHalfAvgDuration =
      firstHalf.reduce((sum, log) => sum + log.totalDuration, 0) /
      firstHalf.length;
    const secondHalfAvgDuration =
      secondHalf.reduce((sum, log) => sum + log.totalDuration, 0) /
      secondHalf.length;

    if (secondHalfAvgDuration > firstHalfAvgDuration * 1.2) {
      trends.durationTrend = "increasing";
    } else if (secondHalfAvgDuration < firstHalfAvgDuration * 0.8) {
      trends.durationTrend = "decreasing";
    }

    return trends;
  }

  /**
   * Analyze resource usage patterns
   * @private
   */
  analyzeResourceUsage(logs) {
    const memoryUsages = logs
      .filter((log) => log.metrics && log.metrics.memoryStart)
      .map((log) => ({
        start: log.metrics.memoryStart,
        end: log.metrics.memoryEnd || log.metrics.memoryStart,
        peak: log.performanceSnapshots
          ? Math.max(...log.performanceSnapshots.map((s) => s.memoryUsage))
          : log.metrics.memoryStart,
      }));

    if (memoryUsages.length === 0) {
      return { memoryAnalysis: "No memory data available" };
    }

    const avgMemoryUsage =
      memoryUsages.reduce((sum, usage) => sum + usage.peak, 0) /
      memoryUsages.length;
    const maxMemoryUsage = Math.max(...memoryUsages.map((usage) => usage.peak));

    return {
      averageMemoryUsage: avgMemoryUsage,
      maxMemoryUsage: maxMemoryUsage,
      memoryEfficiency:
        avgMemoryUsage < 50 * 1024 * 1024 ? "good" : "needs_attention", // 50MB threshold
    };
  }

  /**
   * Generate workflow health report
   * @param {string} workflowName - Workflow name
   */
  generateHealthReport(workflowName) {
    const metrics = workflowMonitor.getPerformanceMetrics(workflowName);
    const alerts = workflowMonitor
      .getAlerts()
      .filter((alert) => alert.data.workflowName === workflowName);
    const analysis = this.analyzeExecutionPatterns(workflowName);

    if (!metrics) {
      return { error: "No metrics available for workflow" };
    }

    const healthScore = this.calculateHealthScore(metrics, alerts, analysis);

    return {
      workflowName,
      healthScore,
      status: this.getHealthStatus(healthScore),
      metrics: {
        totalExecutions: metrics.totalExecutions,
        successRate:
          (metrics.successfulExecutions / metrics.totalExecutions) * 100,
        averageDuration: metrics.averageDuration,
        errorRate: metrics.errorRate * 100,
      },
      alerts: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warnings: alerts.filter((a) => a.severity === "warning").length,
      },
      recommendations: analysis.recommendations || [],
      lastExecution: metrics.lastExecution
        ? new Date(metrics.lastExecution)
        : null,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate workflow health score
   * @private
   */
  calculateHealthScore(metrics, alerts, analysis) {
    let score = 100;

    // Deduct for low success rate
    const successRate = metrics.successfulExecutions / metrics.totalExecutions;
    if (successRate < 0.95) {
      score -= (0.95 - successRate) * 100;
    }

    // Deduct for high error rate
    if (metrics.errorRate > 0.05) {
      score -= (metrics.errorRate - 0.05) * 200;
    }

    // Deduct for alerts
    score -= alerts.filter((a) => a.severity === "critical").length * 10;
    score -= alerts.filter((a) => a.severity === "warning").length * 5;

    // Deduct for performance issues
    if (metrics.averageDuration > 30000) {
      score -= Math.min(20, (metrics.averageDuration - 30000) / 1000);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Get health status from score
   * @private
   */
  getHealthStatus(score) {
    if (score >= 90) return "excellent";
    if (score >= 75) return "good";
    if (score >= 60) return "fair";
    if (score >= 40) return "poor";
    return "critical";
  }

  /**
   * Stop debug session
   * @param {string} sessionId - Session ID
   */
  stopDebugSession(sessionId) {
    const session = this.activeInspections.get(sessionId);
    if (session) {
      workflowMonitor.stopDebugSession(sessionId);
      this.activeInspections.delete(sessionId);

      log.info("Debug session stopped", { sessionId });
      return true;
    }
    return false;
  }

  /**
   * Get active debug sessions
   */
  getActiveDebugSessions() {
    return Array.from(this.activeInspections.values()).map((session) => ({
      sessionId: session.sessionId,
      workflowName: session.workflowName,
      options: session.options,
    }));
  }
}

// Export singleton instance
export const workflowDebugger = new WorkflowDebugger();
export default workflowDebugger;
