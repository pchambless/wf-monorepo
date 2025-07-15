import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the function directly from shared-imports/events to avoid loading UI components
import { getSafeEventTypes } from '@whatsfresh/shared-imports/events';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../../../eventTypes/generated/graphData.json');
const directivesPath = path.resolve(__dirname, '../../../../../automation/page/directives');

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

export default async function genEventTypes() {
  console.log('[genEventTypes] 🛠 Generating eventTypes graph data...');

  // Set app context to client for this generation
  process.env.APP_TYPE = 'client';
  
  // Get events directly - no more parsing needed!
  const events = getSafeEventTypes();
  console.log(`📊 Processing ${events.length} event types...`);

  // Build graph structure
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
      primaryKey: evt.primaryKey || null
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

  // Output structure with both navigation and widget data
  const output = {
    nodes,
    navigationEdges,
    widgetEdges,
    // Legacy support for existing charts
    edges: navigationEdges,
    meta: {
      generated: new Date().toISOString(),
      nodeCount: nodes.length,
      navigationEdgeCount: navigationEdges.length,
      widgetEdgeCount: widgetEdges.length,
      widgetUsageCount: widgetUsage.size
    }
  };

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ graphData.json written to ${outputPath}`);
  console.log(`   📊 ${nodes.length} nodes, ${navigationEdges.length} navigation edges, ${widgetEdges.length} widget edges`);
}