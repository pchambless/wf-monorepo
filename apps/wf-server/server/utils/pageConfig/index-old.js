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
 * Generate mermaid chart from database hierarchy
 * @param {Array} hierarchyData - Flat array from database
 * @returns {Object} Mermaid data with chart content
 */
function generateMermaidFromHierarchy(hierarchyData) {
  const lines = ['graph TD', ''];

  // Add nodes and relationships
  hierarchyData.forEach(item => {
    const nodeId = item.comp_name;
    const nodeLabel = `${nodeId}\\nctgry: [${item.template.toLowerCase()}]`;
    lines.push(`    ${nodeId}["${nodeLabel}"]`);

    // Add parent-child relationship
    const parent = hierarchyData.find(p => p.id === item.parent_id);
    if (parent) {
      lines.push(`    ${parent.comp_name} --> ${nodeId}`);
    }
  });

  lines.push('');
  lines.push('    %% Individual component styling');

  // Add click handlers
  hierarchyData.forEach(item => {
    lines.push(`    click ${item.comp_name} href "javascript:window.selectEventTypeTab('${item.comp_name}')"`);
  });

  return {
    chart: lines.join('\n'),
    totalComponents: hierarchyData.length
  };
}

/**
 * Convert flat hierarchy data to nested pageConfig structure
 * @param {Array} hierarchyData - Flat array from database with level/parent_id
 * @returns {Object} Nested pageConfig object
 */
function buildPageConfig(hierarchyData) {
  if (!hierarchyData || hierarchyData.length === 0) {
    return { components: [] };
  }

  // Find the root page component (level 0)
  const rootComponent = hierarchyData.find(item => item.level === 0);
  if (!rootComponent) {
    throw new Error('No root component found in hierarchy data');
  }

  // Build component tree recursively
  const buildChildren = (parentId, level) => {
    return hierarchyData
      .filter(item => item.parent_id === parentId && item.level === level)
      .filter(item => item.template !== 'ServerQuery') // Exclude ServerQueries from UI
      .map(item => ({
        id: item.comp_name,
        type: item.template.toLowerCase(),
        container: JSON.parse(item.props || '{}').container || 'inline',
        position: item.position ? JSON.parse(item.position) : {},
        props: JSON.parse(item.props || '{}'),
        ...(hierarchyData.some(child => child.parent_id === item.id) && {
          components: buildChildren(item.id, level + 1)
        })
      }));
  };

  // Build the complete pageConfig
  const pageConfig = {
    layout: "flex",
    components: buildChildren(rootComponent.id, 1),
    title: JSON.parse(rootComponent.props || '{}').title || rootComponent.comp_name,
    routePath: JSON.parse(rootComponent.props || '{}').routePath || "/studio",
    purpose: "Database-generated page configuration",
    cluster: "Page"
  };

  return pageConfig;
}

/**
 * Generate pageConfig from database hierarchy
 * @param {string} appName - App name (e.g. 'studio')
 * @param {string} pageName - Page name (e.g. 'Studio')
 * @returns {Object} Generated pageConfig
 */
export async function genPageConfig(appName, pageName) {
  logger.debug(`${codeName} Generating database-driven pageConfig for ${appName}/${pageName}`);

  try {
    // Use our existing execEventType with pageHierarchy ServerQuery
    const { executeQuery } = await import('../dbUtils.js');

    // Simulate execEventType call: xrefId 39 (pageHierarchy) with pageID 24 (studio page)
    const fetchSQL = `
      SELECT x.name as comp_name, e.name as template_name,
             CASE WHEN e.name = 'ServerQuery' THEN x.qrySQL ELSE x.props END as querySQL
      FROM api_wf.eventType_xref x
      JOIN api_wf.eventType e ON x.eventType_id = e.id
      WHERE x.id = 39 AND x.active = 1
    `;

    const serverQueryResult = await executeQuery(fetchSQL, 'GET');
    if (!serverQueryResult || serverQueryResult.length === 0) {
      throw new Error('pageHierarchy ServerQuery not found (xref 39)');
    }

    // Execute the stored procedure with pageID 24
    const storedProcSQL = serverQueryResult[0].querySQL.replace('?', '24');
    const hierarchyResult = await executeQuery(storedProcSQL, 'GET');
    const hierarchyData = Array.isArray(hierarchyResult) && hierarchyResult.length > 0 ? hierarchyResult[0] : [];

    if (!hierarchyData || hierarchyData.length === 0) {
      throw new Error('No hierarchy data returned from pageHierarchy ServerQuery');
    }

    logger.debug(`${codeName} Loaded ${hierarchyData.length} components via pageHierarchy ServerQuery`);

    // Convert to pageConfig and mermaid
    const pageConfig = buildPageConfig(hierarchyData);
    const mermaidData = generateMermaidFromHierarchy(hierarchyData);

    logger.debug(`${codeName} Built pageConfig with ${pageConfig.components?.length || 0} root components`);

  } catch (error) {
    logger.error(`${codeName} Error generating pageConfig from database:`, error);
    throw error;
  }

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