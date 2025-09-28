/**
 * Set component visibility via context store
 */
export async function visible(content, context) {
  const { setVals } = await import('@whatsfresh/shared-imports');

  // Format content for visibility control
  let componentName, value;

  if (typeof content === 'string') {
    // Simple format: "selectLoginApp"
    componentName = content;
    value = true;
  } else if (content?.comp_name !== undefined) {
    // Object format: {"comp_name": "selectLoginApp", "value": true}
    componentName = content.comp_name;
    value = content.value;
  }

  // Set visibility in context as componentName_visible
  const values = [{
    paramName: `${componentName}_visible`,
    paramVal: value
  }];

  return await setVals(values);
}