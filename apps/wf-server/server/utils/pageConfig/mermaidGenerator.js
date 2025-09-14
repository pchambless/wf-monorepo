/**
 * Mermaid Chart Generator - Converts page hierarchy to mermaid syntax
 * Generates clickable hierarchy visualizations for Studio UI
 */

import logger from "../logger.js";

const codeName = "[mermaidGenerator.js]";

/**
 * Generate mermaid chart syntax from resolved page hierarchy
 * @param {Object} resolvedEventType - The complete resolved page hierarchy
 * @param {Map} allEventTypes - Map of all discovered eventTypes
 * @returns {String} Mermaid chart syntax
 */
export function generateMermaidChart(resolvedEventType, allEventTypes) {
  logger.debug(`${codeName} Generating mermaid chart for ${resolvedEventType.eventType || 'page'}`);

  const lines = [
    'graph TD',  // Top-down flowchart
    ''
  ];

  const processedComponents = new Set();
  const componentStyles = new Map(); // Track individual component styles

  /**
   * Generate a safe node ID for mermaid
   */
  function getSafeNodeId(eventType, componentId) {
    const id = componentId || eventType || 'unknown';
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Get component category for styling
   */
  function getComponentCategory(component) {
    if (component.category) return component.category;
    if (component.eventType?.includes('page')) return 'page';
    if (component.eventType?.includes('column')) return 'container';
    if (component.eventType?.includes('tab')) return 'container';
    if (component.eventType?.includes('grid')) return 'widget';
    if (component.eventType?.includes('select')) return 'widget';
    return 'unknown';
  }

  /**
   * Get display name for component
   */
  function getDisplayName(component) {
    const eventType = component.eventType || component.id || 'unknown';
    const category = getComponentCategory(component);

    // Multiline Mermaid label using <br> for line break
    return `${eventType}\n ctgry: [${category}]`;
  }

  /**
   * Get background color from component props
   */
  function getBackgroundColor(component) {
    if (component.props?.style?.backgroundColor) {
      return component.props.style.backgroundColor;
    }

    // Default colors by category
    const categoryColors = {
      page: '#e1f5fe',
      container: '#f3e5f5',
      widget: '#e8f5e8',
      unknown: '#fff3e0'
    };

    const category = getComponentCategory(component);
    return categoryColors[category] || categoryColors.unknown;
  }

  /**
   * Recursively process component hierarchy
   */
  function processComponent(component, parentId = null) {
    const eventType = component.eventType || component.id || 'unknown';
    const nodeId = getSafeNodeId(eventType, component.id);

    // Avoid duplicate processing
    if (processedComponents.has(nodeId)) {
      return nodeId;
    }
    processedComponents.add(nodeId);

    const displayName = getDisplayName(component);
    const category = getComponentCategory(component);
    const backgroundColor = getBackgroundColor(component);

    // Define the node with display name and background color
    lines.push(`    ${nodeId}["${displayName}"]`);

    // Store style for this component
    componentStyles.set(nodeId, backgroundColor);

    // Add connection to parent
    if (parentId) {
      lines.push(`    ${parentId} --> ${nodeId}`);
    }

    // Process child components
    if (component.components && Array.isArray(component.components)) {
      for (const child of component.components) {
        processComponent(child, nodeId);
      }
    }

    return nodeId;
  }

  // Process the root component
  const rootNodeId = processComponent(resolvedEventType);

  // Add empty line before styling
  lines.push('');

  // Add individual styling for each component
  lines.push('    %% Individual component styling');
  componentStyles.forEach((backgroundColor, nodeId) => {
    lines.push(`    style ${nodeId} fill:${backgroundColor},stroke:#333,stroke-width:2px;`);
  });

  lines.push('');

  // Add click handlers for interactivity
  lines.push('    %% Click handlers for Studio integration');
  processedComponents.forEach(nodeId => {
    lines.push(`    click ${nodeId} href "javascript:window.selectEventTypeTab('${nodeId}')"`);
  });

  const mermaidChart = lines.join('\n');

  logger.debug(`${codeName} Generated mermaid chart with ${processedComponents.size} nodes`);
  return mermaidChart;
}

/**
 * Generate enhanced mermaid chart with metadata for Studio UI
 * @param {Object} resolvedEventType - The complete resolved page hierarchy  
 * @param {Map} allEventTypes - Map of all discovered eventTypes
 * @returns {Object} Enhanced mermaid data with chart + metadata
 */
export function generateEnhancedMermaidData(resolvedEventType, allEventTypes) {
  const chart = generateMermaidChart(resolvedEventType, allEventTypes);

  // Build component metadata for Studio UI
  const componentMap = new Map();

  function buildComponentMap(component, parentId = null, depth = 0) {
    const eventType = component.eventType || component.id || 'unknown';
    const nodeId = eventType.replace(/[^a-zA-Z0-9_]/g, '_');

    componentMap.set(nodeId, {
      eventType: eventType,
      displayName: getDisplayName(component),
      category: getComponentCategory(component),
      depth: depth,
      parentId: parentId,
      hasChildren: !!(component.components && component.components.length > 0),
      childCount: component.components ? component.components.length : 0,
      originalComponent: component
    });

    if (component.components && Array.isArray(component.components)) {
      for (const child of component.components) {
        buildComponentMap(child, nodeId, depth + 1);
      }
    }
  }

  function getDisplayName(component) {
    const eventType = component.eventType || component.id || 'unknown';
    let displayName = eventType
      .replace(/^(page|column|tab|grid|select)/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();

    if (!displayName) displayName = eventType;
    return displayName;
  }

  function getComponentCategory(component) {
    if (component.category) return component.category;
    if (component.eventType?.includes('page')) return 'page';
    if (component.eventType?.includes('column')) return 'container';
    if (component.eventType?.includes('tab')) return 'container';
    if (component.eventType?.includes('grid')) return 'widget';
    if (component.eventType?.includes('select')) return 'widget';
    return 'unknown';
  }

  buildComponentMap(resolvedEventType);

  return {
    chart: chart,
    componentMap: Object.fromEntries(componentMap),
    totalComponents: componentMap.size,
    maxDepth: Math.max(...Array.from(componentMap.values()).map(c => c.depth)),
    categories: [...new Set(Array.from(componentMap.values()).map(c => c.category))]
  };
}