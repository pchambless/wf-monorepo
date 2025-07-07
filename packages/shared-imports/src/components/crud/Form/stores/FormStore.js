/**
 * Comprehensive FormStore for CRUD operations
 */
import { makeAutoObservable, action, runInAction, toJS } from 'mobx';
import { createLogger } from '@whatsfresh/shared-imports';
import { insertRecord, updateRecord, deleteRecord } from '@whatsfresh/shared-imports';

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
  displayColumns = []; // Filtered columns for form display

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

    // Filter columns for display - ADD system CHECK HERE
    this.displayColumns = (this.pageMap?.columnMap || [])
      .filter(col => !col.hideInForm && !col.system);

    // SINGLE call to makeAutoObservable - combining both configurations
    makeAutoObservable(this, {
      pageMap: false,     // Exclude from observable
      log: false,         // Exclude logger from observables
      setPageMap: action, // Mark as action (from the second call)
      getPageMap: false   // Exclude getter (from the second call)
    });

    // Safe logging (after setup)
    if (typeof this.log === 'function') {
      this.log('FormStore initialized with displayable columns:', {
        totalColumns: this.pageMap?.columnMap?.length || 0,
        displayableColumns: this.displayColumns.length,
        columnFields: this.displayColumns.map(col => col.field)
      });
    } else if (this.log && typeof this.log.info === 'function') {
      this.log.info('FormStore initialized with displayable columns:', {
        totalColumns: this.pageMap?.columnMap?.length || 0,
        displayableColumns: this.displayColumns.length,
        columnFields: this.displayColumns.map(col => col.field)
      });
    }
  }

  // Built-in validators
  validators = {
    required: (value) => value !== undefined && value !== null && value !== ''
      ? true
      : 'This field is required',

    email: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? true : 'Invalid email format';
    },

    minLength: (len) => (value) => {
      if (!value) return true;
      return value.length >= len ? true : `Minimum length is ${len}`;
    },

    maxLength: (len) => (value) => {
      if (!value) return true;
      return value.length <= len ? true : `Maximum length is ${len}`;
    },

    number: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return !isNaN(Number(value)) ? true : 'Must be a number';
    },

    min: (min) => (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min ? true : `Minimum value is ${min}`;
    },

    max: (max) => (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max ? true : `Maximum value is ${max}`;
    }
  };

  // Action methods
  setFieldValue(name, value) {
    runInAction(() => {
      // Update formData (source of truth)
      this.formData[name] = value;

      // Find column by field name (not field.id!)
      const column = this.displayColumns.find(c => c.field === name);
      if (column) {
        column.value = value; // Duplicated state!
      }

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
      // Store the data
      this.formData = { ...data };
      this.errors = {};
      this.touched = {};

      this.log('Setting form data', {
        dataKeys: Object.keys(data || {}),
        columns: this.displayColumns?.length || 0
      });

      // If we're still maintaining field values on columns
      if (this.displayColumns && Array.isArray(this.displayColumns) && data) {
        this.displayColumns.forEach(column => {
          if (column && column.field) {
            const dataValue = data[column.field];
            if (dataValue !== undefined) {
              column.value = dataValue;
            }
          }
        });
      }
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

  // Validation
  validateField(fieldName) {
    // Clear existing error
    delete this.errors[fieldName];

    // Find field definition from displayColumns
    const column = this.displayColumns.find(c => c.field === fieldName);
    if (!column) return true;

    const value = this.formData[fieldName];

    // Required validation
    if (column.required && this.validators.required(value) !== true) {
      this.errors[fieldName] = 'This field is required';
      return false;
    }

    // Type-specific validation
    if (column.displayType === 'number') {
      if (this.validators.number(value) !== true) {
        this.errors[fieldName] = 'Must be a number';
        return false;
      }

      if (column.min !== undefined && this.validators.min(column.min)(value) !== true) {
        this.errors[fieldName] = `Minimum value is ${column.min}`;
        return false;
      }

      if (column.max !== undefined && this.validators.max(column.max)(value) !== true) {
        this.errors[fieldName] = `Maximum value is ${column.max}`;
        return false;
      }
    }

    return true;
  }

  validate() {
    this.log('Validating form data');

    let isValid = true;

    // Skip validation for DELETE operations
    if (this.formMode === 'DELETE') {
      this.isValid = true;
      return true;
    }

    // FIXED: Use displayColumns instead of fields
    if (this.displayColumns && Array.isArray(this.displayColumns)) {
      this.displayColumns.forEach(column => {
        const fieldId = column.field;
        this.touched[fieldId] = true;
        if (!this.validateField(fieldId)) {
          isValid = false;
        }
      });
    }

    // Update observable state
    runInAction(() => {
      this.isValid = isValid;
    });

    return isValid;
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
      if (this.formMode === 'new' || this.formMode === 'INSERT') {
        result = await insertRecord(this.pageMap, this.plainFormData, previewOnly);
      } else if (this.formMode === 'edit' || this.formMode === 'UPDATE') {
        result = await updateRecord(this.pageMap, this.plainFormData, previewOnly);
      } else if (this.formMode === 'delete' || this.formMode === 'DELETE') {
        result = await deleteRecord(this.pageMap, this.plainFormData, previewOnly);
      } else {
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

  // Prepare form data for save operation
  prepareForSave() {
    // Log the current form data for debugging
    this.log.info('Preparing form data for save', {
      formData: this.formData,
      fieldCount: Object.keys(this.formData).length
    });

    // Check if values are missing
    const hasValues = Object.values(this.formData).some(val => val !== undefined && val !== null);

    if (!hasValues) {
      this.log.warn('WARNING: Form data has keys but no values!', {
        keys: Object.keys(this.formData)
      });

      // Try to get values from displayColumns if available
      if (this.displayColumns && Array.isArray(this.displayColumns)) {
        runInAction(() => {
          // Copy values from displayColumns to formData
          this.displayColumns.forEach(column => {
            if (column.field && column.value !== undefined) {
              this.formData[column.field] = column.value;
              this.log.info(`Copied column value: ${column.field} = ${column.value}`);
            }
          });
        });
      }
    }

    // Convert formData to plain JS
    this.plainFormData = toJS(this.formData);

    // ** REMOVED: Don't repair or mutate pageMap **
    // this.plainPageMap = this.pageMap;
    // repairPageMap(this.plainPageMap, 'FormStore.prepareForSave');

    // ** NEW: Handle parent ID if needed **
    const parentIdField = this.pageMap?.pageConfig?.parentIdField;
    if (parentIdField && this.formMode === 'INSERT') {
      // Check if we need a parent ID but don't have one
      if (!this.plainFormData[parentIdField] && !this.plainFormData._parentId) {
        this.log.warn(`Missing parent ID for ${parentIdField} - hierarchy may be broken`);

        // Try to get it from contextData as a last resort
        if (this.contextData && this.contextData.parentId) {
          this.plainFormData[parentIdField] = this.contextData.parentId;
          this.plainFormData._parentId = this.contextData.parentId;
          this.log.info(`Added parent ID from context: ${parentIdField}=${this.contextData.parentId}`);
        }
      }
    }

    this.log.info('Prepared data:', {
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

  // Helper to create column map from form data
  createColumnMap() {
    // Just use the column map directly from pageMap
    return this.pageMap.columnMap;
  }

  getDisplayColumns() {
    // We've already filtered in the constructor, so we can use displayColumns directly
    const groups = this.displayColumns.reduce((acc, column) => {
      const groupKey = column.displayType === 'multiLine' ?
        `multiLine-${column.field}` :
        (column.group?.toString() || '0');

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push({
        ...column,
        xs: column.displayType === 'multiLine' ? 12 : undefined,
        sm: column.displayType === 'multiLine' ? 12 : undefined
      });
      return acc;
    }, {});

    return groups;
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
