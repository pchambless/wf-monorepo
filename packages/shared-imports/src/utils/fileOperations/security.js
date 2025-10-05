/**
 * Security validation utilities for path traversal prevention
 */

import path from "path";
import createLogger from "../logger.js";

const logger = createLogger("FileSecurity");

/**
 * Resolve and normalize file path with comprehensive validation
 * @param {string} filePath - Directory path to resolve
 * @returns {Object} Resolved path information
 * @throws {Error} If path resolution fails
 */
export function resolvePath(filePath) {
  // Determine project root - if we're in apps/server, go up to workspace root
  let projectRoot = process.cwd();
  if (
    projectRoot.endsWith("apps/server") ||
    projectRoot.endsWith("apps\\server")
  ) {
    projectRoot = path.resolve(projectRoot, "../..");
  }
  projectRoot = path.resolve(projectRoot);

  // Clean and normalize the input path
  const cleanPath = filePath.trim().replace(/[/\\]+/g, path.sep);

  // Resolve to absolute path relative to project root
  const resolvedPath = path.resolve(projectRoot, cleanPath);

  // Get relative path from project root
  const relativePath = path.relative(projectRoot, resolvedPath);

  // Check if path is within project boundaries
  const isWithinProject =
    !relativePath.startsWith("..") && !path.isAbsolute(relativePath);

  return {
    original: filePath,
    cleaned: cleanPath,
    resolved: resolvedPath,
    relative: relativePath,
    isWithinProject,
    projectRoot,
  };
}

/**
 * Validate project boundary constraints
 * @param {Object} pathInfo - Path information from resolvePath
 * @throws {Error} If boundary validation fails
 */
export function validateProjectBoundary(pathInfo) {
  const { resolved, relative, isWithinProject, projectRoot } = pathInfo;

  // Primary boundary check - ensure path stays within project
  if (!isWithinProject) {
    throw new Error(
      `Security violation: path "${resolved}" is outside project directory "${projectRoot}"`
    );
  }

  // Additional check using startsWith for absolute paths
  if (!resolved.startsWith(projectRoot)) {
    throw new Error(
      "Security violation: resolved path attempts to access files outside project directory"
    );
  }

  // Check for suspicious relative path patterns
  if (relative.includes("..")) {
    throw new Error(
      "Security violation: relative path contains parent directory references"
    );
  }

  logger.debug("Project boundary validation passed", {
    projectRoot,
    resolvedPath: resolved,
    relativePath: relative,
  });
}

/**
 * Validate path security to prevent path traversal attacks
 * @param {string} filePath - Directory path to validate
 * @param {string} fileName - File name to validate
 * @returns {string} Resolved absolute path
 * @throws {Error} If security validation fails
 */
export function validateSecurity(filePath, fileName) {
  // Step 1: Resolve and analyze the directory path
  const pathInfo = resolvePath(filePath);

  // Step 2: Validate project boundaries
  validateProjectBoundary(pathInfo);

  // Step 3: Check for suspicious path patterns in original input
  const normalizedPath = path.normalize(filePath);
  if (
    normalizedPath.includes("..") ||
    normalizedPath.includes("./") ||
    normalizedPath.includes(".\\")
  ) {
    throw new Error(
      "Security violation: path contains suspicious traversal patterns"
    );
  }

  // Step 4: Resolve final file path
  const fullPath = path.resolve(pathInfo.resolved, fileName);

  // Step 5: Final boundary check for the complete file path
  if (!fullPath.startsWith(pathInfo.projectRoot)) {
    throw new Error(
      "Security violation: final file path attempts to access files outside project directory"
    );
  }

  // Step 6: Additional security checks for absolute input paths
  if (path.isAbsolute(filePath) && !filePath.startsWith(pathInfo.projectRoot)) {
    throw new Error(
      "Security violation: absolute path outside project directory not allowed"
    );
  }

  logger.debug("Security validation passed", {
    projectRoot: pathInfo.projectRoot,
    fullPath,
    relativePath: path.relative(pathInfo.projectRoot, fullPath),
    directoryPath: pathInfo.resolved,
  });

  return fullPath;
}
