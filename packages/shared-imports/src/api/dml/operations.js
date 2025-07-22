/**
 * DML Operations - JavaScript Only
 * Core DML functions without JSX dependencies for better compatibility
 */
import { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
import { api } from '../index.js';
import { contextStore } from '@whatsfresh/shared-imports';
import createLogger from '../../utils/logger.js';

const log = createLogger('DML');
/**
 * Unified parameter resolution - consolidates all parameter sources
 */
const resolveAllParameters = (pageMap, formData) => {
    const eventType = pageMap?.id;

    // Start with form data as base
    const allParameters = { ...formData };

    // Auto-resolve contextual parameters if contextStore is available
    if (eventType && contextStore) {
        const contextParams = contextStore.getEventParams(eventType);

        // Merge context parameters (form data takes precedence)
        Object.entries(contextParams).forEach(([key, value]) => {
            if (allParameters[key] === undefined) {
                allParameters[key] = value;
            }
        });

        log.info('Context parameters resolved:', {
            eventType,
            contextParams: Object.keys(contextParams),
            merged: Object.keys(allParameters).filter(key => !formData?.[key])
        });
    }

    // Handle legacy parent ID patterns (for backward compatibility)
    const parentIdField = pageMap?.pageConfig?.parentIdField;
    if (parentIdField && !allParameters[parentIdField] && !allParameters._parentId) {
        log.warn(`No parent ID found for ${parentIdField} - hierarchical relationship may be incomplete`);
    }

    return allParameters;
};

/**
 * Execute DML operation with unified parameter resolution
 */
export const executeDML = async (pageMap, formData, method, skipPreview = false) => {
    try {
        log.info(`Executing ${method} operation`, {
            pageMapId: pageMap?.id,
            formDataKeys: Object.keys(formData || {})
        });

        // Unified parameter resolution in single step
        const allParameters = resolveAllParameters(pageMap, formData);

        log.info('Unified parameter resolution:', {
            formDataFields: Object.keys(formData || {}),
            contextFields: Object.keys(allParameters).filter(key => !formData?.[key]),
            totalFields: Object.keys(allParameters).length
        });

        // Build DML data with unified parameters
        const dmlData = buildDMLData(pageMap, allParameters, method);

        if (!skipPreview) {
            // Show preview first
            const preview = buildSQLPreview(pageMap, allParameters, method);
            log.info('DML Preview:', preview);
        }

        // Execute the actual DML operation via API
        const result = await api.execDml(method, dmlData);

        log.info(`DML ${method} executed successfully`, {
            method,
            table: dmlData.table
        });

        return {
            success: true,
            result,
            dmlData,
            method,
            message: `DML ${method} completed successfully`
        };

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
 * Preview DML without executing - with unified parameter resolution
 */
export const previewDML = (pageMap, formData, method) => {
    const allParameters = resolveAllParameters(pageMap, formData);
    return buildSQLPreview(pageMap, allParameters, method);
};

// Re-export builder functions
export { buildDMLData, buildSQLPreview } from './dmlBuilder.js';
export { formatSQLValue, buildInsertSQL, buildUpdateSQL, buildDeleteSQL } from './sqlFormatter.js';
