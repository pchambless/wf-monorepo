/**
 * MobX store for form field state
 */
import { makeAutoObservable, runInAction } from 'mobx';
import createLogger from '@utils/logger';
import accountStore from '@stores/accountStore';
import { safeProp } from '@utils/mobxHelpers';

class FormFieldStore {
  // Observable state
  field = null;
  value = null;
  error = null;
  isDirty = false;
  isTouched = false;
  loading = false;
  options = [];

  constructor(field, value, error) {
    makeAutoObservable(this);
    this.log = createLogger('FormFieldStore');

    // Initialize with values
    this.field = field;
    this.value = value;
    this.error = error;

    // Load options for select fields
    if (field && field.displayType === 'select' && field.selList) {
      this.loadOptions();
    }
  }

  /**
   * Update field value
   */
  setValue = (newValue) => {
    this.value = newValue;
    this.isDirty = true;
    this.isTouched = true;
    this.validate();
  }

  /**
   * Set error message
   */
  setError = (message) => {
    this.error = message;
  }

  /**
   * Mark field as touched (user interaction)
   */
  setTouched = (isTouched = true) => {
    this.isTouched = isTouched;
    if (isTouched) {
      this.validate();
    }
  }

  /**
   * Load options for select fields from accountStore
   */
  loadOptions = () => {
    if (!this.field.selList) return;

    try {
      this.loading = true;

      // Get from accountStore based on selList name
      const listName = this.field.selList.replace('List', '').toLowerCase() + 'List';
      const data = accountStore[listName] || [];

      // Map response to options array
      const valueField = this.field.valueField || 'id';
      const displayField = this.field.displayField || 'name';

      runInAction(() => {
        this.options = Array.isArray(data) ?
          data.map(item => ({
            value: item[valueField],
            label: item[displayField]
          })) : [];
        this.loading = false;
      });

      this.log.debug(`Loaded ${this.options.length} options for ${this.field.id} from accountStore`);

    } catch (error) {
      this.log.error(`Failed to load options for ${this.field.id}:`, error);
      runInAction(() => {
        this.options = [];
        this.loading = false;
      });
    }
  }

  /**
   * Validate field value
   */
  validate = () => {
    // Skip validation if not touched
    if (!this.isTouched) {
      this.error = null;
      return true;
    }

    // Required field validation
    if (this.field.required && (this.value === null || this.value === '')) {
      this.error = `${this.field.label} is required`;
      return false;
    }

    // Number range validation
    if (this.field.displayType === 'number' && this.value !== null) {
      if (this.field.min !== undefined && this.value < this.field.min) {
        this.error = `Minimum value is ${this.field.min}`;
        return false;
      }

      if (this.field.max !== undefined && this.value > this.field.max) {
        this.error = `Maximum value is ${this.field.max}`;
        return false;
      }
    }

    // Validation passed
    this.error = null;
    return true;
  }

  /**
   * Check if field is valid
   */
  get isValid() {
    return !this.error;
  }

  /**
   * Get the appropriate renderer component for this field
   */
  getRendererComponent() {
    // Handle different field type properties consistently
    const fieldType = this.field?.displayType || this.field?.type || 'text';
    
    this.log.debug(`Getting renderer for field: ${this.field?.id}, type: ${fieldType}`);

    // Return a default text renderer for now
    // We'll implement the proper registry later
    return null; // The parent component should handle this for now
  }

  // Add these action methods to update properties
  updateField(field) {
    this.field = field;
  }

  updateValue(value) {
    this.value = value;
  }

  updateError(error) {
    this.error = error;
  }

  // Any method that returns data to React components
  getFieldConfig(fieldId) {
    // Convert to plain JS before returning to React
    return safeProp(this.fields[fieldId]);
  }
}

export default FormFieldStore;
