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

  // Get page_registry metadata from context_store (set by buildDMLData) or fallback to pageConfig.props
  let tableName, tableID, contextKey, parentID;

  // Try to get from context_store first (set by buildDMLData)
  const tableNameResult = await getVal('tableName', 'raw');
  tableName = tableNameResult?.resolvedValue || tableNameResult;

  const tableIDResult = await getVal('tableID', 'raw');
  tableID = tableIDResult?.resolvedValue || tableIDResult;

  const contextKeyResult = await getVal('contextKey', 'raw');
  contextKey = contextKeyResult?.resolvedValue || contextKeyResult;

  // Always get parentID from pageConfig.props (it's a field name like "[account_id]", not a value)
  const pageRegistry = context.pageConfig?.props;
  if (pageRegistry?.parentID) {
    parentID = pageRegistry.parentID;
  }

  // If not in context_store, fallback to pageConfig.props for other metadata
  if (!tableName || !tableID || !contextKey) {
    console.log('🔄 Falling back to pageConfig.props for metadata');
    
    if (!pageRegistry) {
      throw new Error('execDML: No table metadata found in context_store or pageConfig.props');
    }

    tableName = tableName || pageRegistry.tableName;
    tableID = tableID || pageRegistry.tableID;
    contextKey = contextKey || pageRegistry.contextKey;
  }

  console.log('📋 Full pageConfig:', context.pageConfig);
  console.log('📋 pageRegistry object:', pageRegistry);
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

  // Get form data from buildDMLData output in context_store
  const dmlDataResult = await getVal('dmlData', 'raw');
  const dmlDataString = dmlDataResult?.resolvedValue || dmlDataResult;

  if (!dmlDataString) {
    throw new Error('execDML: dmlData not found in context_store. Run buildDMLData before execDML.');
  }

  let formData;
  try {
    formData = JSON.parse(dmlDataString);
    console.log('✅ Using dmlData from buildDMLData:', formData);
  } catch (e) {
    throw new Error('execDML: Failed to parse dmlData from context_store: ' + e.message);
  }

  // For DELETE, only include the primary key (no need for other fields)
  if (method === 'DELETE') {
    const pkValue = formData[tableID];
    formData = pkValue ? { [tableID]: pkValue } : formData;
  }

  // buildDMLData already handles all data collection including account_id from contextStore
  // No additional injection needed here

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
