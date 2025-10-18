/**
 * Build DML Data Trigger
 * Collects specified fields from context_store into dmlData object
 * Used for composite data from multiple sources (grid selections, context values)
 *
 * @param {Object} params - { fields: ["field1", "field2", ...] }
 * @param {Object} context - Execution context with contextStore
 * @returns {Object} The built dmlData object
 */
export async function buildDMLData(params, context) {
  const { fields } = params;

  if (!fields || !Array.isArray(fields)) {
    throw new Error('buildDMLData: fields array is required');
  }

  // Import getVal to retrieve from context_store
  const { getVal, setVals } = await import('@whatsfresh/shared-imports');

  const dmlData = {};

  // Collect each field from context_store
  for (const fieldName of fields) {
    try {
      const result = await getVal(fieldName);
      if (result && result.resolvedValue !== undefined) {
        dmlData[fieldName] = result.resolvedValue;
      } else {
        console.warn(`⚠️ Field "${fieldName}" not found in context_store`);
      }
    } catch (error) {
      console.error(`❌ Failed to get field "${fieldName}":`, error);
    }
  }

  console.log('🔨 Built dmlData from context:', dmlData);

  // Store in context_store as dmlData
  await setVals([{ paramName: 'dmlData', paramVal: dmlData }]);

  return dmlData;
}
