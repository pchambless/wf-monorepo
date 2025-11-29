/**
 * File-based impact logging for Claude/Kiro coordination
 * Creates temporary files to batch changes, then submits them
 */

import fs from "fs/promises";
import path from "path";
import { logBatchImpacts } from "./logImpact.js";

const TEMP_DIR = ".impact-logs";
const DEFAULT_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3002",
  logger: console,
};

/**
 * File-based impact logger
 */
export class FileImpactLogger {
  constructor(sessionName = null, config = DEFAULT_CONFIG) {
    // Generate session name: kiro-20251018-1430
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "");

    this.sessionName = sessionName || `kiro-${dateStr}-${timeStr}`;
    this.config = config;
    this.filePath = path.join(TEMP_DIR, `${this.sessionName}.json`);
    this.impacts = [];
  }

  /**
   * Ensure temp directory exists
   */
  async ensureTempDir() {
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }
  }

  /**
   * Add an impact to the current session
   */
  async addImpact({
    filePath,
    changeType, // 'create', 'modify', 'delete', 'rename'
    description,
    phase = "implementation",
    status = "completed",
    affectedApps = [],
    createdBy = "kiro",
  }) {
    const impact = {
      filePath,
      changeType,
      description,
      phase,
      status,
      affectedApps,
      createdBy,
      timestamp: new Date().toISOString(),
    };

    this.impacts.push(impact);
    await this.saveToFile();

    this.config.logger.debug(`Added impact: ${changeType} ${filePath}`);
    return impact;
  }

  /**
   * Save current impacts to temporary file
   */
  async saveToFile() {
    await this.ensureTempDir();

    const data = {
      sessionName: this.sessionName,
      createdAt: new Date().toISOString(),
      impacts: this.impacts,
      count: this.impacts.length,
    };

    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load impacts from file
   */
  async loadFromFile() {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      const data = JSON.parse(content);
      this.impacts = data.impacts || [];
      return data;
    } catch (error) {
      // File doesn't exist yet, that's fine
      return { impacts: [], count: 0 };
    }
  }

  /**
   * Submit all impacts to the API and clean up
   */
  async submitAndCleanup(planId = 1) {
    if (this.impacts.length === 0) {
      this.config.logger.debug("No impacts to submit");
      return { success: true, count: 0 };
    }

    try {
      this.config.logger.info(
        `Submitting ${this.impacts.length} impacts from session ${this.sessionName}`
      );

      // Submit to API
      const result = await logBatchImpacts(this.impacts, planId, this.config);

      // Clean up temp file on success
      await this.cleanup();

      this.config.logger.info(
        `Successfully submitted and cleaned up ${this.impacts.length} impacts`
      );
      return result;
    } catch (error) {
      this.config.logger.error(
        "Failed to submit impacts, keeping temp file:",
        error
      );
      throw error;
    }
  }

  /**
   * Clean up temporary file
   */
  async cleanup() {
    try {
      await fs.unlink(this.filePath);
      this.config.logger.debug(`Cleaned up temp file: ${this.filePath}`);
    } catch (error) {
      // File might not exist, that's fine
    }
  }

  /**
   * List all pending impact files
   */
  static async listPendingFiles() {
    try {
      const files = await fs.readdir(TEMP_DIR);
      return files.filter((f) => f.endsWith(".json"));
    } catch (error) {
      return [];
    }
  }

  /**
   * Load a specific session file
   */
  static async loadSession(sessionName, config = DEFAULT_CONFIG) {
    const logger = new FileImpactLogger(sessionName, config);
    await logger.loadFromFile();
    return logger;
  }
}

/**
 * Convenience functions
 */
export const createSession = (sessionName = null) => {
  return new FileImpactLogger(sessionName);
};

export const addFileCreate = async (
  session,
  filePath,
  description,
  affectedApps = []
) => {
  return await session.addImpact({
    filePath,
    changeType: "create",
    description,
    affectedApps,
    createdBy: "kiro",
  });
};

export const addFileModify = async (
  session,
  filePath,
  description,
  affectedApps = []
) => {
  return await session.addImpact({
    filePath,
    changeType: "modify",
    description,
    affectedApps,
    createdBy: "kiro",
  });
};

export const addFileDelete = async (
  session,
  filePath,
  description,
  affectedApps = []
) => {
  return await session.addImpact({
    filePath,
    changeType: "delete",
    description,
    affectedApps,
    createdBy: "kiro",
  });
};
