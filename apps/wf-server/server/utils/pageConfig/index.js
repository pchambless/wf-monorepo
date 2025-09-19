/**
 * Database-Driven PageConfig Generator - Clean from scratch
 */

import { promises as fs } from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import logger from "../logger.js";

const codeName = "[database-genPageConfig.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Generate mermaid chart from database hierarchy
 */
function generateMermaid(hierarchyData) {
  const lines = ['graph TD', ''];

  hierarchyData.forEach(item => {
    const nodeId = item.comp_name;
    const nodeLabel = `${nodeId}<br/>ctgry: [${item.template.toLowerCase()}]`;
    lines.push(`    ${nodeId}["${nodeLabel}"]`);

    const parent = hierarchyData.find(p => p.id === item.parent_id);
    if (parent) {
      lines.push(`    ${parent.comp_name} --> ${nodeId}`);
    }
  });

  lines.push('');
  lines.push('    %% Click handlers for Studio integration');
  hierarchyData.forEach(item => {
    lines.push(`    click ${item.comp_name} href "javascript:window.selectEventTypeTab(${item.id})"`);
  });

  return lines.join('\n');
}

/**
 * Convert flat hierarchy to nested pageConfig
 */
function buildPageConfig(hierarchyData) {
  const rootComponent = hierarchyData.find(item => item.level === 0);
  if (!rootComponent) {
    throw new Error('No root component found');
  }

  const buildChildren = (parentId, level) => {
    return hierarchyData
      .filter(item => item.parent_id === parentId && item.level === level)
      .filter(item => item.template !== 'ServerQuery') // UI only
      .map(item => {
        // Parse posOrder: "01,01;01,02" = rowStart,rowSpan;colStart,colSpan
        const [rowData, colData] = (item.posOrder || '00,00;00,00').split(';');
        const [rowStart, rowSpan] = rowData.split(',').map(n => parseInt(n));
        const [colStart, colSpan] = colData.split(',').map(n => parseInt(n));

        // Parse props safely
        const props = typeof item.props === 'string' ? JSON.parse(item.props || '{}') : item.props || {};

        return {
          id: item.comp_name,
          type: item.template.toLowerCase(),
          container: props.container || 'inline',
          position: rowStart > 0 || colStart > 0 ? {
            row: { start: rowStart, span: rowSpan },
            col: { start: colStart, span: colSpan }
          } : {},
          props,
          ...(hierarchyData.some(child => child.parent_id === item.id) && {
            components: buildChildren(item.id, level + 1)
          })
        };
      });
  };

  const rootProps = typeof rootComponent.props === 'string' ? JSON.parse(rootComponent.props || '{}') : rootComponent.props || {};

  return {
    layout: "flex",
    components: buildChildren(rootComponent.id, 1),
    title: rootProps.title || rootComponent.comp_name,
    routePath: rootProps.routePath || "/studio",
    purpose: "Database-generated page configuration",
    cluster: "Page"
  };
}

/**
 * Generate pageConfig from database using pageID
 */
export async function genPageConfig(pageID) {
  logger.debug(`${codeName} Generating pageConfig for page xref ID: ${pageID}`);

  try {
    // Execute pageHierarchy ServerQuery (xref 39) with the pageID
    const { executeQuery } = await import('../dbUtils.js');

    // Get pageHierarchy ServerQuery
    const fetchSQL = `
      SELECT CASE WHEN e.name = 'ServerQuery' THEN x.qrySQL ELSE x.props END as querySQL
      FROM api_wf.eventType_xref x
      JOIN api_wf.eventType e ON x.eventType_id = e.id
      WHERE x.id = 39 AND x.active = 1
    `;

    const serverQuery = await executeQuery(fetchSQL, 'GET');
    if (!serverQuery || serverQuery.length === 0) {
      throw new Error('pageHierarchy ServerQuery not found (xref 39)');
    }

    // Execute stored procedure with pageID
    const storedProcSQL = serverQuery[0].querySQL.replace('?', pageID);
    const hierarchyResult = await executeQuery(storedProcSQL, 'GET');
    const hierarchyData = Array.isArray(hierarchyResult) && hierarchyResult.length > 0 ? hierarchyResult[0] : [];

    if (!hierarchyData || hierarchyData.length === 0) {
      throw new Error(`No hierarchy data found for page ID: ${pageID}`);
    }

    logger.debug(`${codeName} Loaded ${hierarchyData.length} components from database`);

    // Generate pageConfig and mermaid
    const pageConfig = buildPageConfig(hierarchyData);
    const mermaidChart = generateMermaid(hierarchyData);

    // Save files (hardcode Studio path for now)
    const appName = 'studio';
    const pageName = 'Studio';

    const pageConfigPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'pageConfig.json');
    const mermaidPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'pageMermaid.mmd');

    try {
      const formattedJson = stringify(pageConfig, { maxLength: 100, indent: 2 });
      await fs.writeFile(pageConfigPath, formattedJson);
      logger.debug(`${codeName} Saved pageConfig.json`);
    } catch (error) {
      logger.warn(`${codeName} Could not save pageConfig.json: ${error.message}`);
    }

    try {
      await fs.writeFile(mermaidPath, mermaidChart);
      logger.debug(`${codeName} Saved pageMermaid.mmd`);
    } catch (error) {
      logger.warn(`${codeName} Could not save pageMermaid.mmd: ${error.message}`);
    }

    return {
      pageConfig,
      mermaidData: { chart: mermaidChart, totalComponents: hierarchyData.length },
      meta: {
        pageID,
        componentsGenerated: hierarchyData.length,
        generated: new Date().toISOString()
      }
    };

  } catch (error) {
    logger.error(`${codeName} Error generating pageConfig:`, error);
    throw error;
  }
}