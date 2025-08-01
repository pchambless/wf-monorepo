/**
 * Impact Tracker
 *
 * Automatic impact tracking with proper categorization
 * Handles file changes and plan activities with phase management
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ImpactTracker");

class ImpactTracker {
  constructor() {
    this.validTypes = [
      "CREATE",
      "MODIFY",
      "DELETE",
      "ANALYZE",
      "DISCOVER",
      "COMMUNICATE",
      "PLAN",
    ];
    this.validPhases = ["idea", "development", "adhoc"];
    this.impactHistory = [];
    this.categoryPatterns = this.initializeCategoryPatterns();
  }

  /**
   * Record an impact with automatic categorization
   * @param {Object} impactData - Impact data
   * @returns {Promise<Object>} Recording result
   */
  async recordImpact({
    planId,
    type,
    description,
    phase,
    userID,
    file = null,
    packageName = null,
    metadata = {},
  }) {
    try {
      log.debug("Recording impact", { planId, type, phase, file });

      // Validate and normalize input
      const normalizedImpact = {
        plan_id: planId,
        type: this.validateImpactType(type),
        description: description || this.generateDescription(type, file),
        phase: this.validatePhase(phase),
        file,
        package: packageName || this.extractPackageName(file),
        status: "completed",
        created_by: userID,
        created_at: new Date().toISOString(),
        metadata: JSON.stringify(metadata),
      };

      // Store in database
      const { execDml } = await import("@whatsfresh/shared-imports/api");

      const dmlData = {
        table: "api_wf.plan_impacts",
        method: "INSERT",
        data: normalizedImpact,
      };

      const result = await execDml("INSERT", dmlData);

      if (result && result.success) {
        // Record in history for analytics
        this.recordImpactHistory(normalizedImpact, result.insertId);

        // Trigger context refresh for impact tracking components
        await this.triggerContextRefresh({ impactId: result.insertId, planId });

        log.info("Impact recorded successfully", {
          impactId: result.insertId,
          planId,
          type: normalizedImpact.type,
        });

        return {
          success: true,
          impactId: result.insertId,
          impact: normalizedImpact,
        };
      } else {
        throw new Error(result?.error || "Database insert failed");
      }
    } catch (error) {
      log.error("Impact tracking failed", {
        planId,
        type,
        error: error.message,
      });

      // Don't fail the main workflow if impact tracking fails
      return {
        success: false,
        error: error.message,
        impact: null,
      };
    }
  }

  /**
   * Automatically categorize and record file changes
   * @param {string} filePath - Path of the changed file
   * @param {string} changeType - Type of change (create, modify, delete)
   * @param {string} planId - Plan ID
   * @param {string} userID - User ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Recording result
   */
  async categorizeFileChange(
    filePath,
    changeType,
    planId,
    userID,
    metadata = {}
  ) {
    const categorization = this.categorizeFile(filePath, changeType);

    return await this.recordImpact({
      planId,
      type: categorization.type,
      description: categorization.description,
      phase: categorization.phase,
      userID,
      file: filePath,
      package: this.extractPackageName(filePath),
      metadata: {
        ...metadata,
        changeType,
        autoCategorizationReason: categorization.reason,
      },
    });
  }

  /**
   * Categorize a file based on its path and change type
   * @param {string} filePath - File path
   * @param {string} changeType - Change type
   * @returns {Object} Categorization result
   */
  categorizeFile(filePath, changeType) {
    if (!filePath) {
      return {
        type: changeType.toUpperCase(),
        phase: "development",
        description: `${changeType} file`,
        reason: "no_file_path",
      };
    }

    const normalizedPath = filePath.toLowerCase();

    // Check against category patterns
    for (const [category, config] of Object.entries(this.categoryPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(normalizedPath)) {
          return {
            type: config.type || changeType.toUpperCase(),
            phase: config.phase || "development",
            description: config.descriptionTemplate
              .replace("{changeType}", changeType)
              .replace("{fileName}", this.getFileName(filePath))
              .replace("{filePath}", filePath),
            reason: `matched_pattern_${category}`,
          };
        }
      }
    }

    // Default categorization
    return {
      type: changeType.toUpperCase(),
      phase: "development",
      description: `${changeType} ${this.getFileName(filePath)}`,
      reason: "default_categorization",
    };
  }

  /**
   * Initialize file categorization patterns
   * @returns {Object} Category patterns
   * @private
   */
  initializeCategoryPatterns() {
    return {
      specifications: {
        patterns: [
          /\/specs?\//,
          /\/requirements?\//,
          /\.md$/,
          /readme/,
          /\.kiro\/.*\/specs\//,
        ],
        type: "PLAN",
        phase: "idea",
        descriptionTemplate: "{changeType} specification: {fileName}",
      },

      tests: {
        patterns: [
          /\/test\//,
          /\/tests\//,
          /\/__tests__\//,
          /\.test\./,
          /\.spec\./,
          /test.*\.js$/,
          /spec.*\.js$/,
        ],
        type: "CREATE",
        phase: "development",
        descriptionTemplate: "{changeType} test file: {fileName}",
      },

      documentation: {
        patterns: [
          /\/docs?\//,
          /\/documentation\//,
          /readme/,
          /changelog/,
          /\.md$/,
          /\.txt$/,
        ],
        type: "COMMUNICATE",
        phase: "development",
        descriptionTemplate: "{changeType} documentation: {fileName}",
      },

      configuration: {
        patterns: [
          /config/,
          /\.json$/,
          /\.yaml$/,
          /\.yml$/,
          /\.env/,
          /package\.json$/,
          /\.config\./,
        ],
        type: "MODIFY",
        phase: "development",
        descriptionTemplate: "{changeType} configuration: {fileName}",
      },

      components: {
        patterns: [/\/components?\//, /\.jsx$/, /\.tsx$/, /\.vue$/],
        type: "MODIFY",
        phase: "development",
        descriptionTemplate: "{changeType} component: {fileName}",
      },

      workflows: {
        patterns: [/\/workflows?\//, /\/architecture\/workflows\//],
        type: "MODIFY",
        phase: "development",
        descriptionTemplate: "{changeType} workflow: {fileName}",
      },

      database: {
        patterns: [/\.sql$/, /migration/, /schema/, /database/],
        type: "MODIFY",
        phase: "development",
        descriptionTemplate: "{changeType} database file: {fileName}",
      },
    };
  }

  /**
   * Validate impact type
   * @param {string} type - Impact type
   * @returns {string} Validated type
   */
  validateImpactType(type) {
    const upperType = type?.toUpperCase();
    return this.validTypes.includes(upperType) ? upperType : "MODIFY";
  }

  /**
   * Validate phase
   * @param {string} phase - Phase
   * @returns {string} Validated phase
   */
  validatePhase(phase) {
    return this.validPhases.includes(phase) ? phase : "development";
  }

  /**
   * Extract package name from file path
   * @param {string} filePath - File path
   * @returns {string|null} Package name
   */
  extractPackageName(filePath) {
    if (!filePath) return null;

    const match = filePath.match(/packages\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get file name from path
   * @param {string} filePath - File path
   * @returns {string} File name
   */
  getFileName(filePath) {
    if (!filePath) return "";
    return filePath.split("/").pop() || filePath;
  }

  /**
   * Generate description for impact
   * @param {string} type - Impact type
   * @param {string} file - File path
   * @returns {string} Generated description
   */
  generateDescription(type, file) {
    if (file) {
      return `${type.toLowerCase()} ${this.getFileName(file)}`;
    }
    return `${type.toLowerCase()} operation`;
  }

  /**
   * Trigger context refresh for impact tracking
   * @param {Object} data - Refresh data
   * @private
   */
  async triggerContextRefresh(data) {
    try {
      const { contextIntegrator } = await import("../ContextIntegrator.js");
      await contextIntegrator.refresh(["impactTracking"], data);
    } catch (error) {
      log.error("Context refresh failed", { error: error.message });
      // Don't fail impact tracking if context refresh fails
    }
  }

  /**
   * Record impact in history for analytics
   * @param {Object} impact - Impact data
   * @param {string} impactId - Impact ID
   * @private
   */
  recordImpactHistory(impact, impactId) {
    this.impactHistory.push({
      impactId,
      ...impact,
      recordedAt: new Date().toISOString(),
    });

    // Keep only last 1000 impacts to prevent memory issues
    if (this.impactHistory.length > 1000) {
      this.impactHistory = this.impactHistory.slice(-1000);
    }
  }

  /**
   * Get impact statistics
   * @param {string} planId - Optional plan ID filter
   * @returns {Object} Impact statistics
   */
  getImpactStats(planId = null) {
    const filteredHistory = planId
      ? this.impactHistory.filter((h) => h.plan_id === planId)
      : this.impactHistory;

    const totalImpacts = filteredHistory.length;
    const typeBreakdown = {};
    const phaseBreakdown = {};

    filteredHistory.forEach((impact) => {
      typeBreakdown[impact.type] = (typeBreakdown[impact.type] || 0) + 1;
      phaseBreakdown[impact.phase] = (phaseBreakdown[impact.phase] || 0) + 1;
    });

    return {
      totalImpacts,
      typeBreakdown,
      phaseBreakdown,
      recentImpacts: filteredHistory.slice(-10), // Last 10 impacts
    };
  }

  /**
   * Add custom categorization pattern
   * @param {string} category - Category name
   * @param {Object} config - Category configuration
   */
  addCategoryPattern(category, config) {
    if (!config.patterns || !Array.isArray(config.patterns)) {
      throw new Error("Category config must have patterns array");
    }

    this.categoryPatterns[category] = {
      patterns: config.patterns.map((p) => new RegExp(p, "i")),
      type: config.type || "MODIFY",
      phase: config.phase || "development",
      descriptionTemplate:
        config.descriptionTemplate || "{changeType} {fileName}",
    };

    log.debug("Custom category pattern added", { category });
  }

  /**
   * Clear impact history (mainly for testing)
   */
  clearHistory() {
    this.impactHistory = [];
    log.debug("Impact history cleared");
  }
}

// Create singleton instance
export const impactTracker = new ImpactTracker();

// Export class for testing
export { ImpactTracker };

export default impactTracker;
