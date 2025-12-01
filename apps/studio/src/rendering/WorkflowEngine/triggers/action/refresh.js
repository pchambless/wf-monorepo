/**
 * Refresh target components by executing their onRefresh triggers
 *
 * Supports multiple formats:
 * 1. String: "userGrid" → refreshes single component
 * 2. Array: ["userGrid", "statsPanel"] → refreshes multiple components
 */
export async function refresh(content, context) {
  const { triggerEngine } = await import('../../TriggerEngine.js');

  // Normalize to array
  const componentIds = typeof content === 'string' ? [content] : content;

  if (!Array.isArray(componentIds)) {
    throw new Error(`refresh: content must be string or array, got ${typeof content}`);
  }

  console.log('🔄 refresh: Looking for components:', componentIds);

  // Execute onRefresh for each target component
  for (const componentId of componentIds) {
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
    const results = await triggerEngine.executeTriggers(component.workflowTriggers.onRefresh, refreshContext);

    // Extract data from results array (executeTriggers returns array of {trigger, result, success})
    const dataResult = results?.find(r => r.result?.data);
    if (dataResult && dataResult.result.data) {
      const compType = component.comp_type;
      const data = dataResult.result.data;
      
      console.log(`🔍 refresh: Component ${componentId} type is "${compType}", has setFormData: ${!!context.setFormData}`);
      
      if (compType === 'Grid' && context.setData) {
        // Grid: Store array data in dataStore
        console.log(`💾 Storing Grid data for ${componentId}:`, data);
        context.setData(prev => ({
          ...prev,
          [componentId]: data
        }));
      } else if (compType === 'Form' && context.setFormData && Array.isArray(data) && data.length > 0) {
        // Form: Populate formData with first row
        console.log(`💾 Populating Form data for ${componentId}:`, data[0]);
        context.setFormData(data[0]);
      } else {
        console.warn(`⚠️ refresh: Don't know how to handle component type "${compType}" for ${componentId}`);
      }
    }
  }
}

/**
 * Find component by id (comp_name) in pageConfig (recursive search)
 */
function findComponentById(pageConfig, componentId) {
  if (!pageConfig) return null;

  if (pageConfig.components) {
    for (const component of pageConfig.components) {
      if (component.id === componentId) return component;

      const found = searchComponentTree(component, componentId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Recursively search component tree for id (comp_name)
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