/**
 * DML Operations Main Module
 * Orchestrates modular DML functionality for pageMap-driven architecture
 */
import { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
import { showDMLPreview } from './dmlPreview.jsx';
import { execEvent, createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('DML');

/**
 * Execute DML operation with preview confirmation
 * @param {Object} pageMap - Page configuration object
 * @param {Object} formData - Form data values
 * @param {string} method - DML method (INSERT/UPDATE/DELETE)
 * @param {boolean} skipPreview - Skip preview modal (for auto-approval)
 * @returns {Promise} Execution result
 */
export const executeDML = async (pageMap, formData, method, skipPreview = false) => {
  try {
    log.info(`Starting ${method} operation`, { 
      table: pageMap.systemConfig?.table,
      entityId: pageMap.systemConfig?.entityId 
    });

    // Build DML data and SQL preview
    const dmlData = buildDMLData(pageMap, formData, method);
    const sqlPreview = buildSQLPreview(pageMap, formData, method);
    
    log.debug('DML data prepared', { dmlData, sqlPreview });

    // Show preview unless skipped
    if (!skipPreview) {
      const approved = await showDMLPreview(
        dmlData, 
        sqlPreview, 
        method, 
        pageMap.systemConfig?.entityId || 'Unknown'
      );
      
      if (!approved) {
        log.info('DML operation cancelled by user');
        return { success: false, cancelled: true };
      }
    }

    // Execute the DML operation
    const eventType = pageMap.systemConfig?.dmlEvent || 'execDML';
    const result = await execEvent(eventType, dmlData);
    
    log.info(`${method} operation completed successfully`);
    return { 
      success: true, 
      result,
      dmlData,
      sqlPreview
    };

  } catch (error) {
    log.error(`${method} operation failed`, { error: error.message, stack: error.stack });
    throw new Error(`DML ${method} failed: ${error.message}`);
  }
};

/**
 * Convenience methods for specific DML operations
 */
export const insertRecord = (pageMap, formData, skipPreview = false) => 
  executeDML(pageMap, formData, 'INSERT', skipPreview);

export const updateRecord = (pageMap, formData, skipPreview = false) => 
  executeDML(pageMap, formData, 'UPDATE', skipPreview);

export const deleteRecord = (pageMap, formData, skipPreview = false) => 
  executeDML(pageMap, formData, 'DELETE', skipPreview);

/**
 * Preview-only function for testing SQL generation
 */
export const previewDML = (pageMap, formData, method) => {
  const dmlData = buildDMLData(pageMap, formData, method);
  const sqlPreview = buildSQLPreview(pageMap, formData, method);
  
  return { dmlData, sqlPreview };
};

// Re-export individual modules for direct access if needed
export { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
export { showDMLPreview } from './dmlPreview.jsx';
export { formatSQLValue, buildInsertSQL, buildUpdateSQL, buildDeleteSQL } from './sqlFormatter.js';