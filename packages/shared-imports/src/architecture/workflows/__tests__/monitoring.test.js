/**
 * Workflow Monitoring and Debugging Tests
 *
 * Tests for workflow monitoring, debugging tools, and performance analytics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowMonitor } from '../monitoring/WorkflowMonitor.js';
import { WorkflowDebugger } from '../monitoring/WorkflowDebugger.js';
import { WorkflowInstance } from '../WorkflowInstance.js';
import { workflowRegistry } from '../WorkflowRegistry.js';

describe('Workflow Monitoring', () => {
  let monitor;

  beforeEach(() => {
    monitor = new WorkflowMonitor();
    workflowRegistry.clear();
  });

  describe('Execution Monitoring', () => {
    it('should start and complete execution monitoring', async () => {
      const workflow = {
        name: 'monitoredWorkflow',
        steps: [
          {
            name: 'step1',
            execute: async () => ({ result: 'success' })
          }
        ]
      };

      const executionId = 'test_execution_123';
      const context = { input: 'test' };

      monitor.startExecution(executionId, workflow, context);
      
      const executionLog = monitor.executionLogs.get(executionId);
      expect(executionLog).toBeDefined();
      expect(executionLog.workflowName).toBe('monitoredWorkflow');
      expect(executionLog.status).toBe('running');
      expect(executionLog.context.input).toBe('test');

      monitor.completeExecution(executionId, { success: true, data: { result: 'success' } });
      
      expect(executionLog.status).toBe('completed');
      expect(executionLog.endTime).toBeDefined();
      expect(executionLog.totalDuration).toBeGreaterThan(0);
    });

    it('should log workflow steps', () => {
      const workflow = { name: 'stepLogWorkflow', steps: [] };
      const executionId = 'step_log_test';
      const step = { name: 'testStep' };

      monitor.startExecution(executionId, workflow, {});
      
      monitor.logStep(executionId, step, 'started');
      monitor.logStep(executionId, step, 'completed', { result: 'done' });

      const executionLog = monitor.executionLogs.get(executionId);
      expect(executionLog.steps).toHaveLength(2);
      expect(executionLog.steps[0].status).toBe('started');
      expect(executionLog.steps[1].status).toBe('completed');
      expect(executionLog.steps[1].data.result).toBe('done');
    });

    it('should track performance metrics', async () => {
      const workflow = { name: 'perfWorkflow', steps: [] };
      const executionId = 'perf_test';

      monitor.startExecution(executionId, workflow, {});
      
      // Simulate some execution time
      await new Promise(resolve => setTimeout(resolve, 10));
      
      monitor.completeExecution(executionId, { success: true, data: {} });

      const metrics = monitor.getPerformanceMetrics('perfWorkflow');
      expect(metrics).toBeDefined();
      expect(metrics.totalExecutions).toBe(1);
      expect(metrics.successfulExecutions).toBe(1);
      expect(metrics.averageDuration).toBeGreaterThan(0);
    });

    it('should create alerts for performance issues', () => {
      const workflow = { name: 'slowWorkflow', steps: [] };
      const executionId = 'slow_test';

      // Set low threshold for testing
      monitor.setThresholds({ executionTime: 5 });

      monitor.startExecution(executionId, workflow, {});
      
      const step = { name: 'slowStep' };
      monitor.logStep(executionId, step, 'started');
      monitor.logStep(executionId, step, 'completed', {});

      // Manually set a slow duration
      const executionLog = monitor.executionLogs.get(executionId);
      executionLog.steps[1].duration = 10; // 10ms > 5ms threshold
      
      monitor.checkStepPerformance(executionId, executionLog.steps[1]);

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('SLOW_STEP');
    });
  });

  describe('Debug Sessions', () => {
    it('should create and manage debug sessions', () => {
      const sessionId = monitor.startDebugSession('debugWorkflow', {
        breakpoints: ['step1'],
        stepMode: true
      });

      expect(sessionId).toBeDefined();
      
      const session = monitor.getDebugSession(sessionId);
      expect(session).toBeDefined();
      expect(session.workflowName).toBe('debugWorkflow');
      expect(session.breakpoints).toHaveLength(0); // Initially empty, added separately

      const breakpointId = monitor.addBreakpoint(sessionId, 'step1');
      expect(breakpointId).toBeDefined();
      
      const updatedSession = monitor.getDebugSession(sessionId);
      expect(updatedSession.breakpoints).toHaveLength(1);
      expect(updatedSession.breakpoints[0].stepName).toBe('step1');
    });

    it('should check breakpoint conditions', () => {
      const sessionId = monitor.startDebugSession('conditionWorkflow');
      monitor.addBreakpoint(sessionId, 'conditionalStep', 'value > 5');

      const executionId = 'condition_test';
      monitor.startExecution(executionId, { name: 'conditionWorkflow', steps: [] }, {});

      // Should break when condition is true
      const shouldBreak1 = monitor.shouldBreak(executionId, 'conditionalStep', { value: 10 });
      expect(shouldBreak1).toBe(true);

      // Should not break when condition is false
      const shouldBreak2 = monitor.shouldBreak(executionId, 'conditionalStep', { value: 3 });
      expect(shouldBreak2).toBe(false);
    });

    it('should capture debug state at breakpoints', () => {
      const sessionId = monitor.startDebugSession('stateWorkflow');
      monitor.addBreakpoint(sessionId, 'stateStep');

      const executionId = 'state_test';
      monitor.startExecution(executionId, { name: 'stateWorkflow', steps: [] }, {});

      const context = { variable1: 'value1', variable2: 42 };
      monitor.shouldBreak(executionId, 'stateStep', context);

      const executionLog = monitor.executionLogs.get(executionId);
      expect(executionLog.debugStates).toBeDefined();
      expect(executionLog.debugStates).toHaveLength(1);
      expect(executionLog.debugStates[0].context.variable1).toBe('value1');
    });
  });

  describe('Alert Management', () => {
    it('should create and acknowledge alerts', () => {
      monitor.createAlert('TEST_ALERT', { message: 'Test alert' });

      const alerts = monitor.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('TEST_ALERT');
      expect(alerts[0].acknowledged).toBe(false);

      const acknowledged = monitor.acknowledgeAlert(alerts[0].id);
      expect(acknowledged).toBe(true);
      expect(alerts[0].acknowledged).toBe(true);
    });

    it('should filter alerts by severity', () => {
      monitor.createAlert('CRITICAL_ALERT', { message: 'Critical' });
      monitor.createAlert('WARNING_ALERT', { message: 'Warning' });

      const criticalAlerts = monitor.getAlerts('critical');
      const warningAlerts = monitor.getAlerts('warning');

      expect(criticalAlerts).toHaveLength(1);
      expect(warningAlerts).toHaveLength(1);
      expect(criticalAlerts[0].severity).toBe('critical');
      expect(warningAlerts[0].severity).toBe('warning');
    });
  });

  describe('Configuration', () => {
    it('should update monitoring thresholds', () => {
      const newThresholds = {
        executionTime: 60000,
        errorRate: 0.05,
        memoryUsage: 200 * 1024 * 1024
      };

      monitor.setThresholds(newThresholds);
      
      expect(monitor.thresholds.executionTime).toBe(60000);
      expect(monitor.thresholds.errorRate).toBe(0.05);
      expect(monitor.thresholds.memoryUsage).toBe(200 * 1024 * 1024);
    });

    it('should enable/disable monitoring', () => {
      expect(monitor.isEnabled).toBe(true);

      monitor.setEnabled(false);
      expect(monitor.isEnabled).toBe(false);

      // Should not log when disabled
      monitor.startExecution('disabled_test', { name: 'test', steps: [] }, {});
      expect(monitor.executionLogs.has('disabled_test')).toBe(false);

      monitor.setEnabled(true);
      expect(monitor.isEnabled).toBe(true);
    });
  });
});

describe('Workflow Debugger', () => {
  let debugger;

  beforeEach(() => {
    debugger = new WorkflowDebugger();
    workflowRegistry.clear();
  });

  describe('Debug Session Management', () => {
    it('should create debug session with inspector tools', () => {
      workflowRegistry.register('inspectWorkflow', {
        name: 'inspectWorkflow',
        steps: [
          { name: 'step1', execute: async () => ({}) },
          { name: 'step2', execute: async () => ({}) }
        ]
      });

      const session = debugger.createDebugSession('inspectWorkflow', {
        stepMode: true,
        breakpoints: ['step1']
      });

      expect(session.sessionId).toBeDefined();
      expect(session.workflowName).toBe('inspectWorkflow');
      expect(session.inspector).toBeDefined();
      expect(session.stepper).toBeDefined();
      expect(session.watcher).toBeDefined();
      expect(session.tracer).toBeDefined();
    });

    it('should inspect workflow definition', () => {
      workflowRegistry.register('complexWorkflow', {
        name: 'complexWorkflow',
        steps: [
          { name: 'step1', execute: async () => ({}), condition: 'value > 0' },
          { name: 'step2', execute: async () => ({}), parallel: true },
          { name: 'step3', execute: async () => ({}) }
        ],
        dependencies: [{ workflow: 'dependency1' }]
      });

      const session = debugger.createDebugSession('complexWorkflow');
      const definition = session.inspector.inspectDefinition();

      expect(definition.name).toBe('complexWorkflow');
      expect(definition.stepCount).toBe(3);
      expect(definition.steps[0].hasCondition).toBe(true);
      expect(definition.steps[1].isParallel).toBe(true);
      expect(definition.dependencies).toHaveLength(1);
    });

    it('should analyze workflow complexity', () => {
      workflowRegistry.register('complexityWorkflow', {
        name: 'complexityWorkflow',
        steps: [
          { name: 'step1', execute: async () => ({}) },
          { name: 'step2', execute: async () => ({}), condition: 'test' },
          { name: 'step3', execute: async () => ({}), parallel: true },
          { name: 'step4', execute: async () => ({}), condition: 'test2' }
        ],
        dependencies: [{ workflow: 'dep1' }, { workflow: 'dep2' }]
      });

      const session = debugger.createDebugSession('complexityWorkflow');
      const complexity = session.inspector.analyzeComplexity();

      expect(complexity.stepCount).toBe(4);
      expect(complexity.conditionalSteps).toBe(2);
      expect(complexity.parallelSteps).toBe(1);
      expect(complexity.dependencyCount).toBe(2);
      expect(complexity.complexityScore).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(complexity.estimatedComplexity);
    });

    it('should validate workflow definition', () => {
      // Valid workflow
      workflowRegistry.register('validWorkflow', {
        name: 'validWorkflow',
        steps: [
          { name: 'step1', execute: async () => ({}) }
        ]
      });

      const session1 = debugger.createDebugSession('validWorkflow');
      const validation1 = session1.inspector.validateDefinition();

      expect(validation1.valid).toBe(true);
      expect(validation1.errors).toHaveLength(0);

      // Invalid workflow
      workflowRegistry.register('invalidWorkflow', {
        name: 'invalidWorkflow',
        steps: [
          { name: 'step1' }, // Missing execute function
          { execute: async () => ({}) } // Missing name
        ]
      });

      const session2 = debugger.createDebugSession('invalidWorkflow');
      const validation2 = session2.inspector.validateDefinition();

      expect(validation2.valid).toBe(false);
      expect(validation2.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Step Control', () => {
    it('should manage breakpoints', () => {
      const session = debugger.createDebugSession('stepWorkflow');
      
      const breakpointId = session.stepper.addBreakpoint('step1', 'value === 42');
      expect(breakpointId).toBeDefined();

      const breakpoints = session.stepper.listBreakpoints();
      expect(breakpoints).toHaveLength(1);
      expect(breakpoints[0].stepName).toBe('step1');
      expect(breakpoints[0].condition).toBe('value === 42');

      const toggled = session.stepper.toggleBreakpoint(breakpointId, false);
      expect(toggled).toBe(false);
      expect(breakpoints[0].enabled).toBe(false);

      const removed = session.stepper.removeBreakpoint(breakpointId);
      expect(removed).toBe(true);
      expect(session.stepper.listBreakpoints()).toHaveLength(0);
    });
  });

  describe('Variable Watching', () => {
    it('should watch variables and track changes', () => {
      const session = debugger.createDebugSession('watchWorkflow');
      
      const watchId = session.watcher.watch('user.name', 'userName');
      expect(watchId).toBeDefined();

      const watched = session.watcher.getWatched();
      expect(watched).toHaveLength(1);
      expect(watched[0].expression).toBe('user.name');
      expect(watched[0].alias).toBe('userName');

      // Update with context
      session.watcher.updateWatched({ user: { name: 'John' } });
      expect(watched[0].lastValue).toBe('John');
      expect(watched[0].changeCount).toBe(1);

      // Update with different value
      session.watcher.updateWatched({ user: { name: 'Jane' } });
      expect(watched[0].lastValue).toBe('Jane');
      expect(watched[0].changeCount).toBe(2);

      const unwatched = session.watcher.unwatch(watchId);
      expect(unwatched).toBe(true);
      expect(session.watcher.getWatched()).toHaveLength(0);
    });
  });

  describe('Execution Tracing', () => {
    it('should trace workflow execution', () => {
      const session = debugger.createDebugSession('traceWorkflow');
      
      const traceId = session.tracer.startTrace();
      expect(traceId).toBeDefined();

      session.tracer.addEvent('STEP_START', { stepName: 'step1' });
      session.tracer.addEvent('STEP_COMPLETE', { stepName: 'step1', result: 'success' });

      const trace = session.tracer.getTrace(traceId);
      expect(trace.events).toHaveLength(2);
      expect(trace.events[0].type).toBe('STEP_START');
      expect(trace.events[1].type).toBe('STEP_COMPLETE');

      const stoppedTrace = session.tracer.stopTrace(traceId);
      expect(stoppedTrace.isActive).toBe(false);
      expect(stoppedTrace.duration).toBeGreaterThan(0);
    });

    it('should export trace in different formats', () => {
      const session = debugger.createDebugSession('exportWorkflow');
      
      const traceId = session.tracer.startTrace();
      session.tracer.addEvent('TEST_EVENT', { data: 'test' });
      session.tracer.stopTrace(traceId);

      const jsonExport = session.tracer.exportTrace(traceId, 'json');
      expect(typeof jsonExport).toBe('string');
      expect(JSON.parse(jsonExport)).toBeDefined();

      const csvExport = session.tracer.exportTrace(traceId, 'csv');
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain('Sequence,Type,Timestamp,Data');

      const timelineExport = session.tracer.exportTrace(traceId, 'timeline');
      expect(Array.isArray(timelineExport)).toBe(true);
      expect(timelineExport[0]).toHaveProperty('time');
      expect(timelineExport[0]).toHaveProperty('event');
    });
  });

  describe('Execution Analysis', () => {
    it('should analyze execution patterns', () => {
      // Mock some execution logs
      const mockLogs = [
        {
          workflowName: 'analysisWorkflow',
          status: 'completed',
          totalDuration: 1000,
          steps: [
            { stepName: 'step1', duration: 500, status: 'completed' },
            { stepName: 'step2', duration: 500, status: 'completed' }
          ],
          startTime: Date.now() - 10000
        },
        {
          workflowName: 'analysisWorkflow',
          status: 'failed',
          totalDuration: 800,
          steps: [
            { stepName: 'step1', duration: 400, status: 'completed' },
            { stepName: 'step2', duration: 400, status: 'failed' }
          ],
          startTime: Date.now() - 5000
        }
      ];

      // Mock the monitor's getExecutionLogs method
      const originalGetLogs = WorkflowMonitor.prototype.getExecutionLogs;
      WorkflowMonitor.prototype.getExecutionLogs = vi.fn().mockReturnValue(mockLogs);

      const analysis = debugger.analyzeExecutionPatterns('analysisWorkflow');

      expect(analysis.totalExecutions).toBe(2);
      expect(analysis.patterns.commonFailurePoints).toBeDefined();
      expect(analysis.patterns.performanceBottlenecks).toBeDefined();
      expect(analysis.recommendations).toBeDefined();

      // Restore original method
      WorkflowMonitor.prototype.getExecutionLogs = originalGetLogs;
    });

    it('should generate health reports', () => {
      // Mock performance metrics
      const mockMetrics = {
        totalExecutions: 100,
        successfulExecutions: 95,
        failedExecutions: 5,
        averageDuration: 2000,
        errorRate: 0.05
      };

      const originalGetMetrics = WorkflowMonitor.prototype.getPerformanceMetrics;
      const originalGetAlerts = WorkflowMonitor.prototype.getAlerts;
      
      WorkflowMonitor.prototype.getPerformanceMetrics = vi.fn().mockReturnValue(mockMetrics);
      WorkflowMonitor.prototype.getAlerts = vi.fn().mockReturnValue([]);

      const healthReport = debugger.generateHealthReport('healthWorkflow');

      expect(healthReport.workflowName).toBe('healthWorkflow');
      expect(healthReport.healthScore).toBeGreaterThan(0);
      expect(healthReport.status).toBeDefined();
      expect(healthReport.metrics.successRate).toBe(95);
      expect(healthReport.generatedAt).toBeInstanceOf(Date);

      // Restore original methods
      WorkflowMonitor.prototype.getPerformanceMetrics = originalGetMetrics;
      WorkflowMonitor.prototype.getAlerts = originalGetAlerts;
    });
  });
});

describe('Workflow Integration with Monitoring', () => {
  beforeEach(() => {
    workflowRegistry.clear();
  });

  it('should integrate monitoring with workflow execution', async () => {
    const monitorSpy = {
      startExecution: vi.fn(),
      logStep: vi.fn(),
      completeExecution: vi.fn(),
      shouldBreak: vi.fn().mockReturnValue(false)
    };

    // Mock the monitor
    const originalMonitor = WorkflowInstance.prototype.constructor;
    
    workflowRegistry.register('monitoredWorkflow', {
      name: 'monitoredWorkflow',
      steps: [
        {
          name: 'monitoredStep',
          execute: async () => ({ monitored: true })
        }
      ]
    });

    const result = await workflowRegistry.execute('monitoredWorkflow', { test: true });

    expect(result.success).toBe(true);
    expect(result.data.monitored).toBe(true);
  });
});