/**
 * Impact Tracking Configuration
 *
 * Centralized configuration for automatic impact tracking system
 * Part of automatic-impact-tracking spec
 */

const ImpactTrackingConfig = {
  // Core settings
  enabled: true,
  batchMode: false, // Default to individual impacts, not batch
  autoAssociate: true,
  promptForPlan: false,

  // File filtering patterns
  excludePatterns: [
    "node_modules/**",
    ".git/**",
    "*.log",
    "temp/**",
    "**/*.test.js",
    "**/*.test.jsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.js",
    "**/*.spec.jsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/test/**",
    "**/tests/**",
    "**/__tests__/**",
    "**/cypress/**",
    "**/jest/**",
    "**/tasks.md",
    "**/.kiro/specs/*/tasks.md",
  ],

  includePatterns: [
    "packages/**/*.js",
    "packages/**/*.jsx",
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "*.md",
    "*.json",
  ],

  // Performance settings
  debounceTimeout: 1000, // ms to wait before processing rapid changes
  batchSize: 50, // max impacts per batch operation
  retryAttempts: 3, // database retry attempts

  // Default values
  defaultPlanId: 0, // for unassociated impacts
  defaultUserId: "kiro",
  defaultStatus: "completed",
};

/**
 * Configuration manager class
 */
class ConfigManager {
  constructor() {
    this.config = { ...ImpactTrackingConfig };
  }

  /**
   * Get configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * Update multiple configuration values
   */
  update(updates) {
    Object.assign(this.config, updates);
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = { ...ImpactTrackingConfig };
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if impact tracking is enabled
   */
  isEnabled() {
    return this.config.enabled;
  }

  /**
   * Enable/disable impact tracking
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
  }
}

// Export singleton instance
const configManager = new ConfigManager();

export { ImpactTrackingConfig, ConfigManager, configManager };
export default configManager;
