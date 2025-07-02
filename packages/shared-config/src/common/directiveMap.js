/**
 * WhatsFresh SQL Directive System
 * 
 * This system translates SQL comment directives into UI component configurations.
 * ---------------------------------------------------------------------------------
 * 
 * QUICK REFERENCE:
 * 
 * Field Identity:
 * - PK              Primary key field
 * - sys             System field (hidden but used in operations)
 * - parentKey       Foreign key to parent entity
 * 
 * Display:
 * - type:text       Regular text field
 * - type:multiLine  Multi-line text area
 * - type:number     Numeric field
 * - type:select     Dropdown selection
 * - type:date       Date picker
 * - type:boolean    Checkbox
 * 
 * Validation:
 * - req             Required field
 * - unique          Must have unique values
 * 
 * Layout:
 * - label:Name      Custom display name
 * - grp:1           Form group (fields with same group appear on same line)
 * - width:100       Width in pixels for table column
 * - tableHide       Hide in table view
 * - formHide        Hide in form view
 * 
 * Select/Lookup Fields:
 * - entity:measList Related entity for dropdown options
 * - valField:id     Field to use as option value
 * - dispField:name  Field to use as option display text
 * 
 * EXAMPLES:
 * 
 * 1. Primary key: id AS userId -- PK; sys; type:number
 * 2. Text field: name AS userName -- req; type:text; label:Full Name; width:200
 * 3. Dropdown: type_id AS typeId -- type:select; entity:typeList; valField:typeID; dispField:typeName
 */

/**
 * DirectiveMap - Maps SQL comment directives to system properties
 * This version uses directive names directly as properties where possible
 */

// Field types used throughout the system
const FIELD_TYPES = {
  TEXT: 'text',
  multiLine: 'multiLine',
  NUMBER: 'number',
  DECIMAL: 'decimal',
  SELECT: 'select',
  DATE: 'date',
  BOOLEAN: 'boolean',
  HIDDEN: 'hidden'
};

const directiveMap = {
  // Core field properties
  "PK": { 
    transform: () => true,
    description: "Primary key field" 
  },
  "sys": { 
    transform: () => true,
    description: "System field (hidden but used in operations)" 
  },
  "req": { 
    transform: () => true,
    description: "Required field" 
  },
  "parentKey": { 
    transform: () => true,
    description: "Parent reference field"
  },
  
  // Type directive - still needs transformation function
  "type": { 
    transform: (val) => {
      // Map SQL types to UI field types (preserve mapping logic)
      switch (val.toLowerCase()) {
        case 'text': return FIELD_TYPES.TEXT;
        case 'multiLine': return FIELD_TYPES.multiLine;
        case 'number': return FIELD_TYPES.NUMBER;
        case 'decimal': return FIELD_TYPES.DECIMAL; // Added decimal type
        case 'float': return FIELD_TYPES.DECIMAL;
        case 'int': return FIELD_TYPES.NUMBER;
        case 'select': return FIELD_TYPES.SELECT;
        case 'date': 
        case 'datetime': return FIELD_TYPES.DATE;
        case 'boolean': 
        case 'checkbox': return FIELD_TYPES.BOOLEAN;
        case 'hidden': return FIELD_TYPES.HIDDEN;
        default: return FIELD_TYPES.TEXT; // Default to text
      }
    },
    description: "Field data type" 
  },
  
  // Display properties - all use their own names as attributes
  "label": { 
    transform: (val) => val,
    description: "Display label" 
  },
  "width": { 
    transform: (val) => parseInt(val) || 150,
    description: "Column width" 
  },
  
  // Widget directive - replaces selList/entity
  "widget": { 
    transform: (val) => val,
    description: "Specific widget component (e.g. selVndr, crudTbl, rcntIngrBtch)" 
  },
  "valField": { 
    transform: (val) => val,
    description: "Value field for select options" 
  },
  "dispField": { 
    transform: (val) => val,
    description: "Display field for select options" 
  },
  "BI": { 
    transform: () => true,
    description: "Business Intelligence field (excluded from CRUD operations)" 
  },
  
  // Number field properties
  "min": {
    transform: (val) => parseFloat(val),
    description: "Minimum value for number fields"
  },
  "max": {
    transform: (val) => parseFloat(val),
    description: "Maximum value for number fields"
  },
  "dec": {
    transform: (val) => val,
    description: "Decimal precision (e.g. '10,2')"
  },
  
  // Visibility properties
  "tableHide": { 
    transform: () => true,
    description: "Hide in table view" 
  },
  "formHide": { 
    transform: () => true,
    description: "Hide in form view" 
  },
  
  // Form organization
  "grp": { 
    transform: (val) => parseInt(val) || 1,
    description: "Form field group" 
  },
  "order": { 
    transform: (val) => parseInt(val) || 999,
    description: "Display order within group" 
  },
  
  // Table behaviors
  "sortable": { 
    transform: (val) => val !== 'false',
    description: "Whether column is sortable in table" 
  },
  "filterable": { 
    transform: (val) => val !== 'false',
    description: "Whether column is filterable in table" 
  },
  "searchable": {
    transform: () => true,
    description: "Field is included in search" 
  }
};

/**
 * Process directives from SQL comments into system properties
 * @param {Object} directives - Raw directives from SQL comments
 * @returns {Object} Processed directives with consistent property names
 */
function processDirectives(directives) {
  const result = {};
  
  // Process standard directives
  Object.entries(directives).forEach(([directive, value]) => {
    const mapping = directiveMap[directive];
    if (!mapping) return; // Skip unknown directives
    
    // Use directive name directly as the property name
    result[directive] = mapping.transform(value);
  });
  
  // Apply business rules
  if (result.sys) {
    result.editable = false;
    result.tableHide = true;
    result.formHide = true;
  }
  
  // Select fields need widget
  if (result.type === FIELD_TYPES.SELECT && !result.widget) {
    console.warn('Warning: Select field missing widget directive');
  }
  
  // BI fields auto-hide from tables, forms, and DML
  if (result.BI) {
    result.tableHide = true;
    result.formHide = true;
    result.excludeFromDML = true;
  }
  
  // multiLine fields should typically be hidden in tables
  if (result.type === FIELD_TYPES.multiLine && result.tableHide === undefined) {
    result.tableHide = true;
  }
  
  return result;
}

export {
  directiveMap,
  processDirectives,
  FIELD_TYPES
};