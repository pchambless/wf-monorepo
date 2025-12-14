/**
 * buildDMLData v2 - Schema-Driven DML Data Construction
 * 
 * Uses dmlConfig from page_registry to construct complete dmlData
 * from multiple data sources (forms, grids, context, drag-drop, etc.)
 */

export async function buildDMLData_v2(params, context) {
  const { getVal, setVals } = await import('../../../../utils/api.js');
  const { getPageByID } = await import('../../../../utils/pageRegistry.js');

  console.log('🔨 buildDMLData_v2: Starting schema-driven construction');

  try {
    // Step 1: Get method and validate
    const methodResult = await getVal('method', 'raw');
    const method = methodResult?.resolvedValue || methodResult;

    if (!method) {
      throw new Error('buildDMLData_v2: method not found in context_store');
    }

    // Step 2: Get page metadata and dmlConfig
    const pageID = context.pageConfig?.pageID;
    if (!pageID) {
      throw new Error('buildDMLData_v2: pageID not found in context');
    }

    const pageRegistry = getPageByID(pageID);
    if (!pageRegistry) {
      throw new Error(`buildDMLData_v2: page not found in registry for pageID ${pageID}`);
    }

    // Step 3: Parse dmlConfig schema
    let dmlConfig;
    try {
      dmlConfig = JSON.parse(pageRegistry.dmlConfig || '{}');
    } catch (e) {
      console.warn('buildDMLData_v2: Invalid dmlConfig JSON, using empty schema');
      dmlConfig = {};
    }

    console.log('🔨 buildDMLData_v2: Using dmlConfig schema:', Object.keys(dmlConfig));

    // Step 4: Collect all available data sources
    const dataSources = await collectDataSources(context);
    
    console.log('🔨 buildDMLData_v2: Available data sources:', {
      formData: Object.keys(dataSources.formData),
      rowData: Object.keys(dataSources.rowData),
      contextStore: Object.keys(dataSources.contextStore),
      dragDropData: Object.keys(dataSources.dragDropData)
    });

    // Step 5: Build dmlData using schema
    const dmlData = {};
    const missingRequired = [];

    for (const [fieldName, fieldConfig] of Object.entries(dmlConfig)) {
      const value = await resolveFieldValue(fieldName, fieldConfig, dataSources);
      
      if (value !== undefined && value !== null && value !== '') {
        dmlData[fieldName] = value;
        console.log(`✅ ${fieldName} = ${value} (from ${fieldConfig.source})`);
      } else if (fieldConfig.required) {
        missingRequired.push(`${fieldName} (expected from ${fieldConfig.source})`);
      }
    }

    // Step 6: Validate required fields
    if (missingRequired.length > 0) {
      throw new Error(`buildDMLData_v2: Missing required fields: ${missingRequired.join(', ')}`);
    }

    // Step 7: Method-specific validation
    if (method === 'UPDATE' || method === 'DELETE') {
      const tableID = pageRegistry.tableID || 'id';
      if (!dmlData[tableID]) {
        throw new Error(`buildDMLData_v2: ${method} requires ${tableID} field`);
      }
    }

    console.log(`✅ buildDMLData_v2: Built ${method} data:`, dmlData);

    // Step 8: Store results in context_store
    await setVals([
      { paramName: 'tableName', paramVal: pageRegistry.tableName },
      { paramName: 'contextKey', paramVal: pageRegistry.contextKey },
      { paramName: 'tableID', paramVal: pageRegistry.tableID || 'id' },
      { paramName: 'dmlData', paramVal: JSON.stringify(dmlData) }
    ]);

    return dmlData;

  } catch (error) {
    console.error('❌ buildDMLData_v2 failed:', error);
    throw error;
  }
}

/**
 * Collect data from all possible sources
 */
async function collectDataSources(context) {
  const { getVal } = await import('../../../../utils/api.js');

  // Get form data from context_store (set by captureFormData)
  const dmlDataResult = await getVal('dmlData', 'raw');
  const formDataString = dmlDataResult?.resolvedValue || dmlDataResult;
  const formData = formDataString ? JSON.parse(formDataString) : {};

  // Get row data from context (grid selections)
  const rowData = context.rowData || context.selected || {};

  // Get all context store values
  const contextStore = {};
  // Note: We'd need to implement getAllContextValues() or get specific known values
  const knownContextKeys = ['account_id', 'user_id', 'brand_id', 'vendor_id', 'ingredient_type_id'];
  for (const key of knownContextKeys) {
    const result = await getVal(key, 'raw');
    const value = result?.resolvedValue || result;
    if (value !== undefined && value !== null) {
      contextStore[key] = value;
    }
  }

  // Get drag-drop data from context (if available)
  const dragDropData = context.dragDropData || {};

  return {
    formData,
    rowData,
    contextStore,
    dragDropData,
    systemData: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

/**
 * Resolve field value from data sources based on schema config
 */
async function resolveFieldValue(fieldName, fieldConfig, dataSources) {
  const sources = fieldConfig.source.split('|'); // Support "formData|contextStore"
  
  for (const source of sources) {
    const sourceData = dataSources[source.trim()];
    if (sourceData && sourceData[fieldName] !== undefined) {
      return sourceData[fieldName];
    }
  }

  // Handle system-generated values
  if (fieldConfig.value) {
    if (fieldConfig.value === 'NOW()') {
      return new Date().toISOString();
    }
    return fieldConfig.value;
  }

  return undefined;
}