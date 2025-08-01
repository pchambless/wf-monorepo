import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the function directly from shared-imports/events to avoid loading UI components
import { getSafeEventTypes } from '@whatsfresh/shared-imports/events';
import { genGraphArtifacts } from '../utils/genGraphArtifacts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../output/eventTypes-graphData.json');
const directivesPath = path.resolve(__dirname, '../../packages/devtools/src/automation/data/directives');

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

export default async function genEventTypes() {
  console.log('[genEventTypes] 🛠 Generating eventTypes graph data...');

  // Set app context to client for this generation
  process.env.APP_TYPE = 'client';
  
  // Get events directly - no more parsing needed!
  const events = getSafeEventTypes();
  console.log(`📊 Processing ${events.length} event types...`);

  // Build graph structure with workflow data
  const nodes = events.map(evt => ({
    id: evt.eventType,
    label: `${evt.category}<br>${evt.eventType}<br>[:${Array.isArray(evt.params) ? evt.params.join(', :') : evt.params || ''}]`,
    category: evt.category || 'uncategorized',
    meta: {
      cluster: evt.cluster || 'UNGROUPED',
      dbTable: evt.dbTable,
      selWidget: evt.selWidget,
      method: evt.method,
      purpose: evt.purpose,
      primaryKey: evt.primaryKey || null,
      // Workflow integration data
      workflows: evt.workflows || [],
      workflowTriggers: evt.workflowTriggers || {},
      workflowConfig: evt.workflowConfig || {},
      hasWorkflows: !!(evt.workflows || evt.workflowTriggers)
    }
  }));

  // Generate navigation edges from navChildren
  const navigationEdges = [];
  events.forEach(evt => {
    const navChildren = evt.navChildren || [];
    navChildren.forEach(childID => {
      const child = events.find(e => e.eventType === childID);
      if (child) {
        navigationEdges.push({
          from: evt.eventType,
          to: childID,
          label: evt.primaryKey || '',
          type: 'navigation'
        });
      }
    });
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

  // Output structure with navigation, widget, and workflow data
  const output = {
    nodes: allNodes,
    navigationEdges,
    widgetEdges,
    workflowEdges,
    // Legacy support for existing charts
    edges: navigationEdges,
    meta: {
      generated: new Date().toISOString(),
      nodeCount: allNodes.length,
      eventNodeCount: nodes.length,
      workflowNodeCount: workflowNodes.length,
      navigationEdgeCount: navigationEdges.length,
      widgetEdgeCount: widgetEdges.length,
      workflowEdgeCount: workflowEdges.length,
      widgetUsageCount: widgetUsage.size,
      workflowEventCount: nodes.filter(n => n.meta.hasWorkflows).length
    }
  };

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ graphData.json written to ${outputPath}`);
  console.log(`   📊 ${output.meta.eventNodeCount} event nodes, ${output.meta.workflowNodeCount} workflow nodes`);
  console.log(`   🔗 ${navigationEdges.length} navigation edges, ${widgetEdges.length} widget edges, ${workflowEdges.length} workflow edges`);
  console.log(`   ⚙️  ${output.meta.workflowEventCount} eventTypes have workflow integration`);

  // Generate mermaid artifacts
  console.log('[genEventTypes] 🎨 Generating mermaid artifacts...');
  await genGraphArtifacts({
    key: 'eventTypes',
    graphData: output,
    graphName: 'eventTypes',
    graphTypes: ['mmd', 'md']
  });
}

// Execute the function if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  genEventTypes().catch(console.error);
}