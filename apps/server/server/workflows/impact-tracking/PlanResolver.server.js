/**
 * Plan Resolver for Automatic Impact Tracking
 *
 * Determines which plan to associate with file changes through multiple strategies
 * Part of automatic-impact-tracking spec
 */

import fs from "fs/promises";
import path from "path";
import { configManager } from "./config.js";

class PlanResolver {
  constructor() {
    this.planCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Resolve plan ID using multiple strategies
   */
  async resolvePlan(context = {}) {
    try {
      // Method 1: Explicit plan ID from context
      if (context.planId) {
        return this.validatePlanId(context.planId);
      }

      // Method 2: ContextStore (when UI is running)
      const contextStorePlan = this.getFromContextStore();
      if (contextStorePlan) {
        return this.validatePlanId(contextStorePlan);
      }

      // Method 3: Working directory analysis
      const workingDirPlan = await this.derivePlanFromWorkingDirectory();
      if (workingDirPlan) {
        return this.validatePlanId(workingDirPlan);
      }

      // Method 4: Guidance document analysis
      const guidancePlan = await this.extractPlanFromGuidance();
      if (guidancePlan) {
        return this.validatePlanId(guidancePlan);
      }

      // Method 5: Interactive prompt (if in interactive mode)
      if (context.interactive) {
        const interactivePlan = await this.promptForPlan();
        if (interactivePlan) {
          return this.validatePlanId(interactivePlan);
        }
      }

      // Default: 0 (unassociated impact - avoids referential integrity violation)
      return configManager.get("defaultPlanId");
    } catch (error) {
      console.warn("Plan resolution failed:", error.message);
      return configManager.get("defaultPlanId");
    }
  }

  /**
   * Get plan ID from contextStore (when UI is running)
   */
  getFromContextStore() {
    try {
      // Check if we're in a browser environment with contextStore
      if (typeof window !== "undefined" && window.contextStore) {
        const planId = window.contextStore.getParameter("planID");
        return planId;
      }

      // Check if contextStore is available in Node environment
      if (typeof global !== "undefined" && global.contextStore) {
        const planId = global.contextStore.getParameter("planID");
        return planId;
      }

      return null;
    } catch (error) {
      console.debug("ContextStore not available:", error.message);
      return null;
    }
  }

  /**
   * Derive plan ID from working directory
   */
  async derivePlanFromWorkingDirectory() {
    try {
      const workingDir = process.cwd();

      // Check for .kiro/specs/{plan-name} pattern
      const specMatch = workingDir.match(/\.kiro[\/\\]specs[\/\\]([^\/\\]+)/);
      if (specMatch) {
        const specName = specMatch[1];
        return await this.derivePlanFromSpec(specName);
      }

      // Check for plan ID in current directory name or parent directories
      const pathParts = workingDir.split(/[\/\\]/);
      for (const part of pathParts.reverse()) {
        // Look for 4-digit plan IDs
        const planMatch = part.match(/^(\d{4})$/);
        if (planMatch) {
          return parseInt(planMatch[1]);
        }

        // Look for plan references in folder names
        const planRefMatch = part.match(/plan[-_]?(\d+)/i);
        if (planRefMatch) {
          return parseInt(planRefMatch[1]);
        }
      }

      return null;
    } catch (error) {
      console.debug("Working directory analysis failed:", error.message);
      return null;
    }
  }

  /**
   * Derive plan ID from spec folder name
   */
  async derivePlanFromSpec(specName) {
    const cacheKey = `spec:${specName}`;

    // Check cache first
    if (this.planCache.has(cacheKey)) {
      const cached = this.planCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.planId;
      }
    }

    try {
      // Look for plan ID in spec name
      const planMatch = specName.match(/^(\d+)/);
      if (planMatch) {
        const planId = parseInt(planMatch[1]);
        this.planCache.set(cacheKey, { planId, timestamp: Date.now() });
        return planId;
      }

      // Look for plan reference in spec files
      const specDir = path.join(process.cwd(), ".kiro", "specs", specName);
      const planFromFiles = await this.searchSpecFiles(specDir);
      if (planFromFiles) {
        this.planCache.set(cacheKey, {
          planId: planFromFiles,
          timestamp: Date.now(),
        });
        return planFromFiles;
      }

      return null;
    } catch (error) {
      console.debug(`Spec analysis failed for ${specName}:`, error.message);
      return null;
    }
  }

  /**
   * Search spec files for plan references
   */
  async searchSpecFiles(specDir) {
    try {
      const files = ["requirements.md", "design.md", "tasks.md"];

      for (const file of files) {
        const filePath = path.join(specDir, file);
        try {
          const content = await fs.readFile(filePath, "utf8");
          const planMatch = content.match(/plan\s+(\d+)/i);
          if (planMatch) {
            return parseInt(planMatch[1]);
          }
        } catch (error) {
          // File doesn't exist, continue to next
          continue;
        }
      }

      return null;
    } catch (error) {
      console.debug("Spec file search failed:", error.message);
      return null;
    }
  }

  /**
   * Extract plan ID from guidance documents
   */
  async extractPlanFromGuidance() {
    try {
      // Look for guidance files in common locations
      const guidancePaths = [
        ".kiro/guidance.md",
        ".kiro/steering/guidance.md",
        "guidance.md",
        "GUIDANCE.md",
      ];

      for (const guidancePath of guidancePaths) {
        try {
          const content = await fs.readFile(guidancePath, "utf8");
          const planId = this.extractPlanFromText(content);
          if (planId) {
            return planId;
          }
        } catch (error) {
          // File doesn't exist, continue to next
          continue;
        }
      }

      return null;
    } catch (error) {
      console.debug("Guidance analysis failed:", error.message);
      return null;
    }
  }

  /**
   * Extract plan ID from text content
   */
  extractPlanFromText(text) {
    // Look for various plan reference patterns
    const patterns = [
      /plan\s+(\d+)/i,
      /plan\s+#(\d+)/i,
      /working\s+on\s+plan\s+(\d+)/i,
      /current\s+plan:\s*(\d+)/i,
      /plan\s+id:\s*(\d+)/i,
      /#(\d{4})/g, // 4-digit plan IDs with hash
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return null;
  }

  /**
   * Prompt user for plan ID (interactive mode)
   */
  async promptForPlan() {
    // This would be implemented for interactive environments
    // For now, return null to fall back to default
    console.log("Interactive plan selection not yet implemented");
    return null;
  }

  /**
   * Validate plan ID (could check against database in future)
   */
  validatePlanId(planId) {
    const id = parseInt(planId);
    if (isNaN(id) || id < 0) {
      return configManager.get("defaultPlanId");
    }
    return id;
  }

  /**
   * Clear plan resolution cache
   */
  clearCache() {
    this.planCache.clear();
  }

  /**
   * Get cached plan resolutions (for debugging)
   */
  getCacheStatus() {
    const entries = Array.from(this.planCache.entries()).map(
      ([key, value]) => ({
        key,
        planId: value.planId,
        age: Date.now() - value.timestamp,
      })
    );

    return {
      size: this.planCache.size,
      entries: entries,
    };
  }
}

export default PlanResolver;
