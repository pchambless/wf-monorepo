/**
 * Comprehensive FormStore for CRUD operations
 */
import { makeAutoObservable, action, runInAction, toJS } from 'mobx';
import { createLogger } from '@whatsfresh/shared-imports';
import { insertRecord, updateRecord, deleteRecord } from '@whatsfresh/shared-imports';
import { contextStore } from '@whatsfresh/shared-imports';

class FormStore {
  // Form state (observable)
  formData = {};
  errors = {};
  touched = {};
  isSubmitting = false;
  formMode = 'view';
  isValid = true;

  // Configuration properties - use columns directly
  pageMap = null;  // Will be excluded from observables

  // Add contextData property
  contextData = {};

  constructor(config, initialData = {}) {
    // Initialize logger first
    this.log = createLogger('FormStore');

    // Initialize pageMap BEFORE making observable - no verification needed
    if (config?.pageMap) {
      this.pageMap = config.pageMap; // Use direct reference
    }

    // Initialize formData from initialData
    this.formData = { ...initialData };

    // SINGLE call to makeAutoObservable - combining both configurations
    makeAutoObservable(this, {
      pageMap: false,     // Exclude from observable
      log: false,         // Exclude logger from observables
      setPageMap: action, // Mark as action (from the second call)
      getPageMap: false   // Exclude getter (from the second call)
    });

    // Safe logging (after setup)
    if (typeof this.log === 'function') {
      this.log('FormStore initialized with pageMap:', {
        pageMapId: this.pageMap?.id,
        totalFields: this.getTotalFieldCount()
      });
    } else if (this.log && typeof this.log.info === 'function') {
      this.log.info('FormStore initialized with pageMap:', {
        pageMapId: this.pageMap?.id,
        totalFields: this.getTotalFieldCount()
      });
    }
  }


  // Action methods
  setFieldValue(name, value) {
    runInAction(() => {
      // Update formData (single source of truth)
      this.formData[name] = value;

      // Mark field as touched for validation
      this.touched[name] = true;

      // Clear error for this field
      if (this.errors[name]) {
        delete this.errors[name];
      }
    });
  }

  setFormData(data) {
    runInAction(() => {
      // Store the data (single source of truth)
      this.formData = { ...data };
      this.errors = {};
      this.touched = {};

      this.log('Setting form data', {
        dataKeys: Object.keys(data || {}),
        fieldCount: Object.keys(data || {}).length
      });
    });
  }

  setFormMode(mode) {
    runInAction(() => {
      this.formMode = mode;
    });
  }

  setSubmitting(isSubmitting) {
    runInAction(() => {
      this.isSubmitting = isSubmitting;
    });
  }

  setFormError(message) {
    runInAction(() => {
      this.errors._form = message;
    });
  }

  // Add setContextData method
  setContextData(context) {
    if (!context) return this;

    runInAction(() => {
      this.contextData = { ...context };

      // If context contains parent ID, set it
      if (context.parentId && this.pageMap?.pageConfig?.parentIdField) {
        this.setParentId(context.parentId);
      }
    });

    return this;
  }

  // Simplified validation - field components handle their own validation
  validateField(fieldName) {
    // Clear existing error
    delete this.errors[fieldName];
    
    // Basic validation will be handled by field components
    // FormStore only needs to track if form is valid for submission
    return true;
  }

  validate() {
    this.log('Validating form data');

    // Skip validation for DELETE operations
    if (this.formMode === 'DELETE') {
      this.isValid = true;
      return true;
    }

    // Simplified validation - field components handle individual validation
    // FormStore just ensures we have required data for submission
    const hasRequiredData = Object.keys(this.formData).length > 0;

    // Update observable state
    runInAction(() => {
      this.isValid = hasRequiredData;
    });

    return hasRequiredData;
  }

  /**
   * Save the form data using DML
   * @returns {Promise<Object>} Result of the operation
   */
  async save(previewOnly = false) {
    console.log('FormStore.save called', {
      mode: this.formMode,
      data: this.formData
    });

    this.setSubmitting(true);

    try {
      // Validate first
      if (!this.validate()) {
        this.setFormError('Please correct the errors in the form.');
        return { success: false, error: 'Validation failed' };
      }

      // Prepare form data
      this.prepareForSave();

      // Execute the DML operation using available utilities
      let result;
      console.log('Determining DML operation for mode:', this.formMode);
      
      if (this.formMode === 'new' || this.formMode === 'INSERT' || this.formMode === 'ADD') {
        console.log('Calling insertRecord');
        result = await insertRecord(this.pageMap, this.plainFormData, previewOnly);
      } else if (this.formMode === 'edit' || this.formMode === 'UPDATE' || this.formMode === 'EDIT') {
        console.log('Calling updateRecord');
        result = await updateRecord(this.pageMap, this.plainFormData, previewOnly);
      } else if (this.formMode === 'delete' || this.formMode === 'DELETE') {
        console.log('Calling deleteRecord');
        result = await deleteRecord(this.pageMap, this.plainFormData, previewOnly);
      } else {
        console.error('Unsupported form mode:', this.formMode);
        throw new Error(`Unsupported form mode: ${this.formMode}`);
      }

      // Reset error state on success
      if (result.success) {
        this.setFormError(null);
      }

      return result;
    } catch (error) {
      this.setFormError(error.message || 'An error occurred while saving.');
      return { success: false, error };
    } finally {
      this.setSubmitting(false);
    }
  }

  // Simplified form data preparation - DML operations handle parameter resolution
  prepareForSave() {
    // Log the current form data for debugging
    this.log.info('Preparing form data for save', {
      formData: this.formData,
      fieldCount: Object.keys(this.formData).length
    });

    // Check if values are missing - simplified validation
    const hasValues = Object.values(this.formData).some(val => val !== undefined && val !== null);

    if (!hasValues) {
      this.log.warn('WARNING: Form data has keys but no values!', {
        keys: Object.keys(this.formData)
      });
    }

    // Convert formData to plain JS - DML operations handle parameter resolution
    this.plainFormData = toJS(this.formData);

    this.log.info('Prepared data (parameter resolution handled by DML):', {
      formData: this.plainFormData
    });
  }

  // Helper to determine entity type from pageMap - simplified version
  determineEntityType() {
    // Only in development, add a warning if somehow the property is missing
    if (process.env.NODE_ENV === 'development' && !this.pageMap?.id) {
      console.warn('PageMap missing id property - generator may be misconfigured');
    }

    return this.pageMap.id;
  }

  // Helper to get total field count from formConfig
  getTotalFieldCount() {
    if (!this.pageMap?.formConfig?.groups) return 0;
    return this.pageMap.formConfig.groups.reduce((total, group) => {
      return total + (group.fields?.length || 0);
    }, 0);
  }


  // Update your setParentId method with safe logging
  setParentId(parentId, parentIdField = null) {
    if (!parentId) {
      // Safe logging with fallback
      if (this.log && this.log.warn) {
        this.log.warn('Attempted to set empty parent ID');
      } else {
        console.warn('Attempted to set empty parent ID');
      }
      return;
    }

    // Get the parent ID field name from pageMap if not provided
    const fieldName = parentIdField || this.pageMap?.pageConfig?.parentIdField;

    if (!fieldName) {
      // Safe logging with fallback
      if (this.log && this.log.warn) {
        this.log.warn('No parentIdField defined in pageMap');
      } else {
        console.warn('No parentIdField defined in pageMap');
      }
      return;
    }

    // Update both regular field and special field
    runInAction(() => {
      this.formData[fieldName] = parentId;
      this.formData._parentId = parentId; // Special field for DML processing

      // Safe logging with fallback
      if (this.log && this.log.info) {
        this.log.info(`Set parent ID: ${fieldName}=${parentId}`);
      } else {
        console.log(`Set parent ID: ${fieldName}=${parentId}`);
      }
    });

    return this; // For method chaining
  }
}

export default FormStore;
