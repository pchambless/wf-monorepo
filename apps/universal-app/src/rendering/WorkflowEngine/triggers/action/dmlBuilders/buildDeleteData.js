/**
 * Build DELETE DML Data
 * Returns just the tableID (primary key) from context_store
 */
export async function buildDeleteData(pageRegistry, getVal) {
  const data = {};

  // Inject tableID (primary key) for DELETE
  if (pageRegistry.contextKey) {
    const contextKeyResult = await getVal(pageRegistry.contextKey, 'raw');
    const primaryKeyValue = contextKeyResult?.resolvedValue || contextKeyResult;

    if (primaryKeyValue) {
      data[pageRegistry.tableID] = primaryKeyValue;
      console.log(`✅ Injected ${pageRegistry.tableID} = ${primaryKeyValue} for DELETE`);
    } else {
      throw new Error(`DELETE requires ${pageRegistry.contextKey} in context_store`);
    }
  }

  return data;
}
