/**
 * Impact Tracker - Main Orchestrator
 *
 * Coordinates automatic impact tracking for file changes
 * Part of automatic-impact-tracking spec
 */

import PlanResolver from "./PlanResolver.server.js";
import ImpactGenerator from "./ImpactGenerator.server.js";
import DatabaseWriter from "./DatabaseWriter.js";
import { configManager } from "./config.js";
// Simple glob pattern matching (avoiding external dependency)
const minimatch = (filePath, pattern) => {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, ".*") // ** matches any number of directories
    .replace(/\*/g, "[^/]*") // * matches anything except directory separator
    .replace(/\?/g, ".") // ? matches single character
    .replace(/\./g, "\\."); // Escape dots

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
};

class ImpactTracker {
  constructor(options = {}) {
    this.enabled = options.enabled ?? configManager.get("enabled");
    this.planResolver = new PlanResolver();
    this.impactGenerator = new ImpactGenerator();
    this.databaseWriter = new DatabaseWriter();

    // Batch mode properties
    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];

    // Debouncing for rapid changes
    this.debounceTimers = new Map();
    this.debounceTimeout = configManager.get("debounceTimeout");

    // Statistics
    this.stats = {
      totalTracked: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      batched: 0,
    };
  }

  /**
   * Main entry point for tracking file changes
   */
  async trackFileChange(filePath, changeType, context = {}) {
    if (!this.enabled || !configManager.isEnabled()) {
      this.stats.skipped++;
      return {
        success: true,
        message: "Impact tracking disabled",
        skipped: true,
      };
    }

    try {
      // Validate inputs
      if (!filePath || !changeType) {
        throw new Error("filePath and changeType are required");
      }

      // Check if file should be tracked
      if (!this.shouldTrackFile(filePath)) {
        this.stats.skipped++;
        return {
          success: true,
          message: "File excluded from tracking",
          skipped: true,
        };
      }

      // Sanitize file path
      const sanitizedPath = this.sanitizeFilePath(filePath);

      // Handle debouncing for rapid changes
      if (this.debounceTimeout > 0) {
        return await this.handleDebouncedChange(
          sanitizedPath,
          changeType,
          context
        );
      }

      // Process immediately
      return await this.processFileChange(sanitizedPath, changeType, context);
    } catch (error) {
      this.stats.failed++;
      console.warn("Impact tracking failed:", error.message);

      // Log error but don't throw - file operations should continue
      await this.logError(error, { filePath, changeType, context });

      return {
        success: false,
        message: `Impact tracking failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Process file change with debouncing
   */
  async handleDebouncedChange(filePath, changeType, context) {
    const debounceKey = `${filePath}:${changeType}`;

    // Clear existing timer for this file/change type
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey));
    }

    // Set new timer
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(debounceKey);
        const result = await this.processFileChange(
          filePath,
          changeType,
          context
        );
        resolve(result);
      }, this.debounceTimeout);

      this.debounceTimers.set(debounceKey, timer);
    });
  }

  /**
   * Process individual file change
   */
  async processFileChange(filePath, changeType, context) {
    this.stats.totalTracked++;

    try {
      // Resolve plan ID
      const planId = await this.planResolver.resolvePlan(context);

      // Generate description
      const description = this.impactGenerator.generateDescription(
        filePath,
        changeType,
        context,
        this.batchDescription
      );

      // Create impact record
      const impact = {
        plan_id: planId,
        file_path: filePath,
        change_type: changeType,
        description: description,
        status: configManager.get("defaultStatus"),
        userID: context.userID || configManager.get("defaultUserId"),
      };

      // Validate impact record
      this.databaseWriter.validateImpact(impact);

      if (this.batchMode) {
        // Add to batch queue
        this.pendingImpacts.push(impact);
        this.stats.batched++;

        return {
          success: true,
          message: `Impact queued for batch processing (${this.pendingImpacts.length} pending)`,
          batched: true,
          impact: impact,
        };
      } else {
        // Write immediately
        const result = await this.databaseWriter.writeImpact(impact);

        if (result.success) {
          this.stats.successful++;
        } else {
          this.stats.failed++;
        }

        return {
          ...result,
          impact: impact,
        };
      }
    } catch (error) {
      this.stats.failed++;
      throw error;
    }
  }

  /**
   * Start batch mode for grouping related changes
   */
  startBatch(description) {
    this.batchMode = true;
    this.batchDescription = description;
    this.pendingImpacts = [];

    console.log(`Started impact tracking batch: ${description}`);

    return {
      success: true,
      message: `Batch mode started: ${description}`,
      batchDescription: description,
    };
  }

  /**
   * Commit all pending impacts in batch
   */
  async commitBatch() {
    if (!this.batchMode) {
      return { success: false, message: "Not in batch mode" };
    }

    try {
      const impactCount = this.pendingImpacts.length;

      if (impactCount === 0) {
        this.batchMode = false;
        this.batchDescription = null;
        return { success: true, message: "No impacts to commit" };
      }

      // Write batch to database
      const result = await this.databaseWriter.writeBatchImpacts(
        this.pendingImpacts
      );

      if (result.success) {
        this.stats.successful += impactCount;
        console.log(
          `Committed ${impactCount} impacts in batch: ${this.batchDescription}`
        );
      } else {
        this.stats.failed += impactCount;
      }

      // Reset batch state
      this.batchMode = false;
      this.batchDescription = null;
      this.pendingImpacts = [];

      return {
        ...result,
        impactCount: impactCount,
        batchDescription: this.batchDescription,
      };
    } catch (error) {
      this.stats.failed += this.pendingImpacts.length;

      // Reset batch state even on error
      this.batchMode = false;
      this.batchDescription = null;
      this.pendingImpacts = [];

      throw error;
    }
  }

  /**
   * Cancel current batch without committing
   */
  cancelBatch() {
    const impactCount = this.pendingImpacts.length;

    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];

    console.log(
      `Cancelled impact tracking batch (${impactCount} impacts discarded)`
    );

    return {
      success: true,
      message: `Batch cancelled (${impactCount} impacts discarded)`,
      discardedCount: impactCount,
    };
  }

  /**
   * Check if file should be tracked based on include/exclude patterns
   */
  shouldTrackFile(filePath) {
    const excludePatterns = configManager.get("excludePatterns");
    const includePatterns = configManager.get("includePatterns");

    // Check exclude patterns first
    for (const pattern of excludePatterns) {
      if (minimatch(filePath, pattern)) {
        return false;
      }
    }

    // Check include patterns
    if (includePatterns.length === 0) {
      return true; // No include patterns means include all (except excluded)
    }

    for (const pattern of includePatterns) {
      if (minimatch(filePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sanitize file path for consistent storage
   */
  sanitizeFilePath(filePath) {
    return this.databaseWriter.sanitizeFilePath(filePath);
  }

  /**
   * Enable/disable impact tracking
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    configManager.setEnabled(enabled);

    console.log(`Impact tracking ${enabled ? "enabled" : "disabled"}`);

    return {
      success: true,
      message: `Impact tracking ${enabled ? "enabled" : "disabled"}`,
      enabled: enabled,
    };
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      enabled: this.enabled && configManager.isEnabled(),
      batchMode: this.batchMode,
      pendingImpacts: this.pendingImpacts.length,
      batchDescription: this.batchDescription,
      debounceTimers: this.debounceTimers.size,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalTracked: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      batched: 0,
    };

    return { success: true, message: "Statistics reset" };
  }

  /**
   * Log error for debugging
   */
  async logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context,
      stats: this.stats,
    };

    // In a real implementation, this would write to a log file
    console.error("Impact tracking error:", logEntry);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Clear plan resolver cache
    this.planResolver.clearCache();

    console.log("Impact tracker cleanup completed");
  }
}

export default ImpactTracker;
