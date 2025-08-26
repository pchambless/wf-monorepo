import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanEventTypesWithBabel } from './utils/parseEventType.js';
import { toMermaid } from './utils/toMermaid.js';
import { getAppDirectory } from '../config/appNames.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate app mapping configs and visualizations
 * Clean input→output generation for runtime app configuration
 * 
 * Inputs: layouts/ + pages/ folders
 * Outputs: pageConfig/ JSON files + analysis/ .mmd files
 */

// COMPLETION_DRIVE: Assuming all apps follow same src/layouts + src/pages pattern
async function scanAppInputs(app) {
  console.log(`[scanAppInputs] 🔍 Scanning input folders for app: ${app}`);

  // Convert logical app name to directory name
  const appDir = getAppDirectory(app);

  const layoutsDir = path.resolve(__dirname, `../../apps/${appDir}/src/layouts`);
  const pagesDir = path.resolve(__dirname, `../../apps/${appDir}/src/pages`);

  try {
    // COMPLETION_DRIVE: Assuming scanEventTypesWithBabel works same for layouts and pages
    const layouts = await scanEventTypesWithBabel(layoutsDir);
    const pages = await scanEventTypesWithBabel(pagesDir);

    console.log(`📊 Found ${layouts.length} layout components, ${pages.length} page components`);

    return { layouts, pages, success: true };
  } catch (error) {
    console.error(`❌ Error scanning inputs for ${app}:`, error);
    return { layouts: [], pages: [], success: false, error: error.message };
  }
}

// COMPLETION_DRIVE: Assuming JSON structure matches eventType properties exactly
async function generateLayoutConfigs(app, layouts) {
  console.log(`[generateLayoutConfigs] 📝 Generating layout configs for ${app}`);

  // Convert logical app name to directory name
  const appDir = getAppDirectory(app);

  const outputDir = path.resolve(__dirname, `../../apps/${appDir}/src/pageConfig/layouts`);
  await fs.mkdir(outputDir, { recursive: true });

  for (const layout of layouts) {
    const config = {
      eventType: layout.eventType,
      category: layout.category || 'layout',
      title: layout.title,
      purpose: layout.purpose,
      qry: layout.qry || '',
      components: layout.components || [],
      workflowTriggers: layout.workflowTriggers || {},
      // COMPLETION_DRIVE: Assuming all layouts need these runtime properties
      hasComponents: !!(layout.components && layout.components.length > 0),
      hasWorkflows: !!(layout.workflowTriggers && Object.keys(layout.workflowTriggers).length > 0)
    };

    const configPath = path.join(outputDir, `${layout.eventType}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Generated ${layout.eventType}.json`);
  }
}

// COMPLETION_DRIVE: Assuming pages can be grouped by pageFolder for organization
async function generatePageConfigs(app, pages) {
  console.log(`[generatePageConfigs] 📄 Generating page configs for ${app}`);

  // Convert logical app name to directory name
  const appDir = getAppDirectory(app);

  const outputDir = path.resolve(__dirname, `../../apps/${appDir}/src/pageConfig/pages`);
  await fs.mkdir(outputDir, { recursive: true });

  // Group pages by pageFolder for organized output
  const pageGroups = new Map();
  pages.forEach(page => {
    const folder = page.pageFolder || 'misc';
    if (!pageGroups.has(folder)) {
      pageGroups.set(folder, []);
    }
    pageGroups.get(folder).push(page);
  });

  // COMPLETION_DRIVE: Assuming each pageFolder should be one config file
  for (const [folderName, pageComponents] of pageGroups) {
    const config = {
      pageFolder: folderName,
      components: pageComponents.map(page => ({
        eventType: page.eventType,
        category: page.category,
        title: page.title,
        purpose: page.purpose,
        qry: page.qry || '',
        routePath: page.routePath,
        components: page.components || [],
        workflowTriggers: page.workflowTriggers || {},
        // COMPLETION_DRIVE: Assuming runtime needs these computed flags
        hasComponents: !!(page.components && page.components.length > 0),
        hasWorkflows: !!(page.workflowTriggers && Object.keys(page.workflowTriggers).length > 0)
      })),
      meta: {
        generated: new Date().toISOString(),
        componentCount: pageComponents.length
      }
    };

    const configPath = path.join(outputDir, `${folderName}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Generated ${folderName}.json with ${pageComponents.length} components`);
  }
}

// COMPLETION_DRIVE: Assuming we can reuse the proven toMermaid logic for consistency
function buildGraphDataForMermaid(components, title) {
  // Transform components into graph format that toMermaid expects
  const nodes = [];
  const componentEdges = [];
  const workflowEdges = [];
  const allWorkflows = new Set();

  // COMPLETION_DRIVE: Assuming same node structure as original graph data
  components.forEach(component => {
    nodes.push({
      id: component.eventType,
      label: `${component.category}<br>${component.eventType}<br>[${component.title || ''}]`,
      category: component.category || 'uncategorized',
      meta: {
        // COMPLETION_DRIVE: Using cluster for grouping, setting pageFolder to cluster value to override toMermaid logic
        cluster: component.cluster || 'UNCATEGORIZED',
        pageFolder: component.cluster || 'UNCATEGORIZED', // Override pageFolder with cluster for grouping
        title: component.title,
        purpose: component.purpose,
        qry: component.qry || ''
      }
    });

    // COMPLETION_DRIVE: Assuming workflowTriggers need to create workflow nodes and edges
    if (component.workflowTriggers) {
      Object.entries(component.workflowTriggers).forEach(([trigger, workflows]) => {
        if (Array.isArray(workflows)) {
          workflows.forEach(workflow => {
            allWorkflows.add(workflow);
            workflowEdges.push({
              from: component.eventType,
              to: `workflow:${workflow}`,
              label: trigger,
              type: 'workflow'
            });
          });
        }
      });
    }

    // COMPLETION_DRIVE: Assuming component relationships create containment edges
    if (component.components && component.components.length > 0) {
      component.components.forEach(subComp => {
        if (subComp.id) {
          // Find the referenced component in our list
          const referencedComp = components.find(c => c.eventType === subComp.id);
          if (referencedComp) {
            componentEdges.push({
              from: component.eventType,
              to: subComp.id,
              label: 'contains',
              type: 'component',
              meta: { container: subComp.container || 'inline' }
            });
          }
        }
      });
    }
  });

  // Add workflow nodes
  allWorkflows.forEach(workflow => {
    nodes.push({
      id: `workflow:${workflow}`,
      label: `workflow<br>${workflow}`,
      category: 'workflow',
      meta: {
        cluster: 'WORKFLOWS',
        workflow: workflow,
        isWorkflowNode: true
      }
    });
  });

  return {
    nodes,
    edges: componentEdges,
    workflowEdges,
    meta: { title }
  };
}

async function generateMermaidFiles(app, layouts, pages) {
  console.log(`[generateMermaidFiles] 🎨 Generating Mermaid diagrams for ${app}`);

  const outputDir = path.resolve(__dirname, `./output/apps/${app}`);

  // Generate layout diagrams
  const layoutsDir = path.join(outputDir, 'layouts');
  await fs.mkdir(layoutsDir, { recursive: true });

  for (const layout of layouts) {
    // COMPLETION_DRIVE: Assuming toMermaid can handle single-component graphs
    const graphData = buildGraphDataForMermaid([layout], `Layout: ${layout.title || layout.eventType}`);
    const mermaid = toMermaid(graphData, { layout: 'LR', classStyling: true });
    const mermaidPath = path.join(layoutsDir, `${layout.eventType}.mmd`);
    await fs.writeFile(mermaidPath, mermaid);
    console.log(`🎨 Generated ${layout.eventType}.mmd`);
  }

  // Generate page diagrams grouped by pageFolder
  const pagesDir = path.join(outputDir, 'pages');
  await fs.mkdir(pagesDir, { recursive: true });

  const pageGroups = new Map();
  pages.forEach(page => {
    const folder = page.pageFolder || 'misc';
    if (!pageGroups.has(folder)) {
      pageGroups.set(folder, []);
    }
    pageGroups.get(folder).push(page);
  });

  // COMPLETION_DRIVE: Assuming toMermaid handles complex multi-component graphs properly  
  for (const [folderName, pageComponents] of pageGroups) {
    const graphData = buildGraphDataForMermaid(pageComponents, `Page: ${folderName}`);
    const mermaid = toMermaid(graphData, { layout: 'LR', classStyling: true });
    const mermaidPath = path.join(pagesDir, `${folderName}.mmd`);
    await fs.writeFile(mermaidPath, mermaid);
    console.log(`🎨 Generated ${folderName}.mmd with ${pageComponents.length} components`);
  }

  // Generate app overview - simplified high-level view
  // COMPLETION_DRIVE: Assuming overview should use same toMermaid for consistency
  const allComponents = [...layouts, ...pages];
  const overviewComponents = allComponents.filter(comp =>
    comp.category === 'page' || comp.category === 'appbar' || comp.category === 'sidebar'
  );

  const overviewGraphData = buildGraphDataForMermaid(overviewComponents, `App Overview: ${app}`);
  const overviewMermaid = toMermaid(overviewGraphData, { layout: 'TD', classStyling: true });
  const overviewPath = path.join(outputDir, 'app-overview.mmd');
  await fs.writeFile(overviewPath, overviewMermaid);
  console.log(`🎨 Generated app-overview.mmd with ${overviewComponents.length} major components`);
}

export default async function genAppMapping(app = 'plans') {
  console.log(`[genAppMapping] 🚀 Starting app mapping generation for: ${app}`);

  try {
    // Scan inputs
    const { layouts, pages, success, error } = await scanAppInputs(app);
    if (!success) {
      throw new Error(`Input scanning failed: ${error}`);
    }

    // Generate JSON configs
    await generateLayoutConfigs(app, layouts);
    await generatePageConfigs(app, pages);

    // Generate Mermaid diagrams
    await generateMermaidFiles(app, layouts, pages);

    console.log(`✅ App mapping generation completed for ${app}`);
    console.log(`   📊 ${layouts.length} layouts, ${pages.length} page components`);

  } catch (error) {
    console.error(`[genAppMapping] ❌ Error:`, error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = process.argv[2] || 'plans';
  genAppMapping(app).catch(console.error);
}