/**
 * Execute DML operation (INSERT/UPDATE/DELETE) with page_registry integration
 * Auto-resolves table, primaryKey, and data from page context
 */
export async function execDML(content, context) {
  const { execDml, getVal } = await import('@whatsfresh/shared-imports');
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
    contextKey: pageRegistry.contextKey
  });

  const methodResult = await getVal('method', 'raw');
  const method = methodResult?.resolvedValue || methodResult;

  if (!method) {
    throw new Error('Method not found in context_store. Set method via setVals before execDML.');
  }

  const formData = context.formData || {};

  let primaryKeyValue = null;
  if (method === 'UPDATE' || method === 'DELETE') {
    const selectedIDResult = await getVal('selectedID', 'raw');
    primaryKeyValue = selectedIDResult?.resolvedValue || selectedIDResult;

    if (!primaryKeyValue) {
      throw new Error(`${method} requires selectedID in context_store`);
    }

    formData[pageRegistry.tableID] = primaryKeyValue;
  }

  const dmlRequest = {
    method,
    table: pageRegistry.tableName,
    primaryKey: pageRegistry.tableID,
    data: formData
  };

  console.log('💾 execDML request built:', dmlRequest);

  const result = await execDml(dmlRequest);

  if (result.success && method === 'INSERT' && result.insertId) {
    console.log(`✅ INSERT successful, setting ${pageRegistry.contextKey} = ${result.insertId}`);
    const { setVals } = await import('@whatsfresh/shared-imports');
    await setVals([
      { paramName: pageRegistry.contextKey, paramVal: result.insertId },
      { paramName: 'selectedID', paramVal: result.insertId }
    ]);
  }

  return result;
}
