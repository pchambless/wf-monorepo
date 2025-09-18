/**
 * PageConfig Generator - Main orchestrator (clean and focused)
 */

import { promises as fs } from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import { loadEventTypeFromFile } from './astParser.js';
import { resolveComponentHierarchy } from './hierarchyResolver.js';
import { cleanPageProperties } from './componentCleaner.js';
import { validateEventTypeAgainstTemplate, clearTemplateCache } from '../templateRegistry.js';
import { generateEnhancedMermaidData } from './mermaidGenerator.js';
import logger from "../logger.js";

const codeName = "[genPageConfig.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Format pageConfig JSON with smart compact/multiline decisions
 * @param {Object} pageConfig - The pageConfig object to format
 * @returns {string} Formatted JSON string
 */
function formatPageConfigJson(pageConfig) {
  return stringify(pageConfig, {
    maxLength: 100,  // Keep objects on single line if under 100 chars
    indent: 2        // Use 2-space indentation for multiline
  });
}

/**
 * Generate pageConfig by scanning eventType files directly
 * @param {string} appName - App name (e.g. 'studio')
 * @param {string} pageName - Page name (e.g. 'Studio')
 * @returns {Object} Generated pageConfig
 */
export async function genPageConfig(appName, pageName) {
  logger.debug(`${codeName} Generating pageConfig for ${appName}/${pageName}`);
  
  // Clear template cache to get fresh templates each time (useful for development)
  clearTemplateCache();
  
  const pageEventTypesPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'eventTypes');
  
  // Check if page folder exists
  try {
    await fs.access(pageEventTypesPath);
  } catch {
    throw new Error(`Page not found: ${appName}/${pageName} at ${pageEventTypesPath}`);
  }
  
  // Load the root page eventType
  const pageFilePath = path.join(pageEventTypesPath, 'page', `page${pageName}.js`);
  const pageEventType = await loadEventTypeFromFile(pageFilePath);
  logger.debug(`${codeName} Loaded root page eventType: ${pageEventType.eventType}`);
  
  // Validate page eventType against its template (if available)
  if (pageEventType.category) {
    const validation = await validateEventTypeAgainstTemplate(pageEventType);
    if (validation.template) {
      logger.debug(`${codeName} Page validation - Template: ${validation.template}, Cards: [${validation.cards?.join(', ') || 'none'}]`);
      if (validation.warnings?.length > 0) {
        logger.warn(`${codeName} Page validation warnings: ${validation.warnings.join(', ')}`);
      }
      if (!validation.valid) {
        logger.error(`${codeName} Page validation errors: ${validation.errors.join(', ')}`);
      }
    }
  }
  
  // Recursively resolve all component hierarchy
  const { resolvedEventType, allEventTypes } = await resolveComponentHierarchy(pageEventType, pageEventTypesPath);
  
  // Create clean pageConfig for rendering
  const pageConfig = cleanPageProperties(resolvedEventType);
  
  // Generate mermaid chart data for hierarchy visualization
  const mermaidData = generateEnhancedMermaidData(resolvedEventType, allEventTypes);
  logger.debug(`${codeName} Generated mermaid chart with ${mermaidData.totalComponents} components, max depth: ${mermaidData.maxDepth}`);
  
  // Save pageConfig.json to the page folder with custom formatting
  const pageConfigPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'pageConfig.json');
  try {
    const formattedJson = formatPageConfigJson(pageConfig);
    await fs.writeFile(pageConfigPath, formattedJson);
    logger.debug(`${codeName} Saved pageConfig.json to ${pageConfigPath}`);
  } catch (error) {
    logger.warn(`${codeName} Could not save pageConfig.json to ${pageConfigPath}: ${error.message}`);
  }
  
  // Save mermaid chart file alongside pageConfig  
  const mermaidPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'pageMermaid.mmd');
  try {
    await fs.writeFile(mermaidPath, mermaidData.chart);
    logger.debug(`${codeName} Saved pageMermaid.mmd to ${mermaidPath}`);
  } catch (error) {
    logger.warn(`${codeName} Could not save pageMermaid.mmd to ${mermaidPath}: ${error.message}`);
  }
  
  // Clean up legacy pageMermaid.json if it exists
  const legacyJsonPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'pageMermaid.json');
  try {
    await fs.unlink(legacyJsonPath);
    logger.debug(`${codeName} Removed legacy pageMermaid.json`);
  } catch (error) {
    // File doesn't exist - that's fine
  }
  
  logger.debug(`${codeName} Generated clean pageConfig with ${pageConfig.components.length} rendering components`);
  return { pageConfig, mermaidData };
}