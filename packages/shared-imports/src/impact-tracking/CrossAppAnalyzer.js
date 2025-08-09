/**
 * Cross-App Impact Analyzer - Identifies dependencies and cross-app impacts
 * This component understands the monorepo architecture and analyzes how changes
 * in one area affect other apps and components
 */

import path from "path";
import fs from "fs/promises";
import { createLogger } from "../utils/logger.js";
import { IMPACT_TYPES, SEVERITY_LEVELS, APP_NAMES } from "./types.js";

const logger = createLogger("CrossAppAnalyzer");

/**
 * Cross-App Impact Analyzer class
 * Analyzes dependencies and cross-app impacts for file changes
 */
export class CrossAppAnalyzer {
  constructor(config = {}) {
    this.config = {
      monorepoRoot: config.monorepoRoot || process.cwd(),
      eventTypesPath:
        config.eventTypesPath || "packages/shared-imports/src/events",
      databasePath: config.databasePath || "sql/database",
      ...config,
    };

    // Cache for dependency analysis
    this.dependencyCache = new Map();
    this.eventTypeCache = new Map();
    this.databaseSchemaCache = new Map();
  }

  /**
   * Analyze cross-app impacts for a file change
   * @param {string} filePath - The path of the changed file
   * @param {string} changeType - Type of change (CREATE, MODIFY, DELETE)
   * @returns {Promise<AppImpact[]>} Array of cross-app impacts
   */
  async analyzeFileImpacts(filePath, changeType) {
    try {
      const relativePath = path.relative(this.config.monorepoRoot, filePath);
      const impacts = [];

      logger.debug(`Analyzing cross-app impacts for: ${relativePath}`);

      // Analyze different types of impacts based on file location
      if (this.isEventTypeFile(relativePath)) {
        const eventTypeImpacts = await this.analyzeEventTypeImpacts(
          relativePath,
          changeType
        );
        impacts.push(...eventTypeImpacts);
      }

      if (this.isSharedUtilityFile(relativePath)) {
        const utilityImpacts = await this.analyzeSharedUtilityImpacts(
          relativePath,
          changeType
        );
        impacts.push(...utilityImpacts);
      }

      if (this.isDatabaseSchemaFile(relativePath)) {
        const schemaImpacts = await this.analyzeDatabaseSchemaImpacts(
          relativePath,
          changeType
        );
        impacts.push(...schemaImpacts);
      }

      if (this.isAuthFile(relativePath)) {
        const authImpacts = await this.analyzeAuthImpacts(
          relativePath,
          changeType
        );
        impacts.push(...authImpacts);
      }

      if (this.isConfigFile(relativePath)) {
        const configImpacts = await this.analyzeConfigImpacts(
          relativePath,
          changeType
        );
        impacts.push(...configImpacts);
      }

      // Remove duplicates and sort by severity
      const uniqueImpacts = this.deduplicateImpacts(impacts);
      return this.sortImpactsBySeverity(uniqueImpacts);
    } catch (error) {
      logger.error(`Error analyzing cross-app impacts for ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Analyze impacts for eventType changes
   * @param {string} filePath - Relative path to the eventType file
   * @param {string} changeType - Type of change
   * @returns {Promise<AppImpact[]>} EventType-related impacts
   */
  async analyzeEventTypeImpacts(filePath, changeType) {
    const impacts = [];

    try {
      // Determine which eventType was changed
      const eventTypeName = this.extractEventTypeName(filePath);

      if (!eventTypeName) {
        return impacts;
      }

      logger.debug(`Analyzing eventType impacts for: ${eventTypeName}`);

      // EventTypes affect both client and server
      impacts.push({
        appName: APP_NAMES.SERVER,
        impactType: IMPACT_TYPES.DIRECT,
        severity: SEVERITY_LEVELS.HIGH,
        description: `EventType '${eventTypeName}' ${changeType.toLowerCase()} affects API endpoints and data processing`,
      });

      // Determine which client apps use this eventType
      const clientApps = await this.findEventTypeUsage(eventTypeName);

      for (const appName of clientApps) {
        impacts.push({
          appName,
          impactType: IMPACT_TYPES.DIRECT,
          severity: SEVERITY_LEVELS.MEDIUM,
          description: `EventType '${eventTypeName}' ${changeType.toLowerCase()} may require UI updates in ${appName}`,
        });
      }

      // Special handling for plan-related eventTypes
      if (this.isPlanEventType(eventTypeName)) {
        impacts.push({
          appName: APP_NAMES.PLAN_MANAGEMENT,
          impactType: IMPACT_TYPES.DIRECT,
          severity: SEVERITY_LEVELS.HIGH,
          description: `Plan eventType '${eventTypeName}' ${changeType.toLowerCase()} directly affects plan management workflows`,
        });
      }

      // Check for workflow dependencies
      const workflowImpacts = await this.analyzeWorkflowDependencies(
        eventTypeName,
        changeType
      );
      impacts.push(...workflowImpacts);
    } catch (error) {
      logger.error(`Error analyzing eventType impacts for ${filePath}:`, error);
    }

    return impacts;
  }

  /**
   * Analyze impacts for shared utility changes
   * @param {string} filePath - Relative path to the utility file
   * @param {string} changeType - Type of change
   * @returns {Promise<AppImpact[]>} Shared utility impacts
   */
  async analyzeSharedUtilityImpacts(filePath, changeType) {
    const impacts = [];

    try {
      const utilityName = path.basename(filePath, path.extname(filePath));

      logger.debug(`Analyzing shared utility impacts for: ${utilityName}`);

      // Shared utilities potentially affect all apps
      const allApps = [
        APP_NAMES.CLIENT,
        APP_NAMES.ADMIN,
        APP_NAMES.PLAN_MANAGEMENT,
        APP_NAMES.SERVER,
      ];

      for (const appName of allApps) {
        const usage = await this.findUtilityUsage(utilityName, appName);

        if (usage.isUsed) {
          impacts.push({
            appName,
            impactType: usage.isDirect
              ? IMPACT_TYPES.DIRECT
              : IMPACT_TYPES.DEPENDENCY,
            severity: this.calculateUtilitySeverity(
              utilityName,
              usage.usageCount
            ),
            description: `Shared utility '${utilityName}' ${changeType.toLowerCase()} affects ${
              usage.usageCount
            } locations in ${appName}`,
          });
        }
      }

      // Special handling for critical utilities
      if (this.isCriticalUtility(utilityName)) {
        impacts.push({
          appName: "all-apps",
          impactType: IMPACT_TYPES.DIRECT,
          severity: SEVERITY_LEVELS.HIGH,
          description: `Critical utility '${utilityName}' ${changeType.toLowerCase()} requires thorough testing across all apps`,
        });
      }
    } catch (error) {
      logger.error(
        `Error analyzing shared utility impacts for ${filePath}:`,
        error
      );
    }

    return impacts;
  }

  /**
   * Analyze impacts for database schema changes
   * @param {string} filePath - Relative path to the schema file
   * @param {string} changeType - Type of change
   * @returns {Promise<AppImpact[]>} Database schema impacts
   */
  async analyzeDatabaseSchemaImpacts(filePath, changeType) {
    const impacts = [];

    try {
      const tableName = this.extractTableName(filePath);

      if (!tableName) {
        return impacts;
      }

      logger.debug(`Analyzing database schema impacts for table: ${tableName}`);

      // Database changes affect server directly
      impacts.push({
        appName: APP_NAMES.SERVER,
        impactType: IMPACT_TYPES.DIRECT,
        severity: SEVERITY_LEVELS.HIGH,
        description: `Database table '${tableName}' ${changeType.toLowerCase()} requires server-side model updates`,
      });

      // Find which apps use this table
      const tableUsage = await this.findTableUsage(tableName);

      for (const usage of tableUsage) {
        impacts.push({
          appName: usage.appName,
          impactType: IMPACT_TYPES.DEPENDENCY,
          severity: SEVERITY_LEVELS.MEDIUM,
          description: `Table '${tableName}' ${changeType.toLowerCase()} may affect ${
            usage.component
          } in ${usage.appName}`,
        });
      }

      // Check for display config impacts
      const displayConfigImpacts = await this.analyzeDisplayConfigImpacts(
        tableName,
        changeType
      );
      impacts.push(...displayConfigImpacts);

      // Check for eventType impacts (tables often relate to eventTypes)
      const relatedEventTypes = await this.findRelatedEventTypes(tableName);
      for (const eventType of relatedEventTypes) {
        impacts.push({
          appName: "multiple",
          impactType: IMPACT_TYPES.DEPENDENCY,
          severity: SEVERITY_LEVELS.MEDIUM,
          description: `Table '${tableName}' change may require updates to eventType '${eventType}'`,
        });
      }
    } catch (error) {
      logger.error(
        `Error analyzing database schema impacts for ${filePath}:`,
        error
      );
    }

    return impacts;
  }

  /**
   * Analyze impacts for authentication-related changes
   * @param {string} filePath - Relative path to the auth file
   * @param {string} changeType - Type of change
   * @returns {Promise<AppImpact[]>} Auth-related impacts
   */
  async analyzeAuthImpacts(filePath, changeType) {
    const impacts = [];

    try {
      logger.debug(`Analyzing auth impacts for: ${filePath}`);

      // Auth changes affect all client apps
      const clientApps = [
        APP_NAMES.CLIENT,
        APP_NAMES.ADMIN,
        APP_NAMES.PLAN_MANAGEMENT,
      ];

      for (const appName of clientApps) {
        impacts.push({
          appName,
          impactType: IMPACT_TYPES.DIRECT,
          severity: SEVERITY_LEVELS.HIGH,
          description: `Authentication ${changeType.toLowerCase()} requires login flow testing in ${appName}`,
        });
      }

      // Server-side auth impacts
      impacts.push({
        appName: APP_NAMES.SERVER,
        impactType: IMPACT_TYPES.DIRECT,
        severity: SEVERITY_LEVELS.HIGH,
        description: `Authentication ${changeType.toLowerCase()} affects server middleware and session handling`,
      });
    } catch (error) {
      logger.error(`Error analyzing auth impacts for ${filePath}:`, error);
    }

    return impacts;
  }

  /**
   * Analyze impacts for configuration changes
   * @param {string} filePath - Relative path to the config file
   * @param {string} changeType - Type of change
   * @returns {Promise<AppImpact[]>} Configuration impacts
   */
  async analyzeConfigImpacts(filePath, changeType) {
    const impacts = [];

    try {
      const configType = this.getConfigType(filePath);

      logger.debug(`Analyzing config impacts for: ${configType}`);

      switch (configType) {
        case "package.json":
          impacts.push(
            ...(await this.analyzePackageJsonImpacts(filePath, changeType))
          );
          break;
        case "turbo.json":
          impacts.push(...(await this.analyzeTurboConfigImpacts(changeType)));
          break;
        case "docker":
          impacts.push(...(await this.analyzeDockerConfigImpacts(changeType)));
          break;
        default:
          impacts.push({
            appName: "multiple",
            impactType: IMPACT_TYPES.POTENTIAL,
            severity: SEVERITY_LEVELS.LOW,
            description: `Configuration ${changeType.toLowerCase()} may require environment updates`,
          });
      }
    } catch (error) {
      logger.error(`Error analyzing config impacts for ${filePath}:`, error);
    }

    return impacts;
  }

  /**
   * Group related changes into cohesive impact records
   * @param {ImpactRecord[]} impacts - Individual impact records
   * @returns {ImpactBatch[]} Grouped impact batches
   */
  groupRelatedChanges(impacts) {
    const batches = new Map();

    for (const impact of impacts) {
      // Group by affected apps and change patterns
      const groupKey = this.generateGroupKey(impact);

      if (!batches.has(groupKey)) {
        batches.set(groupKey, {
          batchId: this.generateBatchId(),
          impacts: [],
          affectedApps: new Set(),
          changeTypes: new Set(),
          severity: SEVERITY_LEVELS.LOW,
        });
      }

      const batch = batches.get(groupKey);
      batch.impacts.push(impact);
      batch.affectedApps.add(...impact.affectedApps);
      batch.changeTypes.add(impact.changeType);

      // Update batch severity to highest impact severity
      if (
        this.getSeverityWeight(impact.severity) >
        this.getSeverityWeight(batch.severity)
      ) {
        batch.severity = impact.severity;
      }
    }

    return Array.from(batches.values()).map((batch) => ({
      ...batch,
      affectedApps: Array.from(batch.affectedApps),
      changeTypes: Array.from(batch.changeTypes),
      description: this.generateBatchDescription(batch),
    }));
  }

  // Helper methods for file type detection
  isEventTypeFile(filePath) {
    return filePath.includes("/events/") || filePath.includes("eventType");
  }

  isSharedUtilityFile(filePath) {
    return (
      filePath.startsWith("packages/shared-imports") &&
      !this.isEventTypeFile(filePath)
    );
  }

  isDatabaseSchemaFile(filePath) {
    return filePath.startsWith("sql/database");
  }

  isAuthFile(filePath) {
    return filePath.includes("auth") || filePath.includes("Auth");
  }

  isConfigFile(filePath) {
    const configFiles = [
      "package.json",
      "turbo.json",
      "docker",
      ".env",
      "config",
    ];
    return configFiles.some((config) => filePath.includes(config));
  }

  isPlanEventType(eventTypeName) {
    const planEventTypes = [
      "planList",
      "planDetail",
      "planImpact",
      "planCommunication",
    ];
    return planEventTypes.some((type) => eventTypeName.includes(type));
  }

  isCriticalUtility(utilityName) {
    const criticalUtils = [
      "logger",
      "api",
      "auth",
      "contextStore",
      "eventTypes",
    ];
    return criticalUtils.includes(utilityName);
  }

  // Helper methods for analysis
  extractEventTypeName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName === "index"
      ? path.basename(path.dirname(filePath))
      : fileName;
  }

  extractTableName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName;
  }

  getConfigType(filePath) {
    if (filePath.includes("package.json")) return "package.json";
    if (filePath.includes("turbo.json")) return "turbo.json";
    if (filePath.includes("docker") || filePath.includes("Docker"))
      return "docker";
    return "other";
  }

  calculateUtilitySeverity(utilityName, usageCount) {
    if (this.isCriticalUtility(utilityName)) return SEVERITY_LEVELS.HIGH;
    if (usageCount > 10) return SEVERITY_LEVELS.MEDIUM;
    return SEVERITY_LEVELS.LOW;
  }

  getSeverityWeight(severity) {
    const weights = {
      [SEVERITY_LEVELS.LOW]: 1,
      [SEVERITY_LEVELS.MEDIUM]: 2,
      [SEVERITY_LEVELS.HIGH]: 3,
    };
    return weights[severity] || 1;
  }

  generateGroupKey(impact) {
    return `${impact.affectedApps.join(",")}_${impact.changeType}`;
  }

  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateBatchDescription(batch) {
    const apps = batch.affectedApps.join(", ");
    const changes = batch.changeTypes.join(", ");
    return `${changes} affecting ${apps} (${batch.impacts.length} files)`;
  }

  deduplicateImpacts(impacts) {
    const seen = new Set();
    return impacts.filter((impact) => {
      const key = `${impact.appName}_${impact.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  sortImpactsBySeverity(impacts) {
    return impacts.sort(
      (a, b) =>
        this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
    );
  }

  // Placeholder methods for future implementation
  async findEventTypeUsage(eventTypeName) {
    // Would analyze actual usage across apps
    return [APP_NAMES.CLIENT, APP_NAMES.PLAN_MANAGEMENT];
  }

  async findUtilityUsage(utilityName, appName) {
    // Would analyze actual utility usage
    return { isUsed: true, isDirect: true, usageCount: 5 };
  }

  async findTableUsage(tableName) {
    // Would analyze table usage across apps
    return [{ appName: APP_NAMES.CLIENT, component: "DataGrid" }];
  }

  async analyzeWorkflowDependencies(eventTypeName, changeType) {
    // Would analyze workflow dependencies
    return [];
  }

  async analyzeDisplayConfigImpacts(tableName, changeType) {
    // Would analyze display config impacts
    return [];
  }

  async findRelatedEventTypes(tableName) {
    // Would find related eventTypes
    return [];
  }

  async analyzePackageJsonImpacts(filePath, changeType) {
    return [
      {
        appName: "all-apps",
        impactType: IMPACT_TYPES.DEPENDENCY,
        severity: SEVERITY_LEVELS.MEDIUM,
        description: `Package.json ${changeType.toLowerCase()} may require dependency updates`,
      },
    ];
  }

  async analyzeTurboConfigImpacts(changeType) {
    return [
      {
        appName: "all-apps",
        impactType: IMPACT_TYPES.DIRECT,
        severity: SEVERITY_LEVELS.MEDIUM,
        description: `Turbo config ${changeType.toLowerCase()} affects build pipeline`,
      },
    ];
  }

  async analyzeDockerConfigImpacts(changeType) {
    return [
      {
        appName: APP_NAMES.SERVER,
        impactType: IMPACT_TYPES.DIRECT,
        severity: SEVERITY_LEVELS.HIGH,
        description: `Docker config ${changeType.toLowerCase()} requires container rebuild`,
      },
    ];
  }
}

export default CrossAppAnalyzer;
