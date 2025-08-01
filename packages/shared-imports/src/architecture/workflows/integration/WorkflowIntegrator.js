/**
 * Workflow Integrator
 *
 * Provides patterns for workflow integration including cross-workflow communication,
 * data passing, synchronization, and rollback capabilities
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("WorkflowIntegrator");

export class WorkflowIntegrator {
  constructor() {
    this.activeIntegrations = new Map();
    this.communicationChannels = new Map();
    this.synchronizationPoints = new Map();
    this.rollbackHandlers = new Map();
    this.dataPassingRules = new Map();
  }

  /**
   * Create a workflow integration
   * @param {string} integrationId - Unique integration identifier
   * @param {Object} config - Integration configuration
   */
  createIntegration(integrationId, config) {
    const integration = {
      id: integrationId,
      workflows: config.workflows || [],
      communicationPattern: config.communicationPattern || "event-driven",
      dataPassingStrategy: config.dataPassingStrategy || "merge",
      synchronizationMode: config.synchronizationMode || "async",
      rollbackStrategy: config.rollbackStrategy || "compensating",
      errorHandling: config.errorHandling || "fail-fast",
      timeout: config.timeout || 30000,
      retryPolicy: config.retryPolicy || { maxAttempts: 3, backoffMs: 1000 },
      createdAt: new Date(),
      status: "created",
      executions: [],
    };

    this.activeIntegrations.set(integrationId, integration);

    log.debug("Workflow integration created", {
      integrationId,
      workflows: integration.workflows,
      pattern: integration.communicationPattern,
    });

    return integration;
  }

  /**
   * Execute workflow integration
   * @param {string} integrationId - Integration identifier
   * @param {Object} context - Execution context
   * @param {Object} options - Execution options
   */
  async executeIntegration(integrationId, context = {}, options = {}) {
    const integration = this.activeIntegrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration '${integrationId}' not found`);
    }

    const executionId = this.generateExecutionId(integrationId);
    const execution = {
      id: executionId,
      integrationId,
      startTime: new Date(),
      context: { ...context },
      options: { ...options },
      status: "running",
      results: new Map(),
      errors: [],
      rollbackActions: [],
    };

    integration.executions.push(execution);
    integration.status = "running";

    log.info("Starting workflow integration execution", {
      integrationId,
      executionId,
      workflows: integration.workflows,
    });

    try {
      let result;

      switch (integration.communicationPattern) {
        case "sequential":
          result = await this.executeSequentialIntegration(
            integration,
            execution
          );
          break;
        case "parallel":
          result = await this.executeParallelIntegration(
            integration,
            execution
          );
          break;
        case "event-driven":
          result = await this.executeEventDrivenIntegration(
            integration,
            execution
          );
          break;
        case "pipeline":
          result = await this.executePipelineIntegration(
            integration,
            execution
          );
          break;
        case "scatter-gather":
          result = await this.executeScatterGatherIntegration(
            integration,
            execution
          );
          break;
        default:
          throw new Error(
            `Unknown communication pattern: ${integration.communicationPattern}`
          );
      }

      execution.status = "completed";
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      integration.status = "idle";

      log.info("Workflow integration completed successfully", {
        integrationId,
        executionId,
        duration: execution.duration,
      });

      return {
        success: true,
        executionId,
        data: result,
        duration: execution.duration,
        workflowResults: Object.fromEntries(execution.results),
      };
    } catch (error) {
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = error.message;
      integration.status = "error";

      log.error("Workflow integration failed", {
        integrationId,
        executionId,
        error: error.message,
      });

      // Attempt rollback if configured
      if (integration.rollbackStrategy !== "none") {
        await this.performRollback(integration, execution);
      }

      return {
        success: false,
        executionId,
        error: error.message,
        workflowResults: Object.fromEntries(execution.results),
        rollbackPerformed: execution.rollbackActions.length > 0,
      };
    }
  }

  /**
   * Execute sequential workflow integration
   * @private
   */
  async executeSequentialIntegration(integration, execution) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");
    let currentContext = { ...execution.context };
    const results = [];

    for (const workflowName of integration.workflows) {
      log.debug("Executing workflow in sequence", {
        integrationId: integration.id,
        workflow: workflowName,
      });

      const workflowResult = await workflowRegistry.execute(
        workflowName,
        currentContext,
        execution.options
      );

      execution.results.set(workflowName, workflowResult);
      results.push(workflowResult);

      if (
        !workflowResult.success &&
        integration.errorHandling === "fail-fast"
      ) {
        throw new Error(
          `Workflow '${workflowName}' failed: ${workflowResult.error?.message}`
        );
      }

      // Pass data to next workflow based on strategy
      currentContext = this.applyDataPassingStrategy(
        integration.dataPassingStrategy,
        currentContext,
        workflowResult.data || {}
      );

      // Record rollback action
      this.recordRollbackAction(execution, workflowName, workflowResult);
    }

    return this.aggregateResults(results, integration.dataPassingStrategy);
  }

  /**
   * Execute parallel workflow integration
   * @private
   */
  async executeParallelIntegration(integration, execution) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");

    log.debug("Executing workflows in parallel", {
      integrationId: integration.id,
      workflows: integration.workflows,
    });

    const workflowPromises = integration.workflows.map(async (workflowName) => {
      try {
        const workflowResult = await workflowRegistry.execute(
          workflowName,
          execution.context,
          execution.options
        );

        execution.results.set(workflowName, workflowResult);
        this.recordRollbackAction(execution, workflowName, workflowResult);

        return { workflowName, result: workflowResult };
      } catch (error) {
        const errorResult = {
          success: false,
          error: { message: error.message },
        };
        execution.results.set(workflowName, errorResult);
        return { workflowName, result: errorResult };
      }
    });

    const results = await Promise.allSettled(workflowPromises);
    const resolvedResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value.result
        : { success: false, error: { message: r.reason.message } }
    );

    // Check for failures
    const failures = resolvedResults.filter((r) => !r.success);
    if (failures.length > 0 && integration.errorHandling === "fail-fast") {
      throw new Error(
        `${failures.length} workflows failed in parallel execution`
      );
    }

    return this.aggregateResults(
      resolvedResults,
      integration.dataPassingStrategy
    );
  }

  /**
   * Execute event-driven workflow integration
   * @private
   */
  async executeEventDrivenIntegration(integration, execution) {
    const eventBus = this.getOrCreateEventBus(integration.id);
    const { workflowRegistry } = await import("../WorkflowRegistry.js");

    const results = [];
    const workflowPromises = [];

    // Set up event listeners for each workflow
    for (const workflowName of integration.workflows) {
      const promise = new Promise(async (resolve, reject) => {
        try {
          // Subscribe to events for this workflow
          const eventHandler = async (eventData) => {
            const workflowResult = await workflowRegistry.execute(
              workflowName,
              { ...execution.context, ...eventData },
              execution.options
            );

            execution.results.set(workflowName, workflowResult);
            this.recordRollbackAction(execution, workflowName, workflowResult);
            resolve(workflowResult);
          };

          eventBus.subscribe(`workflow.${workflowName}`, eventHandler);

          // Emit initial event to start the workflow
          eventBus.emit(`workflow.${workflowName}`, execution.context);
        } catch (error) {
          reject(error);
        }
      });

      workflowPromises.push(promise);
    }

    const workflowResults = await Promise.allSettled(workflowPromises);
    const resolvedResults = workflowResults.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { success: false, error: { message: r.reason.message } }
    );

    return this.aggregateResults(
      resolvedResults,
      integration.dataPassingStrategy
    );
  }

  /**
   * Execute pipeline workflow integration
   * @private
   */
  async executePipelineIntegration(integration, execution) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");
    let pipelineData = { ...execution.context };

    for (let i = 0; i < integration.workflows.length; i++) {
      const workflowName = integration.workflows[i];
      const isLastStage = i === integration.workflows.length - 1;

      log.debug("Executing pipeline stage", {
        integrationId: integration.id,
        stage: i + 1,
        workflow: workflowName,
        isLastStage,
      });

      const workflowResult = await workflowRegistry.execute(
        workflowName,
        pipelineData,
        execution.options
      );

      execution.results.set(workflowName, workflowResult);

      if (!workflowResult.success) {
        throw new Error(
          `Pipeline stage '${workflowName}' failed: ${workflowResult.error?.message}`
        );
      }

      // Transform data for next stage
      pipelineData = this.transformPipelineData(
        pipelineData,
        workflowResult.data || {}
      );
      this.recordRollbackAction(execution, workflowName, workflowResult);
    }

    return pipelineData;
  }

  /**
   * Execute scatter-gather workflow integration
   * @private
   */
  async executeScatterGatherIntegration(integration, execution) {
    const { workflowRegistry } = await import("../WorkflowRegistry.js");

    // Scatter phase - distribute work
    const scatterPromises = integration.workflows.map(async (workflowName) => {
      const scatteredContext = this.scatterContext(
        execution.context,
        workflowName
      );

      const workflowResult = await workflowRegistry.execute(
        workflowName,
        scatteredContext,
        execution.options
      );

      execution.results.set(workflowName, workflowResult);
      this.recordRollbackAction(execution, workflowName, workflowResult);

      return { workflowName, result: workflowResult };
    });

    const scatterResults = await Promise.allSettled(scatterPromises);
    const resolvedResults = scatterResults.map((r) =>
      r.status === "fulfilled"
        ? r.value.result
        : { success: false, error: { message: r.reason.message } }
    );

    // Gather phase - aggregate results
    return this.gatherResults(resolvedResults, integration);
  }

  /**
   * Apply data passing strategy
   * @private
   */
  applyDataPassingStrategy(strategy, currentContext, newData) {
    switch (strategy) {
      case "merge":
        return { ...currentContext, ...newData };
      case "replace":
        return newData;
      case "append":
        return {
          ...currentContext,
          results: [...(currentContext.results || []), newData],
        };
      case "selective":
        // Only pass specific fields based on rules
        const rules = this.dataPassingRules.get(strategy) || {};
        const selectedData = {};
        Object.keys(rules).forEach((key) => {
          if (newData[key] !== undefined) {
            selectedData[rules[key]] = newData[key];
          }
        });
        return { ...currentContext, ...selectedData };
      default:
        return { ...currentContext, ...newData };
    }
  }

  /**
   * Aggregate workflow results
   * @private
   */
  aggregateResults(results, strategy) {
    switch (strategy) {
      case "merge":
        return results.reduce(
          (acc, result) => ({
            ...acc,
            ...(result.data || {}),
          }),
          {}
        );
      case "array":
        return results.map((r) => r.data || {});
      case "object":
        return results.reduce(
          (acc, result, index) => ({
            ...acc,
            [`result_${index}`]: result.data || {},
          }),
          {}
        );
      default:
        return results.reduce(
          (acc, result) => ({
            ...acc,
            ...(result.data || {}),
          }),
          {}
        );
    }
  }

  /**
   * Transform pipeline data between stages
   * @private
   */
  transformPipelineData(currentData, stageResult) {
    // Default transformation - merge stage result
    return { ...currentData, ...stageResult };
  }

  /**
   * Scatter context for scatter-gather pattern
   * @private
   */
  scatterContext(context, workflowName) {
    // Default scattering - each workflow gets full context
    return { ...context, targetWorkflow: workflowName };
  }

  /**
   * Gather results from scatter-gather pattern
   * @private
   */
  gatherResults(results, integration) {
    return this.aggregateResults(results, integration.dataPassingStrategy);
  }

  /**
   * Record rollback action for later execution
   * @private
   */
  recordRollbackAction(execution, workflowName, workflowResult) {
    if (workflowResult.success && workflowResult.rollbackData) {
      execution.rollbackActions.push({
        workflowName,
        rollbackData: workflowResult.rollbackData,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Perform rollback operations
   * @private
   */
  async performRollback(integration, execution) {
    if (execution.rollbackActions.length === 0) {
      log.debug("No rollback actions to perform", {
        integrationId: integration.id,
        executionId: execution.id,
      });
      return;
    }

    log.info("Performing rollback operations", {
      integrationId: integration.id,
      executionId: execution.id,
      rollbackCount: execution.rollbackActions.length,
    });

    // Execute rollback actions in reverse order
    const rollbackPromises = execution.rollbackActions
      .reverse()
      .map(async (action) => {
        try {
          const rollbackHandler = this.rollbackHandlers.get(
            action.workflowName
          );
          if (rollbackHandler) {
            await rollbackHandler(action.rollbackData, execution.context);
            log.debug("Rollback action completed", {
              workflow: action.workflowName,
            });
          }
        } catch (error) {
          log.error("Rollback action failed", {
            workflow: action.workflowName,
            error: error.message,
          });
        }
      });

    await Promise.allSettled(rollbackPromises);
  }

  /**
   * Register rollback handler for a workflow
   * @param {string} workflowName - Workflow name
   * @param {Function} handler - Rollback handler function
   */
  registerRollbackHandler(workflowName, handler) {
    if (typeof handler !== "function") {
      throw new Error("Rollback handler must be a function");
    }

    this.rollbackHandlers.set(workflowName, handler);

    log.debug("Rollback handler registered", { workflowName });
  }

  /**
   * Create communication channel between workflows
   * @param {string} channelId - Channel identifier
   * @param {Object} config - Channel configuration
   */
  createCommunicationChannel(channelId, config = {}) {
    const channel = {
      id: channelId,
      type: config.type || "event-bus",
      subscribers: new Map(),
      messageHistory: [],
      maxHistorySize: config.maxHistorySize || 100,
      createdAt: new Date(),
    };

    this.communicationChannels.set(channelId, channel);

    log.debug("Communication channel created", {
      channelId,
      type: channel.type,
    });

    return channel;
  }

  /**
   * Send message through communication channel
   * @param {string} channelId - Channel identifier
   * @param {string} topic - Message topic
   * @param {Object} data - Message data
   */
  async sendMessage(channelId, topic, data) {
    const channel = this.communicationChannels.get(channelId);
    if (!channel) {
      throw new Error(`Communication channel '${channelId}' not found`);
    }

    const message = {
      id: this.generateMessageId(),
      topic,
      data,
      timestamp: new Date(),
      channelId,
    };

    // Add to history
    channel.messageHistory.push(message);
    if (channel.messageHistory.length > channel.maxHistorySize) {
      channel.messageHistory.shift();
    }

    // Notify subscribers
    const subscribers = channel.subscribers.get(topic) || [];
    const notificationPromises = subscribers.map(async (subscriber) => {
      try {
        await subscriber.handler(message);
      } catch (error) {
        log.error("Message subscriber failed", {
          channelId,
          topic,
          subscriber: subscriber.id,
          error: error.message,
        });
      }
    });

    await Promise.allSettled(notificationPromises);

    log.debug("Message sent", {
      channelId,
      topic,
      messageId: message.id,
      subscriberCount: subscribers.length,
    });

    return message;
  }

  /**
   * Subscribe to messages on a communication channel
   * @param {string} channelId - Channel identifier
   * @param {string} topic - Message topic
   * @param {Function} handler - Message handler
   */
  subscribe(channelId, topic, handler) {
    const channel = this.communicationChannels.get(channelId);
    if (!channel) {
      throw new Error(`Communication channel '${channelId}' not found`);
    }

    const subscriberId = this.generateSubscriberId();
    const subscriber = {
      id: subscriberId,
      handler,
      subscribedAt: new Date(),
    };

    if (!channel.subscribers.has(topic)) {
      channel.subscribers.set(topic, []);
    }
    channel.subscribers.get(topic).push(subscriber);

    log.debug("Subscribed to channel", {
      channelId,
      topic,
      subscriberId,
    });

    return subscriberId;
  }

  /**
   * Create synchronization point for workflow coordination
   * @param {string} syncId - Synchronization point identifier
   * @param {Object} config - Synchronization configuration
   */
  createSynchronizationPoint(syncId, config = {}) {
    const syncPoint = {
      id: syncId,
      type: config.type || "barrier",
      expectedParticipants: config.expectedParticipants || [],
      arrivedParticipants: new Set(),
      waitingPromises: new Map(),
      timeout: config.timeout || 30000,
      createdAt: new Date(),
      status: "waiting",
    };

    this.synchronizationPoints.set(syncId, syncPoint);

    log.debug("Synchronization point created", {
      syncId,
      type: syncPoint.type,
      expectedParticipants: syncPoint.expectedParticipants,
    });

    return syncPoint;
  }

  /**
   * Wait at synchronization point
   * @param {string} syncId - Synchronization point identifier
   * @param {string} participantId - Participant identifier
   */
  async waitAtSynchronizationPoint(syncId, participantId) {
    const syncPoint = this.synchronizationPoints.get(syncId);
    if (!syncPoint) {
      throw new Error(`Synchronization point '${syncId}' not found`);
    }

    syncPoint.arrivedParticipants.add(participantId);

    log.debug("Participant arrived at sync point", {
      syncId,
      participantId,
      arrivedCount: syncPoint.arrivedParticipants.size,
      expectedCount: syncPoint.expectedParticipants.length,
    });

    // Check if all participants have arrived
    const allArrived = syncPoint.expectedParticipants.every((p) =>
      syncPoint.arrivedParticipants.has(p)
    );

    if (allArrived) {
      // Release all waiting participants
      syncPoint.status = "released";
      const waitingPromises = Array.from(syncPoint.waitingPromises.values());
      syncPoint.waitingPromises.clear();

      waitingPromises.forEach((resolve) => resolve());

      log.info("Synchronization point released", {
        syncId,
        participantCount: syncPoint.arrivedParticipants.size,
      });

      return;
    }

    // Wait for other participants
    return new Promise((resolve, reject) => {
      syncPoint.waitingPromises.set(participantId, resolve);

      // Set timeout
      setTimeout(() => {
        if (syncPoint.waitingPromises.has(participantId)) {
          syncPoint.waitingPromises.delete(participantId);
          reject(
            new Error(
              `Synchronization timeout for participant '${participantId}'`
            )
          );
        }
      }, syncPoint.timeout);
    });
  }

  /**
   * Get or create event bus for integration
   * @private
   */
  getOrCreateEventBus(integrationId) {
    // Simple event bus implementation
    const eventBus = {
      listeners: new Map(),

      subscribe(event, handler) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
      },

      emit(event, data) {
        const handlers = this.listeners.get(event) || [];
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            log.error("Event handler failed", { event, error: error.message });
          }
        });
      },
    };

    return eventBus;
  }

  /**
   * Generate unique execution ID
   * @private
   */
  generateExecutionId(integrationId) {
    return `${integrationId}_exec_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   * @private
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscriber ID
   * @private
   */
  generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get integration status
   * @param {string} integrationId - Integration identifier
   */
  getIntegrationStatus(integrationId) {
    const integration = this.activeIntegrations.get(integrationId);
    if (!integration) {
      return null;
    }

    return {
      id: integration.id,
      status: integration.status,
      workflows: integration.workflows,
      executionCount: integration.executions.length,
      lastExecution:
        integration.executions[integration.executions.length - 1] || null,
      createdAt: integration.createdAt,
    };
  }

  /**
   * List all active integrations
   */
  listIntegrations() {
    return Array.from(this.activeIntegrations.values()).map((integration) => ({
      id: integration.id,
      status: integration.status,
      workflows: integration.workflows,
      communicationPattern: integration.communicationPattern,
      executionCount: integration.executions.length,
    }));
  }

  /**
   * Cleanup integration resources
   * @param {string} integrationId - Integration identifier
   */
  async cleanupIntegration(integrationId) {
    const integration = this.activeIntegrations.get(integrationId);
    if (!integration) {
      return false;
    }

    // Cleanup communication channels
    this.communicationChannels.delete(integrationId);

    // Cleanup synchronization points
    Array.from(this.synchronizationPoints.keys())
      .filter((key) => key.startsWith(integrationId))
      .forEach((key) => this.synchronizationPoints.delete(key));

    // Remove integration
    this.activeIntegrations.delete(integrationId);

    log.info("Integration cleaned up", { integrationId });
    return true;
  }
}

// Export singleton instance
export const workflowIntegrator = new WorkflowIntegrator();
export default workflowIntegrator;
