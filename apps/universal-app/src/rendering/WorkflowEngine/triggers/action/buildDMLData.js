/**
 * buildDMLData - Schema-Driven DML Data Construction
 *
 * Reads dataSource configuration from columnOverrides in page structure
 * Merges data from multiple sources: formData, rowData, contextStore
 * Stores result in context_store.dmlData for execDML consumption
 */

import { createLogger } from '../../../../utils/logger.js';
const log = createLogger('buildDMLData', 'debug');

export async function buildDMLData(params, context) {
  const { getVal, setVals } = await import('../../../../utils/api.js');
  const { getPageByID } = await import('../../../../utils/pageRegistry.js');

  try {
    // Step 1: Get method and validate
    const methodResult = await getVal('method', 'raw');
    const method = methodResult?.resolvedValue || methodResult;

    if (!method) {
      throw new Error('buildDMLData: method not found in context_store');
    }

    // Step 2: Get page metadata
    const pageID = context.pageConfig?.pageID;
    if (!pageID) {
      throw new Error('buildDMLData: pageID not found in context');
    }

    const pageRegistry = getPageByID(pageID);
    if (!pageRegistry) {
      throw new Error(`buildDMLData: page not found in registry for pageID ${pageID}`);
    }

    console.log(`🔨 buildDMLData: ${method} for ${pageRegistry.tableName}`);
    console.log(`🔨 buildDMLData page registry:`, { 
      pageID, 
      pageName: pageRegistry.pageName, 
      tableName: pageRegistry.tableName, 
      contextKey: pageRegistry.contextKey 
    });

    // Step 3: Get columns and columnOverrides from page structure
    const { columns, columnOverrides } = await getPageColumnSchema(pageID);

    // Step 4: Collect all available data sources
    const dataSources = await collectDataSources(context, columns);

    // Step 5: Build dmlData using schema-driven approach
    const dmlData = {};
    const missingRequired = [];

    for (const column of columns) {
      const fieldName = column.name;
      const fieldConfig = columnOverrides[fieldName] || {};
      
      // Determine data source (explicit or smart default)
      const dataSource = getDataSource(fieldName, fieldConfig, column);
      
      // Get value from appropriate source
      const value = await getValueFromSource(dataSource, fieldName, dataSources);
      
      // For INSERT operations, skip the id field (auto-generated)
      if (fieldName === 'id' && method === 'INSERT') {
        continue; // Skip id field for INSERT operations
      }

      // Include value if it's defined (even if empty string or null)
      if (value !== undefined) {
        dmlData[fieldName] = value;
      }
      // Validate required fields
      else if (fieldConfig.required && fieldName !== 'id') {
        missingRequired.push(`${fieldName} (expected from ${dataSource})`);
      }
    }

    // Step 6: Validate required fields
    if (missingRequired.length > 0) {
      throw new Error(`buildDMLData: Missing required fields: ${missingRequired.join(', ')}`);
    }

    console.log(`✅ buildDMLData: Built ${method} data with ${Object.keys(dmlData).length} fields`);

    // Step 7: Store results in context_store (temporary revert to fix render loop)
    await setVals([
      { paramName: 'tableName', paramVal: pageRegistry.tableName },
      { paramName: 'contextKey', paramVal: pageRegistry.contextKey },
      { paramName: 'tableID', paramVal: pageRegistry.tableID || 'id' },
      { paramName: 'dmlData', paramVal: JSON.stringify(dmlData) }
    ]);

    return dmlData;

  } catch (error) {
    console.error('❌ buildDMLData failed:', error);
    throw error;
  }
}

/**
 * Get columns and columnOverrides from page structure
 */
async function getPageColumnSchema(pageID) {
  // Get page structure from sp_pageStructure
  const { execEvent } = await import('../../../../utils/api.js');
  const response = await execEvent('fetchPageStructure', { pageID });
  
  if (!response.data || response.data.length === 0) {
    throw new Error(`No page structure found for pageID ${pageID}`);
  }

  // Find Form component with columns
  const formComponent = response.data.find(comp => 
    comp.comp_type === 'Form' && comp.props?.columns
  );

  if (!formComponent) {
    throw new Error(`No Form component with columns found for pageID ${pageID}`);
  }

  // Parse columns and columnOverrides
  const columns = JSON.parse(formComponent.props.columns || '[]');
  const columnOverrides = JSON.parse(formComponent.props.columnOverrides || '{}');

  console.log(`🔨 buildDMLData fetched columns for pageID ${pageID}:`, columns.map(c => c.name));
  console.log(`🔨 buildDMLData columnOverrides keys:`, Object.keys(columnOverrides));

  return { columns, columnOverrides };
}

/**
 * Determine data source for a field (explicit or smart default)
 */
function getDataSource(fieldName, fieldConfig, column) {
  // Explicit dataSource takes priority
  if (fieldConfig.dataSource) {
    return fieldConfig.dataSource;
  }

  // Smart defaults based on field characteristics
  if (fieldConfig.hidden) {
    if (fieldName === 'id') return 'tableID';      // Primary key
    if (fieldName.endsWith('_id')) return 'parentID'; // Foreign keys
    return 'contextStore';                          // Other hidden fields
  }

  // Visible fields default to form input
  return 'formData';
}

/**
 * Collect data from all possible sources
 * Note: contextStore is returned as a getter function to query on-demand
 */
async function collectDataSources(context, columns) {
  const { getVal } = await import('../../../../utils/api.js');

  // Get form data from context_store (set by captureFormData)
  const dmlDataResult = await getVal('dmlData', 'raw');
  const formDataString = dmlDataResult?.resolvedValue || dmlDataResult;
  const formData = formDataString ? JSON.parse(formDataString) : {};

  // Get row data from context (grid selections)
  const rowData = context.rowData || context.selected || {};

  // Return sources with contextStore as on-demand query function
  return {
    formData,
    rowData,
    contextStore: async (fieldName) => {
      try {
        const result = await getVal(fieldName, 'raw');
        return result?.resolvedValue || result;
      } catch (error) {
        // Return undefined for missing keys (normal for INSERT operations)
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return undefined;
        }
        throw error;
      }
    },
    dragDropData: context.dragDropData || {},
    systemData: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

/**
 * Get value from specified data source
 */
async function getValueFromSource(dataSource, fieldName, dataSources) {
  const sources = dataSource.split('|'); // Support "formData|contextStore"

  for (const source of sources) {
    const sourceName = source.trim();

    // Handle semantic source types
    if (sourceName === 'tableID') {
      // Primary key comes from rowData (for UPDATE/DELETE)
      const value = dataSources.rowData?.[fieldName];
      if (value !== undefined) {
        log.debug(`Got ${fieldName} from rowData (tableID): ${value}`);
        return value;
      }
    }
    else if (sourceName === 'parentID') {
      // Foreign key comes from context_store database (via API)
      const value = await dataSources.contextStore(fieldName);
      if (value !== undefined) {
        log.debug(`Got ${fieldName} from context_store (parentID): ${value}`);
        return value;
      }
    }
    else if (sourceName === 'contextStore' && typeof dataSources.contextStore === 'function') {
      // Explicit contextStore query
      const value = await dataSources.contextStore(fieldName);
      if (value !== undefined) {
        log.debug(`Got ${fieldName} from contextStore: ${value}`);
        return value;
      }
    }
    else {
      // Standard sources (formData, rowData, dragDropData, etc.)
      const sourceData = dataSources[sourceName];
      if (sourceData && sourceData[fieldName] !== undefined) {
        log.debug(`Got ${fieldName} from ${sourceName}: ${sourceData[fieldName]}`);
        return sourceData[fieldName];
      }
    }
  }

  // Handle system-generated values
  if (dataSource === 'system') {
    if (fieldName.includes('created_at') || fieldName.includes('updated_at')) {
      return new Date().toISOString();
    }
  }

  return undefined;
}