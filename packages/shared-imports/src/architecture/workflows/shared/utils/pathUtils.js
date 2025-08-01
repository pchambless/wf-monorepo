/**
 * Path utilities for document workflows
 * Shared path generation and sanitization functions
 */

/**
 * Sanitize topic/component name for filename
 * @param {string} name - Name to sanitize
 * @returns {string} Safe filename component
 */
export function sanitizeForFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

/**
 * Generate padded plan ID
 * @param {string|number} planId - Plan ID
 * @returns {string} Zero-padded plan ID
 */
export function generatePaddedId(planId) {
  return String(planId).padStart(4, "0");
}

/**
 * Generate analysis document paths
 * @param {string|number} planId - Plan ID
 * @param {string} topic - Analysis topic
 * @param {string} agent - Agent name
 * @returns {Object} Path information
 */
export function generateAnalysisPaths(planId, topic, agent = "claude") {
  const paddedId = generatePaddedId(planId);
  const safeTopic = sanitizeForFilename(topic);
  const fileName = `${agent}-analysis-${safeTopic}.md`;
  const directoryPath = `.kiro/${paddedId}/analysis`;

  return {
    paddedId,
    fileName,
    directoryPath,
    safeTopic,
  };
}

/**
 * Generate guidance document paths
 * @param {string|number} planId - Plan ID
 * @param {string} component - Component name
 * @returns {Object} Path information
 */
export function generateGuidancePaths(planId, component) {
  const paddedId = generatePaddedId(planId);
  const safeComponent = sanitizeForFilename(component);
  const fileName = `implementation-guidance-${safeComponent}.md`;
  const directoryPath = `.kiro/${paddedId}/guidance`;

  return {
    paddedId,
    fileName,
    directoryPath,
    safeComponent,
  };
}
