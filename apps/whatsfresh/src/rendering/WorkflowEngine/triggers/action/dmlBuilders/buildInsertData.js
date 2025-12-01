/**
 * Build INSERT DML Data
 * Combines form data with parentID from context_store
 */
export async function buildInsertData(formData, pageRegistry, getVal) {
  const data = { ...formData };

  console.log('🔍 buildInsertData - pageRegistry.parentID:', pageRegistry.parentID);

  // Inject parentID if defined (e.g., account_id)
  if (pageRegistry.parentID) {
    const parentKey = pageRegistry.parentID.replace(/[\[\]]/g, ''); // [account_id] -> account_id

    if (!data[parentKey]) {
      const parentValueResult = await getVal(parentKey, 'raw');
      const parentValue = parentValueResult?.resolvedValue || parentValueResult;

      if (parentValue) {
        data[parentKey] = parentValue;
        console.log(`✅ Injected ${parentKey} = ${parentValue} for INSERT`);
      } else {
        console.warn(`⚠️ No value found for ${parentKey} in context_store`);
      }
    }
  }

  return data;
}
