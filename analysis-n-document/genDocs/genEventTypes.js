import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the new API function for fetching studio eventTypes
import { fetchStudioEventTypes } from '@whatsfresh/shared-imports/api';
import { genGraphArtifacts } from './utils/genGraphArtifacts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, './output/apps');
const directivesPath = path.resolve(__dirname, '../../packages/devtools/src/automation/data/directives');

/**
 * Generate the file path for an eventType based on new directory structure
 */
function generateEventTypePath(app, eventType) {
  const eventTypeId = eventType.eventType;
  const category = eventType.category;
  
  // Map eventTypes to their file paths in the new structure
  if (category === 'sidebar' || eventTypeId === 'sidebar') {
    return `packages/shared-imports/src/events/${app}/eventTypes/app/sidebar.js`;
  } else if (category === 'appbar' || eventTypeId === 'appbar') {
    return `packages/shared-imports/src/events/${app}/eventTypes/app/appbar.js`;
  } else if (category === 'page') {
    // Page components in pages/[pageName]/layout/
    const pageName = eventTypeId.replace(/^page/, '').toLowerCase();
    return `packages/shared-imports/src/events/${app}/eventTypes/pages/${pageName}/layout/${eventTypeId}.js`;
  } else if (category === 'tabs' || eventTypeId.startsWith('tabs')) {
    // Tabs components
    return `packages/shared-imports/src/events/${app}/eventTypes/pages/planManager/layout/${eventTypeId}.js`;
  } else if (category === 'tab' || eventTypeId.startsWith('tab')) {
    // Individual tab components
    return `packages/shared-imports/src/events/${app}/eventTypes/pages/planManager/layout/${eventTypeId}.js`;
  } else if (['grid', 'form', 'ui:Select'].includes(category)) {
    // Query components
    return `packages/shared-imports/src/events/${app}/eventTypes/pages/planManager/query/${eventTypeId}.js`;
  } else {
    // Default fallback
    return `packages/shared-imports/src/events/${app}/eventTypes/${eventTypeId}.js`;
  }
}

/**
 * Scan directive files to find widget usage patterns
 */
async function analyzeWidgetUsage(events) {
  const widgetUsage = new Map(); // eventType -> [{ widget, field }]

  try {
    const directiveFiles = await fs.readdir(directivesPath);

    for (const file of directiveFiles) {
      if (!file.endsWith('.json')) continue;

      const eventType = file.replace('.json', '');
      const filePath = path.join(directivesPath, file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const directive = JSON.parse(content);

        const widgets = [];

        // Scan all fields for widget properties
        if (directive.columns) {
          Object.entries(directive.columns).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.directives?.widget) {
              widgets.push({
                widget: fieldConfig.directives.widget,
                field: fieldName
              });
            }
          });
        }

        if (widgets.length > 0) {
          widgetUsage.set(eventType, widgets);
        }

      } catch (parseError) {
        console.warn(`⚠️  Could not parse directive file: ${file}`);
      }
    }

  } catch (dirError) {
    console.warn(`⚠️  Could not read directives directory: ${directivesPath}`);
  }

  return widgetUsage;
}

/**
 * Generate widget relationship edges from directive analysis
 */
function generateWidgetEdges(events, widgetUsage) {
  const widgetEdges = [];

  // Map selWidget to eventType for reverse lookup
  const widgetToEventType = new Map();
  events.forEach(evt => {
    if (evt.selWidget) {
      widgetToEventType.set(evt.selWidget, evt.eventType);
    }
  });

  // Create edges from widget usage to widget source eventType
  widgetUsage.forEach((widgets, eventType) => {
    widgets.forEach(({ widget, field }) => {
      const sourceEventType = widgetToEventType.get(widget);
      if (sourceEventType && sourceEventType !== eventType) {
        widgetEdges.push({
          from: sourceEventType,
          to: eventType,
          label: field,
          type: 'widget',
          widget: widget
        });
      }
    });
  });

  return widgetEdges;
}

/**
 * Generate workflow nodes and edges from eventType workflow configurations
 */
function generateWorkflowData(events) {
  const workflowNodes = [];
  const workflowEdges = [];
  const allWorkflows = new Set();

  // Collect all unique workflows
  events.forEach(evt => {
    if (!evt.workflows && !evt.workflowTriggers) return;

    // Add direct workflows
    if (evt.workflows) {
      evt.workflows.forEach(workflow => allWorkflows.add(workflow));
    }

    // Add trigger workflows
    if (evt.workflowTriggers) {
      Object.values(evt.workflowTriggers).forEach(triggerWorkflows => {
        if (Array.isArray(triggerWorkflows)) {
          triggerWorkflows.forEach(workflow => allWorkflows.add(workflow));
        }
      });
    }
  });

  // Create workflow nodes
  allWorkflows.forEach(workflow => {
    workflowNodes.push({
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

  // Create edges from eventTypes to workflows
  events.forEach(evt => {
    if (!evt.workflows && !evt.workflowTriggers) return;

    const eventWorkflows = new Set();

    // Add direct workflows
    if (evt.workflows) {
      evt.workflows.forEach(workflow => eventWorkflows.add(workflow));
    }

    // Add trigger workflows
    if (evt.workflowTriggers) {
      Object.values(evt.workflowTriggers).forEach(triggerWorkflows => {
        if (Array.isArray(triggerWorkflows)) {
          triggerWorkflows.forEach(workflow => eventWorkflows.add(workflow));
        }
      });
    }

    // Create edges from eventType to workflows
    eventWorkflows.forEach(workflow => {
      const triggers = [];

      // Find which triggers use this workflow
      if (evt.workflowTriggers) {
        Object.entries(evt.workflowTriggers).forEach(([trigger, workflows]) => {
          if (Array.isArray(workflows) && workflows.includes(workflow)) {
            triggers.push(trigger);
          }
        });
      }

      workflowEdges.push({
        from: evt.eventType,
        to: `workflow:${workflow}`,
        label: triggers.length > 0 ? triggers.join(',') : 'direct',
        type: 'workflow',
        workflow: workflow,
        triggers: triggers,
        config: evt.workflowConfig || {}
      });
    });
  });

  return { workflowNodes, workflowEdges };
}

export default async function genEventTypes(app = 'plans') {
  console.log(`[genEventTypes] 🛠 Generating eventTypes graph data for app: ${app}...`);

  try {
    // Fetch eventTypes using the new API
    const response = await fetchStudioEventTypes(app);
    if (!response.success) {
      throw new Error(`Failed to fetch eventTypes: ${response.message}`);
    }
    
    const events = response.eventTypes;
    console.log(`📊 Processing ${events.length} event types for ${app}...`
      + `\n   Layout: ${response.meta.layoutCount}, Query: ${response.meta.queryCount}`);

    // Build graph structure with component data
    const nodes = events.map(evt => ({
      id: evt.eventType,
      label: `${evt.category}<br>${evt.eventType}<br>[${evt.title || ''}]`,
      category: evt.category || 'uncategorized',
      meta: {
        cluster: evt.cluster || 'UNGROUPED',
        app: app,
        title: evt.title,
        purpose: evt.purpose,
        routePath: evt.routePath,
        // File path for Studio to load eventType source
        filePath: generateEventTypePath(app, evt),
        // Component structure data
        components: evt.components || [],
        hasComponents: !!(evt.components && evt.components.length > 0),
        componentCount: evt.components ? evt.components.length : 0,
        // Legacy workflow data (if still present)
        workflows: evt.workflows || [],
        workflowTriggers: evt.workflowTriggers || {},
        hasWorkflows: !!(evt.workflows || evt.workflowTriggers)
      }
    }));

    // Skip navigation edges - using components[] now for cleaner hierarchy
    const navigationEdges = [];

    // Generate component edges from components array
    const componentEdges = [];
    events.forEach(evt => {
      if (evt.components) {
        evt.components.forEach(component => {
          if (component.event) {
            // Find the referenced eventType
            const targetEvent = events.find(e => e.eventType === component.event);
            if (targetEvent) {
              componentEdges.push({
                from: evt.eventType,
                to: component.event,
                label: component.type,
                type: 'component',
                componentId: component.id,
                componentType: component.type,
                position: component.position,
                span: component.span
              });
            } else {
              console.warn(`⚠️  Component edge skipped: ${evt.eventType} -> ${component.event} (target eventType not found)`);
            }
          }
        });
      }
    });

  // Analyze directive files for widget usage
  console.log('🔍 Analyzing directive files for widget usage...');
  const widgetUsage = await analyzeWidgetUsage(events);
  console.log(`📋 Found widget usage in ${widgetUsage.size} directive files`);

  // Generate widget relationship edges
  const widgetEdges = generateWidgetEdges(events, widgetUsage);
  console.log(`🔗 Generated ${widgetEdges.length} widget relationship edges`);

  // Generate workflow nodes and edges
  console.log('⚙️  Analyzing workflow relationships...');
  const { workflowNodes, workflowEdges } = generateWorkflowData(events);
  console.log(`🔧 Generated ${workflowNodes.length} workflow nodes and ${workflowEdges.length} workflow edges`);

  // Combine nodes to include workflow nodes
  const allNodes = [...nodes, ...workflowNodes];

    // Output structure with navigation, component, widget, and workflow data
    const output = {
      app: app,
      nodes: allNodes,
      navigationEdges,
      componentEdges,
      widgetEdges,
      workflowEdges,
      // Legacy support for existing charts
      edges: [...navigationEdges, ...componentEdges],
      meta: {
        generated: new Date().toISOString(),
        app: app,
        nodeCount: allNodes.length,
        eventNodeCount: nodes.length,
        workflowNodeCount: workflowNodes.length,
        navigationEdgeCount: navigationEdges.length,
        componentEdgeCount: componentEdges.length,
        widgetEdgeCount: widgetEdges.length,
        workflowEdgeCount: workflowEdges.length,
        widgetUsageCount: widgetUsage.size,
        workflowEventCount: nodes.filter(n => n.meta.hasWorkflows).length,
        componentEventCount: nodes.filter(n => n.meta.hasComponents).length
      }
    };

    // App-specific output path
    await fs.mkdir(path.resolve(outputDir, app), { recursive: true });
    const outputPath = path.resolve(outputDir, app, `eventTypes-${app}-graphData.json`);
    
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ graphData.json written to ${outputPath}`);
    console.log(`   📊 ${output.meta.eventNodeCount} event nodes, ${output.meta.workflowNodeCount} workflow nodes`);
    console.log(`   🔗 ${navigationEdges.length} navigation edges, ${componentEdges.length} component edges, ${widgetEdges.length} widget edges, ${workflowEdges.length} workflow edges`);
    console.log(`   ⚙️  ${output.meta.workflowEventCount} eventTypes have workflow integration`);
    console.log(`   🧩 ${componentEdges.length} component relationships found`);

    // Generate mermaid artifacts for the specific app
    console.log(`[genEventTypes] 🎨 Generating mermaid artifacts for ${app}...`);

    // Generate app-specific mermaid in app subfolder
    await genGraphArtifacts({
      key: `eventTypes-${app}`,
      graphData: output,
      graphName: `eventTypes-${app}`,
      graphTypes: ['mmd', 'json'],
      outputSubDir: app
    });

    console.log(`✅ Mermaid artifacts generated for ${app}`);
    
  } catch (error) {
    console.error(`[genEventTypes] ❌ Error generating eventTypes for ${app}:`, error);
    throw error;
  }
}

// Execute the function if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = process.argv[2] || 'plans';
  genEventTypes(app).catch(console.error);
}

