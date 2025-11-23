/**
 * Execute DML operation (INSERT/UPDATE/DELETE) with page_registry integration
 * Auto-resolves table, primaryKey, and data from page context
 */
export async function execDML(content, context) {
  const { execDml, getVal } = await import('../../../../utils/api.js');
  const { db } = await import('../../../../db/studioDb.js');

  console.log('💾 execDML triggered with context:', {
    hasPageConfig: !!context.pageConfig,
    hasFormData: !!context.formData,
    content
  });

  const pageID = context.pageConfig?.meta?.pageID;
  if (!pageID) {
    throw new Error('execDML requires pageID in context.pageConfig.meta.pageID');
  }

  const pageRegistry = await db.page_registry.where('id').equals(parseInt(pageID)).first();
  if (!pageRegistry) {
    throw new Error(`Page registry not found for pageID: ${pageID}`);
  }

  console.log('📋 Page registry loaded:', {
    pageName: pageRegistry.pageName,
    tableName: pageRegistry.tableName,
    tableID: pageRegistry.tableID,
    contextKey: pageRegistry.contextKey,
    parentID: pageRegistry.parentID
  });

  const methodResult = await getVal('method', 'raw');
  const method = methodResult?.resolvedValue || methodResult;

  if (!method) {
    throw new Error('Method not found in context_store. Set method via setVals before execDML.');
  }

  const formData = context.formData || {};

  // Handle parentID for INSERT operations (e.g., account_id)
  if (method === 'INSERT' && pageRegistry.parentID) {
    const parentKey = pageRegistry.parentID.replace(/[\[\]]/g, ''); // Remove brackets: [account_id] -> account_id
    console.log(`🔍 Looking for parentID: ${parentKey} (from ${pageRegistry.parentID})`);

    const parentValueResult = await getVal(parentKey, 'raw');
    console.log(`🔍 getVal result:`, parentValueResult);

    const parentValue = parentValueResult?.resolvedValue || parentValueResult;
    console.log(`🔍 Resolved parentValue:`, parentValue);

    if (parentValue) {
      formData[parentKey] = parentValue;
      console.log(`✅ Injected ${parentKey} = ${parentValue} for INSERT`);
    } else {
      console.warn(`⚠️ No value found for ${parentKey} in context_store`);
    }
  }

  let primaryKeyValue = null;
  if (method === 'UPDATE' || method === 'DELETE') {
    const contextKeyResult = await getVal(pageRegistry.contextKey, 'raw');
    primaryKeyValue = contextKeyResult?.resolvedValue || contextKeyResult;

    if (!primaryKeyValue) {
      throw new Error(`${method} requires ${pageRegistry.contextKey} in context_store`);
    }

    formData[pageRegistry.tableID] = primaryKeyValue;
  }

  const dmlRequest = {
    method,
    table: pageRegistry.tableName,
    primaryKey: pageRegistry.tableID,
    data: formData,
    parentID: pageRegistry.parentID  // Send parentID to server for INSERT injection
  };

  console.log('💾 execDML request built:', dmlRequest);

  const result = await execDml(dmlRequest);

  if (result.success && method === 'INSERT' && result.insertId) {
    console.log(`✅ INSERT successful, setting ${pageRegistry.contextKey} = ${result.insertId}`);
    const { setVals } = await import('../../../../utils/api.js');
    await setVals([
      { paramName: pageRegistry.contextKey, paramVal: result.insertId }
    ]);
  }

  return result;
}
