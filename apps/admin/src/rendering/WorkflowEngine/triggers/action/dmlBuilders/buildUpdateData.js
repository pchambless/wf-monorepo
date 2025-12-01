/**
 * Build UPDATE DML Data
 * Combines form data with tableID (primary key) from context_store
 */
export async function buildUpdateData(formData, pageRegistry, getVal) {
  const data = { ...formData };

  // Inject tableID (primary key) for UPDATE
  if (pageRegistry.contextKey) {
    const contextKeyResult = await getVal(pageRegistry.contextKey, 'raw');
    const primaryKeyValue = contextKeyResult?.resolvedValue || contextKeyResult;

    if (primaryKeyValue) {
      data[pageRegistry.tableID] = primaryKeyValue;
      console.log(`✅ Injected ${pageRegistry.tableID} = ${primaryKeyValue} for UPDATE`);
    } else {
      console.warn(`⚠️ No value found for ${pageRegistry.contextKey} in context_store`);
    }
  }

  return data;
}
