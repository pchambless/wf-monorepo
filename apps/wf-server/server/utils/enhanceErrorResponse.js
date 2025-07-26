/**
 * Enhanced Error Response Utility (Server-Local)
 * Transforms database errors into actionable client debugging information
 */

import logger from './logger.js';

/**
 * Classify database errors into business-meaningful categories
 */
function classifyDatabaseError(error) {
  // Foreign key constraint violations
  if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
    return {
      businessMessage: 'Cannot delete record - has dependent child records',
      constraint: extractConstraintName(error.sqlMessage || error.message),
      category: 'referential_integrity',
      severity: 'warn'
    };
  }

  // Duplicate key violations
  if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
    return {
      businessMessage: 'Record already exists with this identifier',
      constraint: extractConstraintName(error.sqlMessage || error.message),
      category: 'duplicate_entry',
      severity: 'warn'
    };
  }

  // Missing required fields
  if (error.code === 'ER_NO_DEFAULT_FOR_FIELD' || error.errno === 1364) {
    return {
      businessMessage: 'Required field missing from request',
      constraint: extractFieldName(error.sqlMessage || error.message),
      category: 'validation_error',
      severity: 'error'
    };
  }

  // Generic database error
  return {
    businessMessage: 'Database operation failed',
    constraint: null,
    category: 'database_error',
    severity: 'error'
  };
}

/**
 * Extract constraint name from MySQL error message
 */
function extractConstraintName(message) {
  if (!message) return null;
  
  const fkMatch = message.match(/CONSTRAINT `([^`]+)`/);
  if (fkMatch) return fkMatch[1];
  
  const tableMatch = message.match(/`([^`]+)`, CONSTRAINT/);
  if (tableMatch) return `${tableMatch[1]} constraint`;
  
  return null;
}

/**
 * Extract field name from MySQL error message
 */
function extractFieldName(message) {
  if (!message) return null;
  
  const fieldMatch = message.match(/Field '([^']+)'/);
  return fieldMatch ? fieldMatch[1] : null;
}

/**
 * Main function - enhance error response
 */
export const enhanceErrorResponse = async (error, requestData, method) => {
  try {
    const errorClassification = classifyDatabaseError(error);
    const sanitizedRequest = logger.sanitizeLogData(requestData);
    
    const enhancedResponse = {
      success: false,
      error: errorClassification.businessMessage,
      debug: {
        constraint_violation: errorClassification.constraint,
        received_data: sanitizedRequest,
        method: method,
        category: errorClassification.category,
        timestamp: new Date().toISOString()
      }
    };
    
    // Clean server-side logging
    const logLevel = errorClassification.severity === 'warn' ? 'warn' : 'error';
    logger[logLevel](`[enhanceErrorResponse] ${method} failed: ${errorClassification.businessMessage}`, {
      constraint: errorClassification.constraint,
      category: errorClassification.category
    });
    
    return enhancedResponse;
    
  } catch (enhancementError) {
    logger.error('[enhanceErrorResponse] Error enhancement failed:', enhancementError);
    
    return {
      success: false,
      error: 'Operation failed',
      debug: {
        received_data: logger.sanitizeLogData(requestData),
        method: method,
        timestamp: new Date().toISOString()
      }
    };
  }
};