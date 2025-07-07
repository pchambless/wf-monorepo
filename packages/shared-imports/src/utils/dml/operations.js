/**
 * DML Operations - JavaScript Only
 * Core DML functions without JSX dependencies for better compatibility
 */
import { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
import { execEvent } from '../../api/index.js';
import createLogger from '../logger.js';

const log = createLogger('DML');

/**
 * Execute DML operation (INSERT, UPDATE, DELETE) for given pageMap and form data
 */
export const executeDML = async (pageMap, formData, method, skipPreview = false) => {
    try {
        log.info(`Executing ${method} operation`, {
            pageMapId: pageMap?.id,
            formDataKeys: Object.keys(formData || {})
        });

        // Build DML data based on method
        const dmlData = buildDMLData(pageMap, formData, method);

        if (!skipPreview) {
            // Show preview first
            const preview = buildSQLPreview(dmlData);
            log.info('DML Preview:', preview);
        }

        // Execute via event system
        const result = await execEvent({
            eventType: 'dmlExecute',
            pageMap: pageMap,
            formData: formData,
            method: method,
            dmlData: dmlData
        });

        log.info('DML execution completed', { success: result?.success });
        return result;

    } catch (error) {
        log.error('DML execution failed:', error);
        throw error;
    }
};

/**
 * Convenience methods for specific operations
 */
export const insertRecord = (pageMap, formData, skipPreview = false) =>
    executeDML(pageMap, formData, 'INSERT', skipPreview);

export const updateRecord = (pageMap, formData, skipPreview = false) =>
    executeDML(pageMap, formData, 'UPDATE', skipPreview);

export const deleteRecord = (pageMap, formData, skipPreview = false) =>
    executeDML(pageMap, formData, 'DELETE', skipPreview);

/**
 * Preview DML without executing
 */
export const previewDML = (pageMap, formData, method) => {
    const dmlData = buildDMLData(pageMap, formData, method);
    return buildSQLPreview(dmlData);
};

// Re-export builder functions
export { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
export { formatSQLValue, buildInsertSQL, buildUpdateSQL, buildDeleteSQL } from './sqlFormatter.js';
