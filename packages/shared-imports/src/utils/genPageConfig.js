import path from 'path';
import fs from 'fs/promises';
import { discoverEventTypes } from './eventTypeDiscovery.js';

/**
 * Generate pageConfig.js file from discovered eventTypes
 * Creates static configuration for page rendering
 */
export async function generatePageConfig(pageDir, primaryEventType, outputPath) {
  try {
    console.log(`🔍 Discovering eventTypes in ${pageDir}...`);
    
    const { eventTypes, dependencies, stats } = await discoverEventTypes(pageDir);
    
    console.log(`📊 Discovery results:`, stats);

    // Resolve component dependencies
    const resolvedComponents = resolveComponentDependencies(eventTypes, dependencies);
    
    // Build render tree starting from primary eventType
    const renderTree = buildRenderTree(eventTypes, primaryEventType, resolvedComponents);
    
    // Generate pageConfig structure
    const pageConfig = {
      primaryEventType,
      generatedAt: new Date().toISOString(),
      stats,
      eventTypes: eventTypes,
      renderTree: renderTree,
      componentMap: resolvedComponents,
      leafEventTypes: Object.keys(eventTypes).filter(name => eventTypes[name].fields),
      containerEventTypes: Object.keys(eventTypes).filter(name => eventTypes[name].components)
    };

    // Write pageConfig.js file
    const configCode = generatePageConfigCode(pageConfig);
    await fs.writeFile(outputPath, configCode, 'utf8');

    console.log(`✅ Generated pageConfig: ${outputPath}`);
    console.log(`🌳 Render tree depth: ${calculateTreeDepth(renderTree)}`);
    console.log(`🔗 Resolved ${Object.keys(resolvedComponents).length} component dependencies`);

    return pageConfig;

  } catch (error) {
    console.error(`❌ Error generating pageConfig:`, error);
    throw error;
  }
}

/**
 * Resolve component dependencies - map id references to actual eventTypes
 */
function resolveComponentDependencies(eventTypes, dependencies) {
  const resolved = {};

  for (const [parentName, componentIds] of Object.entries(dependencies)) {
    resolved[parentName] = [];

    for (const componentId of componentIds) {
      // Find eventType that matches this component ID
      const matchingEventType = Object.keys(eventTypes).find(name => 
        name === componentId || 
        name.toLowerCase().includes(componentId.toLowerCase())
      );

      if (matchingEventType) {
        resolved[parentName].push({
          id: componentId,
          eventType: matchingEventType,
          config: eventTypes[matchingEventType]
        });
      } else {
        console.warn(`⚠️  Unresolved component dependency: ${componentId} in ${parentName}`);
        resolved[parentName].push({
          id: componentId,
          eventType: null,
          config: null,
          unresolved: true
        });
      }
    }
  }

  return resolved;
}

/**
 * Build hierarchical render tree for page rendering
 */
function buildRenderTree(eventTypes, primaryEventType, resolvedComponents) {
  const visited = new Set();

  function buildNode(eventTypeName) {
    if (visited.has(eventTypeName)) {
      return { eventType: eventTypeName, circular: true };
    }

    visited.add(eventTypeName);
    const eventType = eventTypes[eventTypeName];

    if (!eventType) {
      return { eventType: eventTypeName, missing: true };
    }

    const node = {
      eventType: eventTypeName,
      category: eventType.category,
      title: eventType.title,
      config: eventType
    };

    // Add children if this is a container eventType
    if (resolvedComponents[eventTypeName]) {
      node.children = [];
      for (const component of resolvedComponents[eventTypeName]) {
        if (component.eventType && !component.unresolved) {
          const childNode = buildNode(component.eventType);
          node.children.push(childNode);
        } else {
          // Include unresolved components in tree for debugging
          node.children.push({
            eventType: component.id,
            unresolved: true,
            config: null
          });
        }
      }
    }

    // Add field information for leaf eventTypes
    if (eventType.fields) {
      node.fieldCount = eventType.fields.length;
      node.hasActions = eventType.actions && eventType.actions.length > 0;
      node.hasWorkflows = eventType.workflowTriggers && Object.keys(eventType.workflowTriggers).length > 0;
    }

    visited.delete(eventTypeName);
    return node;
  }

  return buildNode(primaryEventType);
}

/**
 * Generate the actual JavaScript code for pageConfig.js
 */
function generatePageConfigCode(pageConfig) {
  return `/**
 * Auto-generated PageConfig
 * Generated at: ${pageConfig.generatedAt}
 * Primary EventType: ${pageConfig.primaryEventType}
 * 
 * Stats:
 * - Total EventTypes: ${pageConfig.stats.totalEventTypes}
 * - Leaf EventTypes: ${pageConfig.stats.leafEventTypes}  
 * - Container EventTypes: ${pageConfig.stats.containerEventTypes}
 */

export const pageConfig = ${JSON.stringify(pageConfig, null, 2)};

export default pageConfig;
`;
}

/**
 * Calculate maximum depth of render tree
 */
function calculateTreeDepth(node, depth = 0) {
  if (!node.children || node.children.length === 0) {
    return depth;
  }

  let maxChildDepth = depth;
  for (const child of node.children) {
    const childDepth = calculateTreeDepth(child, depth + 1);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }

  return maxChildDepth;
}

/**
 * Validate pageConfig structure before generation
 */
export function validatePageConfig(pageConfig) {
  const errors = [];
  const warnings = [];

  // Check for missing primary eventType
  if (!pageConfig.eventTypes[pageConfig.primaryEventType]) {
    errors.push(`Primary eventType '${pageConfig.primaryEventType}' not found`);
  }

  // Check for unresolved dependencies
  for (const [parent, components] of Object.entries(pageConfig.componentMap)) {
    for (const component of components) {
      if (component.unresolved) {
        warnings.push(`Unresolved component '${component.id}' in '${parent}'`);
      }
    }
  }

  // Check for circular dependencies
  function checkCircular(node, path = []) {
    if (path.includes(node.eventType)) {
      errors.push(`Circular dependency detected: ${path.join(' → ')} → ${node.eventType}`);
      return;
    }

    if (node.children) {
      for (const child of node.children) {
        checkCircular(child, [...path, node.eventType]);
      }
    }
  }

  checkCircular(pageConfig.renderTree);

  return { errors, warnings, isValid: errors.length === 0 };
}

export default {
  generatePageConfig,
  validatePageConfig
};