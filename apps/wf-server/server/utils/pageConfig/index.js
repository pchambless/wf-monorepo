/**
 * Database-Driven PageConfig Generator - Clean from scratch
 */

import { promises as fs } from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import logger from "../logger.js";
import { getComponentProps } from './propsRetriever.js';
import { getComponentTriggers } from './triggersRetriever.js';

const codeName = "[database-genPageConfig.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Generate mermaid chart from database hierarchy (excluding level -1)
 */
function generateMermaid(hierarchyData) {
  const lines = ['graph TD', ''];

  // Filter out level -1 (monorepo root)
  const filteredData = hierarchyData.filter(item => item.level >= 0);

  filteredData.forEach(item => {
    const nodeId = item.comp_name;
    const nodeLabel = `${nodeId}<br/>ctgry: [${item.template.toLowerCase()}]`;
    lines.push(`    ${nodeId}["${nodeLabel}"]`);

    const parent = filteredData.find(p => p.id === item.parent_id);
    if (parent) {
      lines.push(`    ${parent.comp_name} --> ${nodeId}`);
    }
  });

  lines.push('');
  lines.push('    %% Click handlers for Studio integration');
  filteredData.forEach(item => {
    lines.push(`    click ${item.comp_name} href "javascript:window.selectEventTypeTab(${item.id})"`);
  });

  return lines.join('\n');
}

/**
 * Convert flat hierarchy to nested pageConfig with enhanced props and triggers
 */
async function buildPageConfig(hierarchyData, userEmail = 'pc7900@gmail.com') {
  const rootComponent = hierarchyData.find(item => item.level === 0);
  if (!rootComponent) {
    throw new Error('No root component found');
  }

  // Enhance all components with props and triggers from database
  logger.debug(`${codeName} Enhancing ${hierarchyData.length} components with props and triggers`);

  for (const component of hierarchyData) {
    try {
      // Get enhanced props and triggers in parallel
      const [enhancedProps, workflowTriggers] = await Promise.all([
        getComponentProps(component.id, userEmail),
        getComponentTriggers(component.id, userEmail)
      ]);

      // Add enhanced data to component
      if (Object.keys(enhancedProps).length > 0) {
        component.enhancedProps = enhancedProps;
      }

      if (workflowTriggers) {
        component.workflowTriggers = workflowTriggers;
      }

      logger.debug(`${codeName} Enhanced ${component.comp_name}: ${Object.keys(enhancedProps).length} props, ${workflowTriggers ? Object.keys(workflowTriggers).length : 0} trigger classes`);
    } catch (error) {
      logger.error(`${codeName} Error enhancing component ${component.comp_name}:`, error);
    }
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

        // Use enhanced props from eventProps table, fallback to old props
        const props = item.enhancedProps ||
          (typeof item.props === 'string' ? JSON.parse(item.props || '{}') : item.props || {});

        const component = {
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

        // Add workflow triggers if they exist
        if (item.workflowTriggers) {
          component.props.workflowTriggers = item.workflowTriggers;
        }

        return component;
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

    // Execute stored procedure directly - sp_hier_structure
    const storedProcSQL = `CALL api_wf.sp_hier_structure(${pageID})`;
    const hierarchyResult = await executeQuery(storedProcSQL, 'GET');
    const hierarchyData = Array.isArray(hierarchyResult) && hierarchyResult.length > 0 ? hierarchyResult[0] : [];

    if (!hierarchyData || hierarchyData.length === 0) {
      throw new Error(`No hierarchy data found for page ID: ${pageID}`);
    }

    logger.debug(`${codeName} Loaded ${hierarchyData.length} components from database`);

    // Generate pageConfig and mermaid
    const pageConfig = await buildPageConfig(hierarchyData);
    const mermaidChart = generateMermaid(hierarchyData);

    // Extract app and page names from hierarchy data
    const appComponent = hierarchyData.find(item => item.level === 0);    // App level
    const pageComponent = hierarchyData.find(item => item.level === 1);   // Page level

    if (!appComponent || !pageComponent) {
      throw new Error('Missing app or page component in hierarchy data');
    }

    // Map hierarchy names to studio app/page structure
    // App level (0): wf-login -> wf-login (keep as-is)
    // Page level (1): loginPage -> loginPage (keep as-is)
    const appName = appComponent.comp_name;  // wf-login
    const pageName = pageComponent.comp_name; // loginPage

    const pageConfigPath = path.join(STUDIO_APPS_PATH, appName, pageName, 'pageConfig.json');
    const mermaidPath = path.join(STUDIO_APPS_PATH, appName, pageName, 'pageMermaid.mmd');
    const targetDir = path.join(STUDIO_APPS_PATH, appName, pageName);

    try {
      // Ensure directory exists
      await fs.mkdir(targetDir, { recursive: true });

      const formattedJson = stringify(pageConfig, { maxLength: 100, indent: 2 });
      await fs.writeFile(pageConfigPath, formattedJson);
      logger.debug(`${codeName} Saved pageConfig.json to ${pageConfigPath}`);
    } catch (error) {
      logger.warn(`${codeName} Could not save pageConfig.json: ${error.message}`);
    }

    try {
      await fs.writeFile(mermaidPath, mermaidChart);
      logger.debug(`${codeName} Saved pageMermaid.mmd to ${mermaidPath}`);
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