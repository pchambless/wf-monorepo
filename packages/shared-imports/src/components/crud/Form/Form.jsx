/**
 * Form component using robust FormStore
 */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import FormStore from './stores/FormStore';
import createLogger from '@utils/logger';
import contextStore from '../../../stores/contextStore.js';
// Import field widgets and selector components
import { FIELD_WIDGETS } from '../../forms/index.js';
import {
  SelAcct, SelBrnd, SelVndr, SelMeas, SelProd, SelProdType,
  SelIngr, SelIngrType, SelWrkr, SelUserAcct
} from '../../selectors/index.js';
import {
  Paper, Grid, Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { safeProp } from '@utils/mobxHelpers';

const log = createLogger('Form');

// Widget registry for selector components
const SELECTOR_WIDGETS = {
  SelBrnd: SelBrnd,
  SelVndr: SelVndr,
  SelMeas: SelMeas,
  SelProd: SelProd,
  SelIngr: SelIngr,
  SelWrkr: SelWrkr,
  SelUserAcct: SelUserAcct
};

/**
 * Renders a form field based on its configuration
 */
const renderFormField = (field, formData, setFormData, formStore) => {
  const value = formData[field.field] || '';

  const handleFieldChange = (newValue) => {
    const updatedData = { ...formData, [field.field]: newValue };
    setFormData(updatedData);
    // Also update the form store
    if (formStore && formStore.setFieldValue) {
      formStore.setFieldValue(field.field, newValue);
    }
  };

  // Handle selector widgets (fields with widget property)
  if (field.widget && SELECTOR_WIDGETS[field.widget]) {
    const SelectorComponent = SELECTOR_WIDGETS[field.widget];
    return (
      <SelectorComponent
        value={value}
        onChange={handleFieldChange}
        label={field.label}
        required={field.required}
        disabled={field.disabled}
        fullWidth
      />
    );
  }

  // Handle basic field types
  if (field.type && FIELD_WIDGETS[field.type]) {
    const FieldComponent = FIELD_WIDGETS[field.type];
    return (
      <FieldComponent
        value={value}
        onChange={handleFieldChange}
        label={field.label}
        required={field.required}
        disabled={field.disabled}
        fullWidth
      />
    );
  }

  // Fallback for unknown field types
  return (
    <Box p={2} border="1px solid #ddd" borderRadius={1} bgcolor="#fafafa">
      <Typography variant="caption" color="text.secondary">
        Unknown field type: {field.type || 'undefined'} / widget: {field.widget || 'none'}
      </Typography>
      <Typography variant="body2">
        Field: {field.field} = {value}
      </Typography>
    </Box>
  );
};

const Form = observer(forwardRef(({
  pageMap, data,
  onSave,
  formTitle = 'Form',
  mode = 'view',
  onCancel
}, ref) => {
  // Track whether we have a valid pageMap
  const hasValidPageMap = !!pageMap && !!pageMap.id;

  // Removed DML preview modal state - no longer needed for seamless CRUD

  // Create formStore (MUST do this for hook rules)
  const [formStore] = useState(() => {
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

    // Handle form data initialization
    if (data) {
      formStore.setFormData(data);
    } else if (mode === 'ADD' || mode === 'INSERT') {
      // For new records, auto-populate any fields that exist in contextStore
      const initialData = {};

      // Check all form fields and populate from contextStore if available
      if (pageMap?.formConfig?.groups) {
        pageMap.formConfig.groups.forEach(group => {
          group.fields?.forEach(field => {
            if (field.field) {
              const contextValue = contextStore.getParameter(field.field);
              if (contextValue !== null && contextValue !== undefined) {
                initialData[field.field] = contextValue;
                log.debug(`Auto-populated ${field.field} from contextStore:`, contextValue);
              }
            }
          });
        });
      }

      formStore.setFormData(initialData);
      log.debug('Initialized ADD/INSERT form with context values:', initialData);
    }

    formStore.setFormMode(mode);
  }, [data, mode, pageMap, formStore, hasValidPageMap]);

  // Always use imperative handle
  useImperativeHandle(ref, () => ({
    refresh: (newMode, newData) => {
      if (!hasValidPageMap) {
        return;
      } // Don't operate on invalid store

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

  // FormStore initialized - state available in formStore instance

  // Form submission - actual save
  const handleSubmit = async () => {
    try {
      console.log('handleSubmit called - form submission starting');
      console.log('Form mode:', formStore.formMode);
      console.log('Form data:', formStore.formData);
      console.log('Form validation state:', formStore.isValid);

      // Convert form data to plain JS objects BEFORE saving
      formStore.prepareForSave();

      // Then save
      const result = await formStore.save(false);

      console.log('Save result:', result);

      if (result.success) {
        console.log('Save successful - seamless CRUD operation');

        // Call onSave callback if provided
        if (onSave) {
          onSave(result);
        }
      } else {
        console.error('Save failed:', result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
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
    if (onCancel) {
      onCancel();
    }
  };

  // Get form groups from pageMap
  const formGroups = pageMap?.formConfig?.groups || [];

  // Form groups configured (summary available in formStore)

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
        {/* Render form groups */}
        {formGroups.map(group => (
          <Box key={group.id} sx={{ mb: 3 }}>
            {group.title && (
              <Typography variant="h6" sx={{ mb: 2 }}>
                {group.title}
              </Typography>
            )}
            <Grid container spacing={2}>
              {group.fields?.filter(field => !field.hidden).map(field => (
                <Grid size={field.type === 'multiLine' ? 12 : { xs: 12, sm: 6 }} key={field.field}>
                  {renderFormField(field, formStore.formData, (data) => formStore.setFormData(data), formStore)}
                </Grid>
              ))}
            </Grid>
          </Box>
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

      {/* Removed DML Preview Modal for seamless CRUD operations */}
    </Paper>
  );
}));

export default Form;
