/**
 * execDML v2 - Bulletproof, Self-Contained Database Operations
 * 
 * Eliminates fragile multi-step dependencies by handling everything internally:
 * - Form data capture
 * - Metadata resolution  
 * - ParentID injection
 * - Database execution
 * 
 * Single atomic operation with comprehensive error handling.
 */

export async function execDML_v2(content, context) {
  const { execDml } = await import('../../../../utils/api.js');
  const { getPageByID } = await import('../../../../utils/pageRegistry.js');

  console.log('💾 execDML_v2: Starting atomic database operation');

  try {
    // Step 1: Validate required context
    const pageID = context.pageConfig?.pageID;
    if (!pageID) {
      throw new Error('execDML_v2: pageID required in context.pageConfig');
    }

    // Step 2: Get method (from content or context_store)
    let method = content?.method;
    if (!method) {
      const { getVal } = await import('../../../../utils/api.js');
      const methodResult = await getVal('method', 'raw');
      method = methodResult?.resolvedValue || methodResult;
    }

    if (!method || !['INSERT', 'UPDATE', 'DELETE'].includes(method)) {
      throw new Error(`execDML_v2: Invalid method "${method}". Must be INSERT, UPDATE, or DELETE`);
    }

    console.log(`💾 execDML_v2: Processing ${method} for pageID ${pageID}`);

    // Step 3: Load page metadata from registry (single source of truth)
    const pageRegistry = getPageByID(pageID);
    if (!pageRegistry) {
      throw new Error(`execDML_v2: Page not found in registry for pageID ${pageID}`);
    }

    const { tableName, tableID = 'id', contextKey, parentID } = pageRegistry;
    
    if (!tableName) {
      throw new Error(`execDML_v2: tableName not found for pageID ${pageID}`);
    }

    console.log(`💾 execDML_v2: Page metadata loaded:`, {
      tableName,
      tableID, 
      contextKey,
      parentID
    });

    // Step 4: Capture form data (internal, no external dependencies)
    let formData = content?.data || context.formData || {};
    
    // If no form data provided, try to capture from DOM
    if (Object.keys(formData).length === 0) {
      formData = await captureFormDataInternal();
    }

    console.log(`💾 execDML_v2: Form data captured:`, formData);

    // Step 5: Handle method-specific logic
    if (method === 'INSERT') {
      // Inject parentID for INSERT operations
      if (parentID) {
        const parentValue = await resolveParentIDInternal(parentID);
        if (parentValue) {
          const parentKey = parentID.replace(/[\[\]]/g, '');
          formData[parentKey] = parentValue;
          console.log(`💾 execDML_v2: Injected ${parentKey} = ${parentValue}`);
        }
      }
    } else if (method === 'UPDATE' || method === 'DELETE') {
      // Ensure primary key is present
      let primaryKeyValue = formData[tableID];
      
      if (!primaryKeyValue && contextKey) {
        const { getVal } = await import('../../../../utils/api.js');
        const pkResult = await getVal(contextKey, 'raw');
        primaryKeyValue = pkResult?.resolvedValue || pkResult;
      }

      if (!primaryKeyValue) {
        throw new Error(`execDML_v2: ${method} requires ${tableID} value`);
      }

      formData[tableID] = primaryKeyValue;
      
      // For DELETE, only send primary key
      if (method === 'DELETE') {
        formData = { [tableID]: primaryKeyValue };
      }
    }

    // Step 6: Build and execute DML request
    const dmlRequest = {
      method,
      table: tableName,
      primaryKey: tableID,
      data: formData
    };

    console.log(`💾 execDML_v2: Executing DML request:`, dmlRequest);

    const result = await execDml(dmlRequest);

    if (result.success) {
      console.log(`✅ execDML_v2: ${method} successful:`, result);

      // Handle INSERT success: set contextKey with new insertId
      if (method === 'INSERT' && result.insertId && contextKey) {
        const { setVals } = await import('../../../../utils/api.js');
        await setVals([{ paramName: contextKey, paramVal: result.insertId }]);
        console.log(`✅ execDML_v2: Set ${contextKey} = ${result.insertId}`);
      }

      return result;
    } else {
      throw new Error(`Database operation failed: ${result.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.error(`❌ execDML_v2: Operation failed:`, error);
    throw error;
  }
}

/**
 * Internal form data capture - no external dependencies
 */
async function captureFormDataInternal() {
  const formElement = document.getElementById('Form');
  if (!formElement) {
    console.warn('💾 execDML_v2: No form element found, using empty data');
    return {};
  }

  const formData = {};
  const inputs = formElement.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    if (fieldName) {
      if (input.type === 'checkbox') {
        formData[fieldName] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) {
          formData[fieldName] = input.value;
        }
      } else {
        formData[fieldName] = input.value;
      }
    }
  });

  return formData;
}

/**
 * Internal parentID resolution - no external dependencies
 */
async function resolveParentIDInternal(parentID) {
  if (!parentID) return null;

  const { getVal } = await import('../../../../utils/api.js');
  const parentKey = parentID.replace(/[\[\]]/g, '');
  
  const parentResult = await getVal(parentKey, 'raw');
  return parentResult?.resolvedValue || parentResult;
}