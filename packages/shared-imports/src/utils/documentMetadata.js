/**
 * Document Metadata Extraction Utilities
 * Part of Plan 0018 Phase 3: Document Management Integration
 *
 * Provides utilities for extracting metadata from .kiro/specs/ and .kiro/issues/ files
 * for registration in the plan_documents database table.
 */

// Browser-compatible path utilities
const path = {
  basename: (filePath, ext) => {
    const name = filePath.split(/[\\/]/).pop() || "";
    return ext
      ? name.replace(
          new RegExp(ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
          ""
        )
      : name;
  },
  dirname: (filePath) => {
    const parts = filePath.split(/[\\/]/);
    return parts.slice(0, -1).join("/") || ".";
  },
};

/**
 * Plan ID extraction patterns - supports multiple naming conventions
 */
const PLAN_ID_PATTERNS = [
  /^(\d{4})-/, // 0019-feature-name
  /^plan-(\d+)/i, // plan-19-feature
  /^(\d+)-/, // 19-feature
];

/**
 * Extract plan ID from file path based on folder naming patterns
 * @param {string} filePath - Full or relative path to the document
 * @returns {number|null} - Plan ID as integer, or null if no pattern matches
 */
function extractPlanId(filePath) {
  const folderName = path.basename(path.dirname(filePath));

  for (const pattern of PLAN_ID_PATTERNS) {
    const match = folderName.match(pattern);
    if (match) {
      const planId = parseInt(match[1], 10);
      // Return 0 for orphaned documents (as per database design)
      return planId || 0;
    }
  }

  // No plan association found - use 0 for orphans
  return 0;
}

/**
 * Extract title from markdown content
 * @param {string} fileContent - Raw markdown content
 * @returns {string|null} - Extracted title or null if not found
 */
function extractTitle(fileContent) {
  if (!fileContent || typeof fileContent !== "string") {
    return null;
  }

  // Try to find first markdown heading (# Title)
  const headingMatch = fileContent.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // No heading found
  return null;
}

/**
 * Determine document type based on file path
 * @param {string} filePath - Full or relative path to the document
 * @returns {string} - Document type: 'spec', 'issue', or 'unknown'
 */
function determineDocumentType(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/"); // Handle Windows paths

  if (normalizedPath.includes(".kiro/specs/")) {
    return "spec";
  } else if (normalizedPath.includes(".kiro/issues/")) {
    return "issue";
  }

  return "unknown";
}

/**
 * Generate fallback title from filename
 * @param {string} filePath - Full or relative path to the document
 * @returns {string} - Filename without extension, formatted as title
 */
function generateFallbackTitle(filePath) {
  const filename = path.basename(filePath, ".md");

  // Convert kebab-case or snake_case to Title Case
  return filename
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Main interface - parse all metadata from file path and content
 * @param {string} filePath - Full or relative path to the document
 * @param {string} fileContent - Raw markdown content
 * @returns {Object} - Complete metadata object for database registration
 */
function parseDocumentMetadata(filePath, fileContent) {
  const planId = extractPlanId(filePath);
  const documentType = determineDocumentType(filePath);
  const extractedTitle = extractTitle(fileContent);
  const fallbackTitle = generateFallbackTitle(filePath);

  // Use extracted title or fallback to filename
  const title = extractedTitle || fallbackTitle;

  // Convert to relative path from workspace root
  const relativePath = filePath.startsWith(".kiro/")
    ? filePath
    : filePath.replace(/.*[\\\/]\.kiro[\\\/]/, ".kiro/");

  return {
    plan_id: planId,
    document_type: documentType,
    file_path: relativePath,
    title: title,
    author: "kiro", // Default for script-created entries
    status: "draft", // Default status
    created_by: "kiro",
  };
}

export {
  extractPlanId,
  extractTitle,
  determineDocumentType,
  generateFallbackTitle,
  parseDocumentMetadata,
  PLAN_ID_PATTERNS, // Export for testing
};
