/**
 * Plan Impact Logging Service
 * Part of Plan 0019: Database-First Planning System
 *
 * Universal impact tracking for Claude, Kiro, and User operations
 */

import { api } from "../api/index.js";

/**
 * Universal impact logging function for all agents
 * @param {Object} impact - Impact details
 * @param {number} impact.planId - Plan ID
 * @param {string} impact.filePath - File that was impacted
 * @param {string} impact.changeType - Type of change: CREATED, MODIFIED, DELETED, ANALYZED
 * @param {string} impact.description - Description of the impact
 * @param {string} impact.createdBy - Who made the change: 'Claude', 'Kiro', 'Paul'
 * @returns {Promise<Object>} - Success/error response
 */
export async function logImpact(impact) {
  try {
    const impactData = {
      method: "INSERT",
      table: "api_wf.plan_impacts",
      data: {
        plan_id: impact.planId,
        file_path: impact.filePath,
        change_type: impact.changeType,
        status: "completed",
        description: impact.description,
        userID: 1, // DML processor will handle created_by automatically
      },
    };

    const response = await api.execDml("INSERT", impactData);

    if (response.success) {
      return {
        success: true,
        message: `Impact logged: ${impact.changeType} ${impact.filePath}`,
        impactId: response.insertId,
      };
    } else {
      return {
        success: false,
        error: response.error || "Failed to log impact",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Impact logging failed",
    };
  }
}

/**
 * Log multiple impacts in batch
 * @param {Array} impacts - Array of impact objects (using generic logImpact format)
 * @returns {Promise<Object>} - Batch logging results
 */
export async function logMultipleImpacts(impacts) {
  const results = {
    success: [],
    failed: [],
  };

  for (const impact of impacts) {
    const result = await logImpact(impact);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push({ impact, error: result.error });
    }
  }

  return {
    summary: {
      logged: results.success.length,
      failed: results.failed.length,
      total: impacts.length,
    },
    results: results,
  };
}

// Usage Examples:
//
// Kiro logging file creation:
// await logImpact({
//   planId: 19,
//   filePath: '.kiro/specs/0019-feature/design.md',
//   changeType: 'CREATED',
//   description: 'Created spec document during plan implementation',
//   createdBy: 'Kiro'
// });
//
// Claude logging analysis:
// await logImpact({
//   planId: 19,
//   filePath: 'apps/wf-server/server/utils/queryResolver.js',
//   changeType: 'ANALYZED',
//   description: 'Fixed parameter processing to handle colon prefix',
//   createdBy: 'Claude'
// });
//
// User logging strategic decision:
// await logImpact({
//   planId: 19,
//   filePath: 'claude-plans/a-pending/0019-DEVTOOLS-Planning-Enhancements.md',
//   changeType: 'MODIFIED',
//   description: 'Updated plan scope to include UI integration',
//   createdBy: 'Paul'
// });
