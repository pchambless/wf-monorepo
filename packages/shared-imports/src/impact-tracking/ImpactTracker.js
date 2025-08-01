/**
 * ImpactTracker - Main orchestrator for automatic impact tracking
 *
 * Coordinates impact detection and recording for file modifications
 * Part of automatic impact tracking system
 */

import { PlanResolver } from "./PlanResolver.js";
import { ImpactGenerator } from "./ImpactGenerator.js";
import { DatabaseWriter } from "./DatabaseWriter.js";
import { ImpactTrackingConfig } from "./config/ImpactTrackingConfig.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ImpactTracker");

export class ImpactTracker {
  constructor(options = {}) {
    this.enabled = options.enabled ?? ImpactTrackingConfig.enabled;
    this.planResolver = new PlanResolver();
    this.impactGenerator = new ImpactGenerator();
    this.databaseWriter = new DatabaseWriter();
    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];

    log.debug("ImpactTracker initialized", { enabled: this.enabled });
  }

  /**
   * Main entry point for tracking file changes
   * @param {string} filePath - Path to the file that changed
   * @param {string} changeType - Type of change (CREATE, MODIFY, DELETE)
   * @param {object} context - Additional context for the change
   */
  async trackFileChange(filePath, changeType, context = {}) {
    if (!this.enabled) {
      log.debug("Impact tracking disabled, skipping", { filePath, changeType });
      return;
    }

    // Check if file should be excluded
    if (this.shouldExcludeFile(filePath)) {
      log.debug("File excluded from tracking", { filePath });
      return;
    }

    try {
      log.debug("Tracking file change", { filePath, changeType, context });

      const planId = await this.planResolver.resolvePlan(context);
      const description = this.impactGenerator.generateDescription(
        filePath,
        changeType,
        context,
        this.batchDescription
      );

      const impact = {
        plan_id: planId,
        file_path: filePath,
        change_type: changeType,
        description: description,
        status: "completed",
        userID: context.userID || "kiro",
      };

      log.debug("Generated impact record", impact);

      if (this.batchMode) {
        this.pendingImpacts.push(impact);
        log.debug("Added impact to batch", {
          batchSize: this.pendingImpacts.length,
        });
      } else {
        await this.databaseWriter.writeImpact(impact);
        log.info("Impact recorded successfully", {
          filePath,
          planId,
          changeType,
        });
      }
    } catch (error) {
      log.warn("Impact tracking failed", {
        filePath,
        changeType,
        error: error.message,
        stack: error.stack,
      });
      // Don't throw - file operations should continue
    }
  }

  /**
   * Start batch mode for grouping related changes
   * @param {string} description - Common description for all changes in batch
   */
  startBatch(description) {
    this.batchMode = true;
    this.batchDescription = description;
    this.pendingImpacts = [];
    log.info("Started batch mode", { description });
  }

  /**
   * Commit all pending impacts in batch
   */
  async commitBatch() {
    if (this.pendingImpacts.length === 0) {
      log.debug("No pending impacts to commit");
      this.batchMode = false;
      this.batchDescription = null;
      return;
    }

    try {
      log.info("Committing batch impacts", {
        count: this.pendingImpacts.length,
      });
      await this.databaseWriter.writeBatchImpacts(this.pendingImpacts);
      log.info("Batch committed successfully", {
        count: this.pendingImpacts.length,
      });
    } catch (error) {
      log.error("Batch commit failed", {
        count: this.pendingImpacts.length,
        error: error.message,
      });
      throw error;
    } finally {
      this.batchMode = false;
      this.batchDescription = null;
      this.pendingImpacts = [];
    }
  }

  /**
   * Cancel batch mode without committing
   */
  cancelBatch() {
    log.info("Cancelled batch mode", {
      pendingCount: this.pendingImpacts.length,
    });
    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];
  }

  /**
   * Check if file should be excluded from tracking
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file should be excluded
   */
  shouldExcludeFile(filePath) {
    // Check exclude patterns
    for (const pattern of ImpactTrackingConfig.excludePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return true;
      }
    }

    // Check include patterns (if any are specified)
    if (ImpactTrackingConfig.includePatterns.length > 0) {
      let included = false;
      for (const pattern of ImpactTrackingConfig.includePatterns) {
        if (this.matchesPattern(filePath, pattern)) {
          included = true;
          break;
        }
      }
      if (!included) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple glob pattern matching
   * @param {string} filePath - File path to test
   * @param {string} pattern - Glob pattern
   * @returns {boolean} True if pattern matches
   */
  matchesPattern(filePath, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, ".*") // ** matches any path
      .replace(/\*/g, "[^/]*") // * matches any filename chars
      .replace(/\./g, "\\."); // Escape dots

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Enable impact tracking
   */
  enable() {
    this.enabled = true;
    log.info("Impact tracking enabled");
  }

  /**
   * Disable impact tracking
   */
  disable() {
    this.enabled = false;
    log.info("Impact tracking disabled");
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      batchMode: this.batchMode,
      pendingImpacts: this.pendingImpacts.length,
      batchDescription: this.batchDescription,
    };
  }
}

// Create singleton instance
export const impactTracker = new ImpactTracker();
