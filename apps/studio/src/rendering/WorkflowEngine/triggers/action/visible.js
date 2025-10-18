/**
 * Set component visibility via runtime context (not persisted to database)
 *
 * Supports multiple formats:
 * 1. String: "loginForm" → sets loginForm to visible (true)
 * 2. Object: {"comp_name": "loginForm", "value": false}
 * 3. Key-value: {"loginForm": true, "{pageName}Form": false}
 * 4. Array of key-values: [{"loginForm": true}, {"{pageName}Form": false}]
 */
export async function visible(content, context) {
  // Initialize contextStore if it doesn't exist
  if (!context.contextStore) {
    context.contextStore = {};
  }

  const visibilityUpdates = [];

  if (typeof content === 'string') {
    // Format 1: Simple string "loginForm"
    visibilityUpdates.push({
      componentId: content,
      visible: true
    });
  } else if (Array.isArray(content)) {
    // Format 4: Array of key-value pairs [{"loginForm": true}, ...]
    content.forEach(item => {
      Object.entries(item).forEach(([compName, visible]) => {
        visibilityUpdates.push({
          componentId: compName,
          visible: visible
        });
      });
    });
  } else if (content?.comp_name !== undefined) {
    // Format 2: Object with comp_name property {"comp_name": "loginForm", "value": false}
    visibilityUpdates.push({
      componentId: content.comp_name,
      visible: content.value
    });
  } else if (typeof content === 'object') {
    // Format 3: Key-value object {"loginForm": true, "registerForm": false}
    Object.entries(content).forEach(([compName, visible]) => {
      visibilityUpdates.push({
        componentId: compName,
        visible: visible
      });
    });
  }

  // Update runtime context (not database)
  visibilityUpdates.forEach(({ componentId, visible }) => {
    const visibilityKey = `${componentId}_visible`;
    context.contextStore[visibilityKey] = visible;
    console.log(`👁️ visibility: ${componentId} = ${visible}`);
  });

  return { success: true, updated: visibilityUpdates.length };
}