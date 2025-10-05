/**
 * Refresh target components by executing their onRefresh triggers
 * Content must be an array of component IDs: ["comp1", "comp2"]
 */
export async function refresh(content, context) {
  const { triggerEngine } = await import('../../TriggerEngine.js');

  if (!Array.isArray(content)) {
    throw new Error(`refresh: content must be an array, got ${typeof content}`);
  }

  console.log('🔄 refresh: Looking for components:', content);

  // Execute onRefresh for each target component
  for (const componentId of content) {
    const component = findComponentById(context.pageConfig, componentId);

    if (!component) {
      console.warn(`⚠️ refresh: Component not found: ${componentId}`);
      continue;
    }

    if (!component.workflowTriggers?.onRefresh) {
      console.warn(`⚠️ refresh: Component ${componentId} has no onRefresh trigger`);
      continue;
    }

    console.log(`🔄 refresh: Executing onRefresh for ${componentId}`, component.workflowTriggers.onRefresh);

    // Pass componentId so execEvent knows where to store data
    const refreshContext = { ...context, componentId };
    await triggerEngine.executeTriggers(component.workflowTriggers.onRefresh, refreshContext);
  }
}

/**
 * Find component by ID in pageConfig (recursive search)
 */
function findComponentById(pageConfig, componentId) {
  if (!pageConfig) return null;

  // Search in top-level components
  if (pageConfig.components) {
    for (const component of pageConfig.components) {
      if (component.id === componentId) return component;

      // Recursively search in child components
      const found = searchComponentTree(component, componentId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Recursively search component tree for ID
 */
function searchComponentTree(component, componentId) {
  if (component.id === componentId) return component;

  if (component.components) {
    for (const child of component.components) {
      const found = searchComponentTree(child, componentId);
      if (found) return found;
    }
  }

  return null;
}