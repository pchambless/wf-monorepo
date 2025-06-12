import createLogger from '../logger';
import { showConfirmation } from '../../stores/modalStore';
import React from 'react';
import SqlPreview from './previewSql';
import { buildDmlRequest } from './buildRequest';
import { buildSqlStatement } from './buildSql';

const log = createLogger('crudDML');

/**
 * Generates a preview of SQL and request body without executing anything
 * @param {Object} formData - Form data to be submitted
 * @param {Array} columns - Column configuration for the form
 * @param {String} formMode - Operation type (add/edit/delete)
 * @returns {Promise<Object>} Result with preview information
 */
const crudDML = async (formData, columns, formMode) => {
  log.info('crudDML preview requested:', { formMode, dataKeys: Object.keys(formData) });
  
  // Build the request body
  const requestBody = buildDmlRequest(formData, columns, formMode);
  
  if (!requestBody) {
    log.error('Failed to build request body');
    return Promise.reject(new Error('Failed to build request body'));
  }

  // Generate SQL statement
  const sqlStatement = buildSqlStatement(requestBody);

  // Show the preview modal with the SQL and request body
  try {
    await showConfirmation(
      <SqlPreview 
        requestBody={requestBody}
        sqlStatement={sqlStatement}
      />,
      null,
      null,
      {
        title: `Preview ${requestBody.method} Request`,
        cancelText: 'Close',
        showConfirm: false,
        maxWidth: 'md'
      }
    );
    
    log.info('SQL preview shown:', { 
      method: requestBody.method,
      table: requestBody.table
    });
    
    // Return success without executing anything
    return { 
      success: true,
      message: `${requestBody.method} preview generated`,
      previewOnly: true  // Flag to indicate this was just a preview
    };
  } catch (error) {
    log.error('Error showing preview:', error);
    return Promise.reject(error);
  }
};

export default crudDML;
