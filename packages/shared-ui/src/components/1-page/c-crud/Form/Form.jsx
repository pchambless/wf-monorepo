/**
 * Form component using robust FormStore
 */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import FormStore from './stores/FormStore';
import createLogger from '@utils/logger';
import FormField from '../FormField';
import { 
  Paper, Grid, Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { safeProp } from '@utils/mobxHelpers';

const log = createLogger('Form');

const Form = observer(forwardRef(({ 
  pageMap, data, 
  onSave, 
  formTitle = 'Form',
  mode = 'view',
  onCancel
}, ref) => {
  // Track whether we have a valid pageMap
  const hasValidPageMap = !!pageMap && !!pageMap.id;
  
  console.log('Form received props:', {
    hasPageMap: hasValidPageMap,
    pageMapId: pageMap?.id,
    data,
    mode
  });

  // Create formStore (MUST do this for hook rules)
  const [formStore] = useState(() => {
    console.log('Creating FormStore with pageMap:', pageMap);
    return new FormStore({ 
      pageMap
    }, data || {});
  });
  
  // Always use effect (for hook rules) but check validity
  useEffect(() => {
    if (!hasValidPageMap) {
      console.error('ERROR: Form cannot function without a valid pageMap');
      return;
    }
    
    if (data) {
      formStore.setFormData(data);
    }
    formStore.setFormMode(mode);
  }, [data, mode, pageMap, formStore, hasValidPageMap]);
  
  // Always use imperative handle
  useImperativeHandle(ref, () => ({
    refresh: (newMode, newData) => {
      if (!hasValidPageMap) return; // Don't operate on invalid store
      
      formStore.setFormMode(newMode || mode);
      if (newData) {
        formStore.setFormData(newData);
      }
    },
    getFormData: () => hasValidPageMap ? formStore.formData : {},
    isValid: () => hasValidPageMap && formStore.isValid,
    setFormMode: (newMode) => formStore.setFormMode(newMode),
    setFormData: (newData) => formStore.setFormData(newData),
    setParentId: (id) => formStore.setParentId(id)
  }));
  
  // Show error state if pageMap is missing
  if (!hasValidPageMap) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fff4f4' }}>
        <Box mb={2}>
          <Typography variant="h5" sx={{ color: '#d32f2f' }}>
            Configuration Error
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            Missing Page Configuration
          </Typography>
          <Typography variant="body2">
            This form requires a valid pageMap configuration but none was provided.
            Please check that the parent component is correctly passing the pageMap prop.
          </Typography>
        </Alert>
        {process.env.NODE_ENV !== 'production' && (
          <Box mt={2} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify({ formTitle, mode }, null, 2)}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }
  
  // Log formStore state after initialization
  console.log('FormStore state after initialization:', {
    formData: safeProp(formStore.formData),
    fields: safeProp(formStore.fields),
    columnMap: safeProp(formStore.columnMap),
    pageMap: safeProp(formStore.pageMap)
  });
  
  // Form submission - actual save
  const handleSubmit = async () => {
    try {
      // Convert form data to plain JS objects BEFORE saving
      formStore.prepareForSave();
      
      // Then save
      const result = await formStore.save(false);
      
      if (result.success) {
        if (onSave) {
          onSave(result);
        }
      }
    } catch (error) {
      // Handle error
    }
  };
  
  // Preview handler
  const handlePreview = async () => {
    try {
      // Use the save method with previewOnly=true, no saveEvent
      const result = await formStore.save(true);
      
      if (!result.success) {
        log('Preview error:', result.error);
      }
    } catch (error) {
      log('Preview error:', error);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    formStore.setFormMode('SELECT');
    if (onCancel) onCancel();
  };
  
  // Get columns grouped for display
  const groupedColumns = formStore.getDisplayColumns() || {};
  
  // Debug log
  console.log('Form rendering with grouped columns:', {
    groupCount: Object.keys(groupedColumns).length,
    columnGroups: Object.entries(groupedColumns).map(([groupId, columns]) => ({
      groupId,
      columnCount: columns.length,
      columnFields: columns.map(c => c.field)
    }))
  });
  
  // Finally add the return statement with form rendering
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box mb={2}>
        <Typography variant="h5">{formTitle}</Typography>
      </Box>
      
      {/* Show error message if present */}
      {formStore.formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formStore.formError}
        </Alert>
      )}
      
      <form>
        {/* Render columns */}
        {Object.entries(groupedColumns).map(([groupId, columns]) => (
          <Grid container spacing={2} key={groupId} sx={{ mb: 2 }}>
            {columns.map(column => (
              <Grid item xs={column.displayType === 'multiLine' ? 12 : 6} key={column.field}>
                <FormField 
                  column={safeProp(column)}
                  value={safeProp(formStore.formData[column.field])}
                  error={safeProp(formStore.errors[column.field])}
                  onChange={(value) => formStore.setFieldValue(column.field, value)}
                  disabled={formStore.formMode === 'SELECT'}
                />
              </Grid>
            ))}
          </Grid>
        ))}
        
        {/* Buttons */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          {formStore.formMode !== 'SELECT' && (
            <>
              <Button 
                onClick={handleCancel} 
                sx={{ mr: 1 }}
                disabled={formStore.isSubmitting}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handlePreview} 
                color="secondary" 
                sx={{ mr: 1 }}
                disabled={formStore.isSubmitting}
              >
                Preview
              </Button>
              
              <Button
                onClick={() => {
                  console.log('Create/Update button clicked!');
                  console.log('Form data:', formStore.formData);
                  console.log('Form mode:', formStore.formMode);
                  handleSubmit(); // Change to handleSubmit
                }}
                variant="contained" 
                color="primary"
                disabled={formStore.isSubmitting || !formStore.isValid}
                startIcon={formStore.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {formStore.formMode === 'INSERT' ? 'Create' : 'Update'}
              </Button>
            </>
          )}
          
          {formStore.formMode === 'SELECT' && onCancel && (
            <Button 
              onClick={onCancel}
              variant="outlined"
            >
              Close
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
}));

export default Form;
