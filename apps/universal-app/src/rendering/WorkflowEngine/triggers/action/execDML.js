/**
 * Execute DML operation (INSERT/UPDATE/DELETE) with page_registry integration
 * Auto-resolves table, primaryKey, and data from page context
 */
export async function execDML(content, context) {
  const { execDml, getVal } = await import('../../../../utils/api.js');

  console.log('💾 execDML triggered with context:', {
    hasPageConfig: !!context.pageConfig,
    hasFormData: !!context.formData,
    hasRowData: !!context.rowData,
    content,
    rowData: context.rowData
  });

  // Get page_registry metadata from pageConfig.props
  const pageRegistry = context.pageConfig?.props;

  if (!pageRegistry) {
    throw new Error('execDML: pageConfig.props not found in context');
  }

  const { tableName, tableID, contextKey, parentID } = pageRegistry;

  console.log('📋 Page registry loaded:', {
    tableName,
    tableID,
    contextKey,
    parentID
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
    const pkValue = formData[tableID];
    formData = pkValue ? { [tableID]: pkValue } : formData;
  }

  // Handle parentID for INSERT operations (e.g., account_id)
  if (method === 'INSERT' && parentID) {
    const parentKey = parentID.replace(/[\[\]]/g, ''); // Remove brackets: [account_id] -> account_id
    console.log(`🔍 Looking for parentID: ${parentKey} (from ${parentID})`);

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
    primaryKeyValue = context.rowData?.[tableID] || formData[tableID];
    
    // Fallback to context_store (for form operations)
    if (!primaryKeyValue) {
      const contextKeyResult = await getVal(contextKey, 'raw');
      primaryKeyValue = contextKeyResult?.resolvedValue || contextKeyResult;
    }

    if (!primaryKeyValue) {
      throw new Error(`${method} requires ${tableID} in rowData, formData, or ${contextKey} in context_store`);
    }

    formData[tableID] = primaryKeyValue;
  }

  const dmlRequest = {
    method,
    table: tableName,
    primaryKey: tableID,
    data: formData,
    parentID: parentID  // Send parentID to server for INSERT injection
  };

  console.log('💾 execDML request built:', dmlRequest);

  const result = await execDml(dmlRequest);

  if (result.success) {
    console.log(`✅ ${method} successful:`, result);

    // Handle INSERT: set contextKey with new insertId
    if (method === 'INSERT' && result.insertId) {
      console.log(`✅ INSERT successful, setting ${contextKey} = ${result.insertId}`);
      const { setVals } = await import('../../../../utils/api.js');
      await setVals([
        { paramName: contextKey, paramVal: result.insertId }
      ]);
    }

    // Clear formData after successful DML to prevent stale values
    if (context.setFormData) {
      console.log('🧹 Clearing formData after successful DML');
      context.setFormData({});
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
