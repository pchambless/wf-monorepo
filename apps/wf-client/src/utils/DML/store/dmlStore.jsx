import { makeAutoObservable } from 'mobx';
import createLogger from '@utils/logger';
import { buildDmlRequest } from '@utils/DML/buildRequest';
import { buildSqlStatement } from '@utils/DML/buildSql';
import { modalStore } from '@stores/modalStore';
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

/**
 * DML Store - handles all SQL generation and preview
 */
class DmlStore {
  constructor() {
    makeAutoObservable(this);
    this.log = createLogger('DmlStore');
  }
  
  /**
   * Preview DML - handles everything related to preview
   */
  previewDml({ formData, columnMap, formMode, entityType }) {
    try {
      this.log.info('Previewing DML for', { formMode, entityType });
      
      // 1. Enhance columnMap with values from formData
      const enhancedColumnMap = columnMap.map(col => ({
        ...col,
        value: formData[col.field] // Add value from formData
      }));
      
      // 2. Build request body for DML
      const requestBody = buildDmlRequest(formData, enhancedColumnMap, formMode);
      
      // 3. Generate SQL statement
      const sqlStatement = buildSqlStatement(requestBody);
      
      // 4. Create enhanced pageMap for display
      const enhancedPageMap = {
        pageConfig: { 
          entityType,
          formMode
        },
        columnMap: enhancedColumnMap
      };
      
      // 5. Show preview modal
      modalStore.showModal({
        title: `${formMode} Operation Preview`,
        content: (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enhanced PageMap (with Values)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 300, overflow: 'auto' }}>
              <pre>{JSON.stringify(enhancedPageMap, null, 2)}</pre>
            </Paper>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              SQL Statement Preview
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
              <pre>{sqlStatement}</pre>
            </Paper>
          </Box>
        ),
        actions: [
          {
            label: 'Close',
            onClick: () => modalStore.closeModal()
          }
        ],
        size: 'lg'
      });
      
      return { success: true };
    } catch (error) {
      this.log.error('Preview generation error:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Execute DML operation
   */
  executeDml(formData, formMode, options = {}) {
    // Handle case where options is just a boolean (backward compatibility)
    const previewOnly = typeof options === 'boolean' ? options : options.previewOnly;
    const { saveEvent, columnMap, entityType } = typeof options === 'object' ? options : {};
    
    this.log('Executing DML', { formMode, previewOnly, saveEvent });
    
    try {
      // If preview only, just show the SQL
      if (previewOnly) {
        return this.previewDml({ 
          formData, 
          columnMap: columnMap || formData.columnMap, 
          formMode,
          entityType: entityType || formData.entityType || 'Unknown',
          saveEvent
        });
      }
      
      // Create a proper options object for executeDml
      const dmlOptions = {
        formData,
        columnMap: formData.columnMap,
        METHOD: formMode,
        previewOnly: false
      };
      
      // Use the index.js implementation
      const { executeDml } = require('../index');
      return executeDml(dmlOptions);
    } catch (error) {
      this.log.error('DML execution error:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error executing DML'
      };
    }
  }
}

const dmlStore = new DmlStore();
export default dmlStore;
export { dmlStore };

/**
 * In your DML utils
 */
export const executeDml = async (options) => {
  try {
    const log = createLogger('DML.executeDml');
    log.info('Executing DML with options', options);
    
    // Extract needed values
    const { METHOD, pageMap, formData } = options;
    
    // Build the DML map
    const dmlMap = buildDmlMap(options);
    
    // Build SQL statement
    const sqlStatement = buildSqlStatement(dmlMap);
    
    // Return a promise that resolves when the modal is closed
    return new Promise((resolve, reject) => {
      try {
        // Show SQL preview and get user confirmation
        previewSql(sqlStatement, options, dmlMap, (approved) => {
          if (approved) {
            // Here you would make the actual API call
            // For now, just simulate success
            resolve({ 
              success: true, 
              message: `${METHOD} operation successful`,
              data: { id: 123 } // Mock response 
            });
          } else {
            // User cancelled
            resolve({ 
              success: false, 
              cancelled: true,
              message: 'Operation cancelled by user' 
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    const log = createLogger('DML.executeDml');
    log.error('Error executing DML:', error);
    return { success: false, error: error.message };
  }
};
