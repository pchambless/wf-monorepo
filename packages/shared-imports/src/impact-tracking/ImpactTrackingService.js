/**
 * Impact Tracking Service - Orchestrates impact detection and plan association
 * This service combines the ImpactProcessor and PlanContextAnalyzer to create
 * complete impact records with plan association
 */

import { ImpactProcessor } from "./ImpactProcessor.js";
import { PlanContextAnalyzer } from "./PlanContextAnalyzer.js";
import { CrossAppAnalyzer } from "./CrossAppAnalyzer.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ImpactTrackingService");

/**
 * Main service that orchestrates impact tracking with plan context
 */
export class ImpactTrackingService {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled !== false,
      batchTimeoutMs: config.batchTimeoutMs || 5000,
      maxBatchSize: config.maxBatchSize || 50,
      ...config,
    };

    this.impactProcessor = new ImpactProcessor(config);
    this.planContextAnalyzer = new PlanContextAnalyzer(config);
    this.crossAppAnalyzer = new CrossAppAnalyzer(config);

    this.pendingImpacts = [];
    this.batchTimer = null;
    this.currentBatchId = null;
  }

  /**
   * Process a file change and create impact records with plan association
   * @param {FileChangeEvent} event - The file change event
   * @returns {Promise<ImpactRecord[]>} Complete impact records with plan context
   */
  async processFileChangeWithContext(event) {
    try {
      if (!this.config.enabled) {
        logger.debug("Impact tracking is disabled");
        return [];
      }

      logger.debug(
        `Processing file change with context: ${event.type} ${event.filePath}`
      );

      // Process the file change to get basic impact records
      const basicImpacts = await this.impactProcessor.processFileChange(event);

      if (basicImpacts.length === 0) {
        return [];
      }

      // Get plan context - try file-specific context first, then general context
      let planContext = await this.planContextAnalyzer.extractPlanFromPath(
        event.filePath
      );
      if (!planContext) {
        planContext = await this.planContextAnalyzer.getCurrentPlanContext();
      }

      // Analyze cross-app impacts
      const crossAppImpacts = await this.crossAppAnalyzer.analyzeFileImpacts(
        event.filePath,
        event.type
      );

      // Enhance impact records with plan context and cross-app analysis
      const enhancedImpacts = basicImpacts.map((impact) => ({
        ...impact,
        planId: planContext?.planId || null,
        planContext: planContext
          ? {
              planName: planContext.planName,
              source: planContext.source,
              confidence: planContext.confidence,
            }
          : null,
        crossAppAnalysis: {
          impacts: crossAppImpacts,
          totalAppsAffected: crossAppImpacts.length,
          highSeverityCount: crossAppImpacts.filter(
            (i) => i.severity === "high"
          ).length,
          analysisTimestamp: new Date(),
        },
      }));

      logger.info(`Created ${enhancedImpacts.length} impact records`, {
        filePath: event.filePath,
        planId: planContext?.planId,
        planSource: planContext?.source,
      });

      return enhancedImpacts;
    } catch (error) {
      logger.error(
        `Error processing file change with context for ${event.filePath}:`,
        error
      );
      return [];
    }
  }

  /**
   * Add impact to batch for grouped processing
   * @param {ImpactRecord} impact - Impact record to add to batch
   */
  addToBatch(impact) {
    if (!this.currentBatchId) {
      this.currentBatchId = this.generateBatchId();
    }

    // Add batch ID to impact
    impact.batchId = this.currentBatchId;
    this.pendingImpacts.push(impact);

    logger.debug(`Added impact to batch ${this.currentBatchId}`, {
      filePath: impact.filePath,
      batchSize: this.pendingImpacts.length,
    });

    // Start or reset batch timer
    this.resetBatchTimer();

    // Process immediately if batch is full
    if (this.pendingImpacts.length >= this.config.maxBatchSize) {
      this.processBatch();
    }
  }

  /**
   * Process the current batch of impacts
   * @returns {Promise<ImpactRecord[]>} The processed batch
   */
  async processBatch() {
    if (this.pendingImpacts.length === 0) {
      return [];
    }

    const batch = [...this.pendingImpacts];
    const batchId = this.currentBatchId;

    // Clear current batch
    this.pendingImpacts = [];
    this.currentBatchId = null;
    this.clearBatchTimer();

    logger.info(`Processing batch ${batchId} with ${batch.length} impacts`);

    try {
      // Here you would typically save to database
      // For now, we'll just log and return the batch
      await this.saveBatchToDatabase(batch);

      logger.info(`Successfully processed batch ${batchId}`);
      return batch;
    } catch (error) {
      logger.error(`Error processing batch ${batchId}:`, error);

      // Re-queue the batch for retry (simplified retry logic)
      this.pendingImpacts.unshift(...batch);
      this.currentBatchId = batchId;

      throw error;
    }
  }

  /**
   * Save a batch of impacts to the database
   * @param {ImpactRecord[]} impacts - Impacts to save
   * @returns {Promise<void>}
   */
  async saveBatchToDatabase(impacts) {
    // This would integrate with your database layer
    // For now, just simulate the operation
    logger.debug(`Saving ${impacts.length} impacts to database`);

    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In real implementation, this would:
    // 1. Insert into api_wf.plan_impacts table
    // 2. Handle any database errors
    // 3. Return the inserted records with IDs
  }

  /**
   * Generate a unique batch ID
   * @returns {string} Unique batch identifier
   */
  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset the batch timer
   */
  resetBatchTimer() {
    this.clearBatchTimer();

    this.batchTimer = setTimeout(() => {
      logger.debug("Batch timer expired, processing batch");
      this.processBatch();
    }, this.config.batchTimeoutMs);
  }

  /**
   * Clear the batch timer
   */
  clearBatchTimer() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Process a file change and add to batch
   * @param {FileChangeEvent} event - File change event
   * @returns {Promise<void>}
   */
  async trackFileChange(event) {
    try {
      const impacts = await this.processFileChangeWithContext(event);

      for (const impact of impacts) {
        this.addToBatch(impact);
      }
    } catch (error) {
      logger.error(`Error tracking file change for ${event.filePath}:`, error);
    }
  }

  /**
   * Flush any pending impacts immediately
   * @returns {Promise<ImpactRecord[]>}
   */
  async flush() {
    return await this.processBatch();
  }

  /**
   * Get current batch status
   * @returns {Object} Batch status information
   */
  getBatchStatus() {
    return {
      pendingCount: this.pendingImpacts.length,
      currentBatchId: this.currentBatchId,
      timerActive: this.batchTimer !== null,
    };
  }

  /**
   * Enable or disable impact tracking
   * @param {boolean} enabled - Whether to enable tracking
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    logger.info(`Impact tracking ${enabled ? "enabled" : "disabled"}`);

    if (!enabled && this.pendingImpacts.length > 0) {
      // Flush pending impacts when disabling
      this.flush();
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clearBatchTimer();
    this.pendingImpacts = [];
    this.currentBatchId = null;
  }
}

export default ImpactTrackingService;
