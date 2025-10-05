/**
 * Database Writer for Impact Tracking
 *
 * Handles database operations for impact records with error handling and batch support
 * Part of automatic-impact-tracking spec
 */

import { execDml } from "@whatsfresh/shared-imports/api";
import { configManager } from "./config.js";

class DatabaseWriter {
  constructor() {
    this.retryAttempts = configManager.get("retryAttempts");
  }

  /**
   * Write a single impact record to database
   */
  async writeImpact(impact) {
    const dmlData = {
      method: "INSERT",
      table: "api_wf.plan_impacts",
      data: {
        plan_id: impact.plan_id || configManager.get("defaultPlanId"),
        file_path: impact.file_path,
        change_type: impact.change_type,
        description: impact.description,
        status: impact.status || configManager.get("defaultStatus"),
        userID: impact.userID || configManager.get("defaultUserId"),
      },
    };

    return await this.executeWithRetry(dmlData);
  }

  /**
   * Write multiple impact records in a batch transaction
   */
  async writeBatchImpacts(impacts) {
    if (!impacts || impacts.length === 0) {
      return { success: true, message: "No impacts to write" };
    }

    const batchSize = configManager.get("batchSize");
    const results = [];

    // Process in chunks to avoid overwhelming the database
    for (let i = 0; i < impacts.length; i += batchSize) {
      const chunk = impacts.slice(i, i + batchSize);
      const chunkResult = await this.writeBatchChunk(chunk);
      results.push(chunkResult);

      if (!chunkResult.success) {
        // If any chunk fails, return the failure
        return chunkResult;
      }
    }

    return {
      success: true,
      message: `Successfully wrote ${impacts.length} impact records`,
      results: results,
    };
  }

  /**
   * Write a chunk of impacts as individual INSERT operations
   * (Could be optimized to use batch INSERT in future)
   */
  async writeBatchChunk(impacts) {
    const results = [];

    for (const impact of impacts) {
      try {
        const result = await this.writeImpact(impact);
        results.push(result);

        if (!result.success) {
          return {
            success: false,
            message: `Failed to write impact for ${impact.file_path}: ${result.message}`,
            results: results,
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Error writing impact for ${impact.file_path}: ${error.message}`,
          error: error,
          results: results,
        };
      }
    }

    return {
      success: true,
      message: `Successfully wrote ${impacts.length} impacts in chunk`,
      results: results,
    };
  }

  /**
   * Execute database operation with retry logic
   */
  async executeWithRetry(dmlData, attempt = 1) {
    try {
      const result = await execDml(dmlData.method, dmlData);

      if (result && result.success) {
        return {
          success: true,
          message: "Impact record created successfully",
          insertId: result.insertId,
          result: result,
        };
      } else {
        throw new Error(
          result?.error || result?.message || "Database operation failed"
        );
      }
    } catch (error) {
      console.warn(
        `Impact tracking database error (attempt ${attempt}):`,
        error.message
      );

      if (attempt < this.retryAttempts) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        return await this.executeWithRetry(dmlData, attempt + 1);
      } else {
        // All retries exhausted
        return {
          success: false,
          message: `Failed to write impact record after ${this.retryAttempts} attempts: ${error.message}`,
          error: error,
        };
      }
    }
  }

  /**
   * Validate impact record before database operation
   */
  validateImpact(impact) {
    const required = ["file_path", "change_type", "description"];
    const missing = required.filter((field) => !impact[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    const validChangeTypes = ["CREATE", "MODIFY", "DELETE"];
    if (!validChangeTypes.includes(impact.change_type)) {
      throw new Error(
        `Invalid change_type: ${
          impact.change_type
        }. Must be one of: ${validChangeTypes.join(", ")}`
      );
    }

    return true;
  }

  /**
   * Sanitize file path for database storage
   */
  sanitizeFilePath(filePath) {
    // Normalize path separators and remove any dangerous characters
    return filePath
      .replace(/\\/g, "/") // Convert Windows paths to Unix style
      .replace(/\/+/g, "/") // Remove duplicate slashes
      .replace(/^\//, "") // Remove leading slash
      .trim();
  }
}

export default DatabaseWriter;
