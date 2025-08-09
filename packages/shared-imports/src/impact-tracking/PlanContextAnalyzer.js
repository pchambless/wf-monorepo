/**
 * Plan Context Analyzer - Determines plan association for impact tracking
 * This component uses multiple strategies to identify which plan is being worked on
 */

import path from "path";
import fs from "fs/promises";
import { createLogger } from "../utils/logger.js";
import { PLAN_CONTEXT_SOURCES } from "./types.js";

const logger = createLogger("PlanContextAnalyzer");

/**
 * Plan Context Analyzer class
 * Handles multiple methods of determining plan association for impact tracking
 */
export class PlanContextAnalyzer {
  constructor(config = {}) {
    this.config = {
      monorepoRoot: config.monorepoRoot || process.cwd(),
      contextStore: config.contextStore || null,
      planRegistryPath:
        config.planRegistryPath || "claude-plans/plan-registry.json",
      ...config,
    };

    this.planRegistry = null;
    this.contextCache = new Map();
  }

  /**
   * Get the current plan context using multiple resolution strategies
   * @returns {Promise<PlanContext|null>} The resolved plan context or null
   */
  async getCurrentPlanContext() {
    try {
      // Strategy 1: Check context store (highest priority)
      const contextStoreResult = await this.extractPlanFromContextStore();
      if (contextStoreResult) {
        logger.debug("Plan context resolved from context store", {
          planId: contextStoreResult.planId,
        });
        return contextStoreResult;
      }

      // Strategy 2: Check for .kiro spec directories
      const fileSystemResult = await this.extractPlanFromFileSystem();
      if (fileSystemResult) {
        logger.debug("Plan context resolved from file system", {
          planId: fileSystemResult.planId,
        });
        return fileSystemResult;
      }

      // Strategy 3: Check guidance documents
      const guidanceResult = await this.extractPlanFromGuidance();
      if (guidanceResult) {
        logger.debug("Plan context resolved from guidance", {
          planId: guidanceResult.planId,
        });
        return guidanceResult;
      }

      // Strategy 4: Check environment variables
      const envResult = await this.extractPlanFromEnvironment();
      if (envResult) {
        logger.debug("Plan context resolved from environment", {
          planId: envResult.planId,
        });
        return envResult;
      }

      logger.debug("No plan context could be determined");
      return null;
    } catch (error) {
      logger.error("Error determining plan context:", error);
      return null;
    }
  }

  /**
   * Extract plan context from the context store
   * @returns {Promise<PlanContext|null>}
   */
  async extractPlanFromContextStore() {
    try {
      if (!this.config.contextStore) {
        return null;
      }

      // Check if contextStore has planID
      const planId =
        this.config.contextStore.get("planID") ||
        this.config.contextStore.get("currentPlan") ||
        this.config.contextStore.get("activePlan");

      if (planId) {
        const planName = await this.getPlanNameById(planId);
        return {
          planId: parseInt(planId),
          planName: planName || `Plan ${planId}`,
          source: PLAN_CONTEXT_SOURCES.CONTEXT_STORE,
          confidence: 0.95,
        };
      }

      return null;
    } catch (error) {
      logger.warn("Error extracting plan from context store:", error);
      return null;
    }
  }

  /**
   * Extract plan context from file system (.kiro directories)
   * @returns {Promise<PlanContext|null>}
   */
  async extractPlanFromFileSystem() {
    try {
      const cwd = process.cwd();

      // Check if we're in a .kiro/XXXX directory
      const relativePath = path.relative(this.config.monorepoRoot, cwd);
      const kiroMatch = relativePath.match(/\.kiro[\/\\](\d{4})/);

      if (kiroMatch) {
        const planId = parseInt(kiroMatch[1]);
        const planName = await this.getPlanNameById(planId);

        return {
          planId,
          planName: planName || `Plan ${planId}`,
          source: PLAN_CONTEXT_SOURCES.FILE_SYSTEM,
          confidence: 0.85,
        };
      }

      // Check for spec directories
      const specMatch = relativePath.match(/\.kiro[\/\\]specs[\/\\]([^\/\\]+)/);
      if (specMatch) {
        const specName = specMatch[1];
        const planId = await this.findPlanByName(specName);

        if (planId) {
          return {
            planId,
            planName: specName,
            source: PLAN_CONTEXT_SOURCES.FILE_SYSTEM,
            confidence: 0.8,
          };
        }
      }

      return null;
    } catch (error) {
      logger.warn("Error extracting plan from file system:", error);
      return null;
    }
  }

  /**
   * Extract plan context from guidance documents
   * @returns {Promise<PlanContext|null>}
   */
  async extractPlanFromGuidance() {
    try {
      // Check for guidance files that might contain plan context
      const guidancePaths = [
        ".kiro/guidance.md",
        ".claude/guidance.md",
        "CLAUDE.md",
        "claude-plans/next-session.md",
      ];

      for (const guidancePath of guidancePaths) {
        const fullPath = path.join(this.config.monorepoRoot, guidancePath);

        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const planContext = this.extractPlanFromText(content);

          if (planContext) {
            return {
              ...planContext,
              source: PLAN_CONTEXT_SOURCES.GUIDANCE,
              confidence: 0.7,
            };
          }
        } catch (fileError) {
          // File doesn't exist, continue to next
          continue;
        }
      }

      return null;
    } catch (error) {
      logger.warn("Error extracting plan from guidance:", error);
      return null;
    }
  }

  /**
   * Extract plan context from environment variables
   * @returns {Promise<PlanContext|null>}
   */
  async extractPlanFromEnvironment() {
    try {
      const planId =
        process.env.CURRENT_PLAN ||
        process.env.ACTIVE_PLAN ||
        process.env.PLAN_ID;

      if (planId) {
        const planName = await this.getPlanNameById(parseInt(planId));
        return {
          planId: parseInt(planId),
          planName: planName || `Plan ${planId}`,
          source: PLAN_CONTEXT_SOURCES.MANUAL,
          confidence: 0.6,
        };
      }

      return null;
    } catch (error) {
      logger.warn("Error extracting plan from environment:", error);
      return null;
    }
  }

  /**
   * Extract plan information from text content
   * @param {string} text - Text content to analyze
   * @returns {Object|null} Plan context or null
   */
  extractPlanFromText(text) {
    // Look for plan references in various formats
    const patterns = [
      /plan\s+(\d+)/gi,
      /plan\s+#(\d+)/gi,
      /#(\d{4})/g,
      /working\s+on\s+plan\s+(\d+)/gi,
      /current\s+plan:\s*(\d+)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Extract the number from the first match
        const numberMatch = matches[0].match(/(\d+)/);
        if (numberMatch) {
          const planId = parseInt(numberMatch[1]);
          return {
            planId,
            planName: `Plan ${planId}`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Get plan name by ID from the plan registry
   * @param {number} planId - The plan ID
   * @returns {Promise<string|null>} Plan name or null
   */
  async getPlanNameById(planId) {
    try {
      const registry = await this.loadPlanRegistry();
      if (!registry || !registry.plans) {
        return null;
      }

      const plan = registry.plans.find((p) => parseInt(p.id) === planId);
      return plan ? plan.name : null;
    } catch (error) {
      logger.warn(`Error getting plan name for ID ${planId}:`, error);
      return null;
    }
  }

  /**
   * Find plan ID by name
   * @param {string} planName - The plan name to search for
   * @returns {Promise<number|null>} Plan ID or null
   */
  async findPlanByName(planName) {
    try {
      const registry = await this.loadPlanRegistry();
      if (!registry || !registry.plans) {
        return null;
      }

      // Try exact match first
      let plan = registry.plans.find(
        (p) => p.name.toLowerCase() === planName.toLowerCase()
      );

      // Try partial match if no exact match
      if (!plan) {
        plan = registry.plans.find(
          (p) =>
            p.name.toLowerCase().includes(planName.toLowerCase()) ||
            planName.toLowerCase().includes(p.name.toLowerCase())
        );
      }

      return plan ? parseInt(plan.id) : null;
    } catch (error) {
      logger.warn(`Error finding plan by name ${planName}:`, error);
      return null;
    }
  }

  /**
   * Load the plan registry from disk
   * @returns {Promise<Object|null>} Plan registry or null
   */
  async loadPlanRegistry() {
    try {
      if (this.planRegistry) {
        return this.planRegistry;
      }

      const registryPath = path.join(
        this.config.monorepoRoot,
        this.config.planRegistryPath
      );
      const content = await fs.readFile(registryPath, "utf-8");
      this.planRegistry = JSON.parse(content);

      return this.planRegistry;
    } catch (error) {
      logger.warn("Error loading plan registry:", error);
      return null;
    }
  }

  /**
   * Prompt for manual plan association (placeholder for UI integration)
   * @returns {Promise<number|null>} Manually selected plan ID
   */
  async promptForPlanAssociation() {
    // This would integrate with the UI to prompt the user
    // For now, return null to indicate no manual selection
    logger.info("Manual plan association would be prompted here");
    return null;
  }

  /**
   * Extract plan from a specific file path context
   * @param {string} filePath - The file path that was changed
   * @returns {Promise<PlanContext|null>} Plan context based on file location
   */
  async extractPlanFromPath(filePath) {
    try {
      const relativePath = path.relative(this.config.monorepoRoot, filePath);

      // Check if file is in a .kiro/XXXX directory
      const kiroMatch = relativePath.match(/\.kiro[\/\\](\d{4})/);
      if (kiroMatch) {
        const planId = parseInt(kiroMatch[1]);
        const planName = await this.getPlanNameById(planId);

        return {
          planId,
          planName: planName || `Plan ${planId}`,
          source: PLAN_CONTEXT_SOURCES.FILE_SYSTEM,
          confidence: 0.9,
        };
      }

      return null;
    } catch (error) {
      logger.warn(`Error extracting plan from path ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Clear the context cache
   */
  clearCache() {
    this.contextCache.clear();
    this.planRegistry = null;
  }
}

export default PlanContextAnalyzer;
