/**
 * Field type definitions and interfaces
 */

// Field type constants
export const FIELD_TYPES = {
  TEXT: 'text',
  MULTILINE: 'multiLine',
  NUMBER: 'number',
  SELECT: 'select',
  DATE: 'date',
  BOOLEAN: 'boolean',
  HIDDEN: 'hidden'
};

/**
 * Field configuration interface
 * @typedef {Object} FieldConfig
 * @property {string} field - Field name/key
 * @property {string} label - Display label
 * @property {string} displayType - Rendering type (from FIELD_TYPES)
 * @property {boolean} [required] - Whether field is required
 * @property {number} [min] - Minimum value (for number fields)
 * @property {number} [max] - Maximum value (for number fields)
 * @property {string} [dataType] - Database data type
 * @property {boolean} [editable] - Whether field is editable
 * @property {Array} [options] - Options for select fields
 * @property {string} [selList] - List event for populating select options
 * @property {string} [valueField] - Field to use as option value
 * @property {string} [displayField] - Field to use as option display text
 */
