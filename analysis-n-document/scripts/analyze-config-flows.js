#!/usr/bin/env node
/**
 * Configuration-Driven Dependency Analysis
 * Maps runtime relationships through pageMap, eventTypes, navigation, routes
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

// Configuration file paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '../../');
const OUTPUT_DIR = path.join(ROOT_DIR, 'analysis-n-document/output');
const PUBLIC_DIR = path.join(ROOT_DIR, 'apps/wf-client/public/analysis-data');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Helper to safely require JSON/JS files
function safeRequire(filePath) {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) return null;
    
    if (filePath.endsWith('.json')) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } else if (filePath.endsWith('.js')) {
      // For JS files, we'll read and parse manually since they may use ES modules
      const content = fs.readFileSync(fullPath, 'utf8');
      return { content, path: filePath };
    }
  } catch (error) {
    console.warn(`Failed to load ${filePath}:`, error.message);
    return null;
  }
}

// Parse eventTypes from the JS file
function parseEventTypes() {
  const eventTypesFile = safeRequire('packages/shared-imports/src/events/client/eventTypes.js');
  if (!eventTypesFile) return [];
  
  const events = [];
  const content = eventTypesFile.content;
  
  // Simple regex parsing for eventType objects
  const eventMatches = content.match(/{\s*eventID:[^}]+}/g);
  if (eventMatches) {
    eventMatches.forEach(match => {
      const eventTypeMatch = match.match(/eventType:\s*["']([^"']+)["']/);
      const categoryMatch = match.match(/category:\s*["']([^"']+)["']/);
      const routeMatch = match.match(/routePath:\s*["']([^"']+)["']/);
      const dbTableMatch = match.match(/dbTable:\s*["']([^"']+)["']/);
      const navChildrenMatch = match.match(/navChildren:\s*\[(.*?)\]/);
      
      if (eventTypeMatch) {
        let navChildren = [];
        if (navChildrenMatch) {
          // Parse array of quoted strings
          const childrenStr = navChildrenMatch[1];
          const childMatches = childrenStr.match(/["']([^"']+)["']/g);
          if (childMatches) {
            navChildren = childMatches.map(m => m.replace(/["']/g, ''));
          }
        }
        
        events.push({
          eventType: eventTypeMatch[1],
          category: categoryMatch ? categoryMatch[1] : 'unknown',
          routePath: routeMatch ? routeMatch[1] : null,
          dbTable: dbTableMatch ? dbTableMatch[1] : null,
          navChildren: navChildren
        });
      }
    });
  }
  
  return events;
}

// Find all pageMap files
function findPageMaps() {
  const pageMaps = [];
  const pageMapFiles = glob.sync('apps/wf-client/src/pages/*/pageMap.js', { cwd: ROOT_DIR });
  
  pageMapFiles.forEach(filePath => {
    const pageMapContent = safeRequire(filePath);
    if (pageMapContent) {
      // Extract the page name from the path
      const pageName = filePath.split('/').slice(-2, -1)[0];
      pageMaps.push({
        pageName,
        filePath,
        content: pageMapContent.content
      });
    }
  });
  
  return pageMaps;
}

// Parse navigation config
function parseNavigation() {
  const navFile = safeRequire('apps/wf-client/src/config/navigation.js');
  if (!navFile) return [];
  
  const navItems = [];
  const content = navFile.content;
  
  // Simple regex to find eventType references
  const eventTypeMatches = content.match(/eventType:\s*["']([^"']+)["']/g);
  if (eventTypeMatches) {
    eventTypeMatches.forEach(match => {
      const eventType = match.match(/["']([^"']+)["']/)[1];
      navItems.push({ eventType });
    });
  }
  
  return navItems;
}

// Main analysis function
function analyzeConfigRelationships() {
  console.log('🔍 Analyzing configuration-driven relationships...');
  
  const eventTypes = parseEventTypes();
  const pageMaps = findPageMaps();
  const navigation = parseNavigation();
  
  console.log(`📄 Found ${eventTypes.length} event types`);
  console.log(`📋 Found ${pageMaps.length} page maps`);
  console.log(`🧭 Found ${navigation.length} navigation items`);
  
  const pageFlows = {};
  const configHotspots = [];
  const trulyDeadCode = [];
  const configOrphans = [];
  const hierarchicalRelationships = [];
  
  // Map page flows (including UI selectors)
  pageMaps.forEach(pageMap => {
    const { pageName, filePath } = pageMap;
    
    // Try to extract listEvent from pageMap content
    const listEventMatch = pageMap.content.match(/["']?listEvent["']?\s*:\s*["']([^"']+)["']/);
    const listEvent = listEventMatch ? listEventMatch[1] : null;
    
    if (listEvent) {
      const matchingEventType = eventTypes.find(et => et.eventType === listEvent);
      const inNavigation = navigation.some(nav => nav.eventType === listEvent);
      
      pageFlows[listEvent] = {
        component: `apps/wf-client/src/pages/${pageName}/index.jsx`,
        pageMap: filePath,
        eventType: matchingEventType ? `eventTypes.js:${listEvent}` : null,
        inNavigation,
        route: matchingEventType?.routePath || null,
        dbTable: matchingEventType?.dbTable || null,
        category: matchingEventType?.category || 'unknown'
      };
    }
  });

  // Add UI selectors and other important non-page eventTypes
  eventTypes.forEach(eventType => {
    if (!pageFlows[eventType.eventType] && 
        (eventType.category.includes('ui:select') || 
         eventType.category.includes('page:') ||
         eventType.navChildren.length > 0)) {
      pageFlows[eventType.eventType] = {
        component: eventType.category.includes('ui:select') ? 'UI Selector Component' : 'Non-page Component',
        pageMap: null,
        eventType: `eventTypes.js:${eventType.eventType}`,
        inNavigation: navigation.some(nav => nav.eventType === eventType.eventType),
        route: eventType.routePath || null,
        dbTable: eventType.dbTable || null,
        category: eventType.category
      };
    }
  });
  
  // Find config hotspots (eventTypes referenced by multiple pages)
  const eventTypeUsage = {};
  Object.values(pageFlows).forEach(flow => {
    if (flow.eventType) {
      const eventName = flow.eventType.split(':')[1];
      eventTypeUsage[eventName] = (eventTypeUsage[eventName] || 0) + 1;
    }
  });
  
  Object.entries(eventTypeUsage).forEach(([eventType, count]) => {
    if (count > 1) {
      configHotspots.push({
        eventType,
        config_dependents: count,
        reason: `Referenced by ${count} page components`
      });
    }
  });
  
  // Find orphaned eventTypes (defined but not used by any page)
  eventTypes.forEach(eventType => {
    if (!pageFlows[eventType.eventType]) {
      configOrphans.push({
        eventType: eventType.eventType,
        category: eventType.category,
        reason: 'EventType defined but not used by any page'
      });
    }
  });

  // Build hierarchical relationships from navChildren
  eventTypes.forEach(eventType => {
    if (eventType.navChildren && eventType.navChildren.length > 0) {
      eventType.navChildren.forEach(childEventType => {
        // Extract parameter from routes to show data flow
        const parentRoute = eventType.routePath || '';
        const childRoute = eventTypes.find(et => et.eventType === childEventType)?.routePath || '';
        
        // Extract parameter that flows from parent to child
        const parentParam = parentRoute.match(/:(\w+)/);
        const childParam = childRoute.match(/:(\w+)/);
        
        hierarchicalRelationships.push({
          parent: eventType.eventType,
          child: childEventType,
          parameterFlow: parentParam ? parentParam[1] : null,
          parentRoute: parentRoute,
          childRoute: childRoute
        });
      });
    }
  });
  
  return {
    metadata: {
      generated: new Date().toISOString(),
      analysis_type: 'configuration_relationships',
      total_page_flows: Object.keys(pageFlows).length,
      total_event_types: eventTypes.length,
      total_config_hotspots: configHotspots.length,
      total_config_orphans: configOrphans.length
    },
    page_flows: pageFlows,
    hierarchical_relationships: hierarchicalRelationships,
    configuration_hotspots: configHotspots,
    truly_dead_code: trulyDeadCode,
    config_orphans: configOrphans,
    raw_data: {
      event_types: eventTypes,
      navigation_items: navigation
    }
  };
}

// Generate Mermaid flow diagram
function generateMermaidDiagram(analysis) {
  let mermaid = 'graph TD\n';
  
  // Add page flows
  Object.entries(analysis.page_flows).forEach(([eventType, flow]) => {
    const pageName = flow.component.split('/').slice(-2, -1)[0];
    const cleanEventType = eventType.replace(/[^a-zA-Z0-9]/g, '_');
    
    mermaid += `  ${cleanEventType}[${eventType}]\n`;
    mermaid += `  ${pageName}_comp[${pageName} Component]\n`;
    mermaid += `  ${pageName}_map[${pageName} PageMap]\n`;
    
    // Add connections
    mermaid += `  ${pageName}_comp --> ${pageName}_map\n`;
    mermaid += `  ${pageName}_map --> ${cleanEventType}\n`;
    
    if (flow.dbTable) {
      mermaid += `  ${cleanEventType} --> ${flow.dbTable}_db[(${flow.dbTable})]\n`;
    }
    
    // Color coding by category
    if (flow.category === 'page:CrudLayout') {
      mermaid += `  style ${cleanEventType} fill:#e1f5fe\n`;
    }
  });
  
  // Add hotspots
  analysis.configuration_hotspots.forEach(hotspot => {
    const cleanEventType = hotspot.eventType.replace(/[^a-zA-Z0-9]/g, '_');
    mermaid += `  style ${cleanEventType} fill:#ffebee,stroke:#f44336,stroke-width:3px\n`;
  });
  
  return mermaid;
}

// Main execution
try {
  const analysis = analyzeConfigRelationships();
  
  // Add AI-optimized metadata
  analysis.metadata = {
    generated: new Date().toISOString(),
    analysis_type: 'configuration_relationships',
    ai_optimized: true,
    purpose: "Configuration-driven architecture analysis for AI agents"
  };

  // Write outputs
  const outputFile = path.join(OUTPUT_DIR, 'config-relationships.json');
  fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
  
  const publicFile = path.join(PUBLIC_DIR, 'config-analysis.json');
  fs.writeFileSync(publicFile, JSON.stringify(analysis, null, 2));
  
  // Write Mermaid diagram
  const mermaid = generateMermaidDiagram(analysis);
  const mermaidFile = path.join(OUTPUT_DIR, 'config-flow.mmd');
  fs.writeFileSync(mermaidFile, mermaid);
  
  console.log(`✅ Config analysis complete!`);
  console.log(`📁 AI-optimized output: ${outputFile}`);
  console.log(`📊 Mermaid diagram: ${mermaidFile}`);
  
  // Summary
  console.log(`\n📋 Summary:`);
  console.log(`   🔄 Page Flows: ${analysis.metadata.total_page_flows}`);
  console.log(`   🔥 Config Hotspots: ${analysis.metadata.total_config_hotspots}`);
  console.log(`   🏝️  Config Orphans: ${analysis.metadata.total_config_orphans}`);
  
} catch (error) {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
}