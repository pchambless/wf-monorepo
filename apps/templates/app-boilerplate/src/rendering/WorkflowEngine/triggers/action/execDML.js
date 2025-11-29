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
    hasRowData: !!context.rowData,
    content,
    rowData: context.rowData
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

  // Get method from content (for rowActions) or context_store (for form operations)
  let method = content?.method;
  if (!method) {
    const methodResult = await getVal('method', 'raw');
    method = methodResult?.resolvedValue || methodResult;
  }

  if (!method) {
    throw new Error('Method not found in content or context_store. Set method via setVals or provide in trigger content.');
  }

  // Get form data from content.data (for rowActions) or context.formData (for form operations)
  let formData = content?.data || context.formData || context.rowData || {};

  // For DELETE, only include the primary key (no need for other fields)
  if (method === 'DELETE') {
    const pkValue = formData[pageRegistry.tableID];
    formData = pkValue ? { [pageRegistry.tableID]: pkValue } : formData;
  }

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
    // Try to get primary key from rowData first (for grid rowActions)
    primaryKeyValue = context.rowData?.[pageRegistry.tableID] || formData[pageRegistry.tableID];
    
    // Fallback to context_store (for form operations)
    if (!primaryKeyValue) {
      const contextKeyResult = await getVal(pageRegistry.contextKey, 'raw');
      primaryKeyValue = contextKeyResult?.resolvedValue || contextKeyResult;
    }

    if (!primaryKeyValue) {
      throw new Error(`${method} requires ${pageRegistry.tableID} in rowData, formData, or ${pageRegistry.contextKey} in context_store`);
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

  if (result.success) {
    console.log(`✅ ${method} successful:`, result);

    // Handle INSERT: set contextKey with new insertId
    if (method === 'INSERT' && result.insertId) {
      console.log(`✅ INSERT successful, setting ${pageRegistry.contextKey} = ${result.insertId}`);
      const { setVals } = await import('../../../../utils/api.js');
      await setVals([
        { paramName: pageRegistry.contextKey, paramVal: result.insertId }
      ]);
    }

    // Execute onSuccess workflow triggers if defined
    if (context.workflowTriggers?.onSuccess) {
      console.log('🔄 Executing onSuccess workflows...');
      const { triggerEngine } = await import('../../TriggerEngine.js');
      await triggerEngine.executeTriggers(context.workflowTriggers.onSuccess, context);
    }
  } else {
    console.error(`❌ ${method} failed:`, result);

    // Execute onError workflow triggers if defined
    if (context.workflowTriggers?.onError) {
      console.log('🔄 Executing onError workflows...');
      const { triggerEngine } = await import('../../TriggerEngine.js');
      await triggerEngine.executeTriggers(context.workflowTriggers.onError, context);
    }
  }

  return result;
}
