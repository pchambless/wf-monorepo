/**
 * genDirectives - Generate complete directive files from SQL views
 * 
 * This utility analyzes SQL views and generates complete directive files
 * with intelligent defaults while preserving manual overrides for labels, widths, and groups.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Primary key and parent key mappings (eliminates hardcoding)
 * Single source of truth for all CRUD view relationships
 */
const VIEW_KEY_MAP = {
  // CRUD Views
  'ingrBtchList': { 
    primaryKey: 'ingrBtchID', 
    parentKey: 'ingrID' 
  },
  'prodBtchList': { 
    primaryKey: 'prodBtchID', 
    parentKey: 'prodID' 
  },
  'ingrList': { 
    primaryKey: 'ingrID', 
    parentKey: 'ingrTypeID' 
  },
  'prodList': { 
    primaryKey: 'prodID', 
    parentKey: 'prodTypeID' 
  },
  'rcpeList': { 
    primaryKey: 'rcpeID', 
    parentKey: 'prodID' 
  },
  'taskList': { 
    primaryKey: 'taskID', 
    parentKey: 'prodTypeID' 
  },
  
  // Reference Views (all have acctID as parent)
  'vndrList': { 
    primaryKey: 'vndrID', 
    parentKey: 'acctID' 
  },
  'brndList': { 
    primaryKey: 'brndID', 
    parentKey: 'acctID' 
  },
  'measList': { 
    primaryKey: 'measID', 
    parentKey: 'acctID' 
  },
  'wrkrList': { 
    primaryKey: 'wrkrID', 
    parentKey: 'acctID' 
  },
  'ingrTypeList': { 
    primaryKey: 'ingrTypeID', 
    parentKey: 'acctID' 
  },
  'prodTypeList': { 
    primaryKey: 'prodTypeID', 
    parentKey: 'acctID' 
  },
  
  // Admin Views
  'acctList': { 
    primaryKey: 'acctID', 
    parentKey: null 
  },
  'userList': { 
    primaryKey: 'userID', 
    parentKey: null 
  }
};

/**
 * Get primary key pattern for current view context
 */
function getPrimaryKeyPattern() {
  // Create regex pattern from all known primary keys
  const primaryKeys = Object.values(VIEW_KEY_MAP).map(v => v.primaryKey);
  const pattern = new RegExp(`^(${primaryKeys.join('|')})$`, 'i');
  return pattern;
}

/**
 * Get view keys for a specific view name
 */
function getViewKeys(viewName) {
  return VIEW_KEY_MAP[viewName] || { primaryKey: null, parentKey: null };
}

/**
 * Smart width allocation for optimal table layout
 */
const SMART_WIDTHS = {
  // Action buttons reserved space
  actionButtons: 80,
  
  // Field type defaults (optimized for table scanning)
  text: 120,        // Names, batch numbers, codes
  number: 80,       // IDs, quantities 
  decimal: 100,     // Prices, rates
  date: 100,        // Dates
  boolean: 60,      // Checkboxes
  multiLine: 200    // Comments (hidden in tables anyway)
};

/**
 * Field pattern-based directive inference with widget mappings
 */
const FIELD_PATTERNS = {
  // Specific widget mappings (selects auto-hide in tables)
  VendorID: {
    pattern: /vndrID$/i,
    directives: { type: 'select', widget: 'selVndr', label: 'Vendor', grp: '1' }
  },
  
  BrandID: {
    pattern: /brndID$/i, 
    directives: { type: 'select', widget: 'selBrnd', label: 'Brand', grp: '2' }
  },
  
  MeasureID: {
    pattern: /measID$/i,
    directives: { type: 'select', widget: 'selMeas', label: 'Measure', grp: '3' }
  },
  
  IngredientID: {
    pattern: /ingrID$/i,
    directives: { type: 'select', widget: 'selIngr', label: 'Ingredient', sys: true }
  },
  
  ProductID: {
    pattern: /prodID$/i,
    directives: { type: 'select', widget: 'selProd', label: 'Product', grp: '1' }
  },
  
  WorkerID: {
    pattern: /wrkrID$/i,
    directives: { type: 'select', widget: 'selWrkr', label: 'Worker', grp: '1' }
  },
  
  AccountID: {
    pattern: /acctID$/i,
    directives: { type: 'select', widget: 'selAcct', label: 'Account', grp: '1' }
  },
  
  // Comments/Description fields
  Comments: { 
    pattern: /(comments|description)$/i, 
    directives: { type: 'multiLine', grp: '5' }
  },
  
  // Date fields
  Date: {
    pattern: /(date|Date)$/i,
    directives: { type: 'date', grp: '4' }
  },
  
  // Boolean fields
  Boolean: {
    pattern: /(active|enabled|flag)$/i,
    directives: { type: 'boolean', grp: '4' }
  },
  
  // Primary Key fields (auto-detected by view name pattern)
  PrimaryKey: {
    pattern: getPrimaryKeyPattern(),
    directives: { PK: true, sys: true, type: 'number' }
  },
  
  // Batch Number patterns
  BatchNumber: {
    pattern: /(btchNbr|batchNumber)$/i,
    directives: { type: 'text', label: 'Batch Number', grp: '1', required: true }
  },
  
  // Lot Number patterns
  LotNumber: {
    pattern: /(lotNbr|lotNumber)$/i,
    directives: { type: 'text', label: 'Lot Number', grp: '4' }
  },
  
  // Quantity patterns
  Quantity: {
    pattern: /(Qty|quantity)$/i,
    directives: { type: 'decimal', dec: '10,2', grp: '3' }
  },
  
  // Price patterns
  Price: {
    pattern: /(price|Price)$/i,
    directives: { type: 'decimal', dec: '10,2', grp: '3' }
  },
  
  // Name fields (BI fields for reporting/display)
  Name: { 
    pattern: /(Name|Type)$/i, 
    directives: { type: 'text', width: '150', BI: true }
  },
  
  // Code fields (BI fields for reporting)
  Code: { 
    pattern: /Code$/i, 
    directives: { type: 'text', width: '100', BI: true }
  },
  
  // Count fields (BI fields for analytics)
  Count: { 
    pattern: /Count$/i, 
    directives: { type: 'number', width: '80', BI: true }
  },
  
  // Amount/Rate fields (BI fields for financial reporting)
  Amount: { 
    pattern: /(Amt|Rate)$/i, 
    directives: { type: 'decimal', width: '100', dec: '13,4', BI: true }
  },
  
  // Status fields (BI fields for analytics)
  Status: { 
    pattern: /Status$/i, 
    directives: { type: 'text', width: '120', BI: true }
  },
  
  // Reference fields (BI fields for reporting)
  Ref: { 
    pattern: /Ref$/i, 
    directives: { type: 'text', width: '150', BI: true }
  }
};

/**
 * Generate label from field name
 */
function generateLabel(fieldName) {
  // Convert camelCase to spaced words
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Infer directive properties from field name with smart defaults
 */
function inferDirectives(fieldName, sampleData = null, viewName = null) {
  // Get view-specific keys for context
  const viewKeys = getViewKeys(viewName);
  
  // Check if this is a primary key
  if (fieldName === viewKeys.primaryKey) {
    const directives = { PK: true, sys: true, type: 'number' };
    return applySmartRules(directives, sampleData);
  }
  
  // Check if this is a parent key
  if (fieldName === viewKeys.parentKey) {
    const directives = { parentKey: true, sys: true, type: 'select' };
    return applySmartRules(directives, sampleData);
  }
  
  // Check each pattern
  for (const [patternName, config] of Object.entries(FIELD_PATTERNS)) {
    if (config.pattern.test(fieldName)) {
      const directives = {
        ...config.directives,
        label: config.directives.label || generateLabel(fieldName)
      };
      
      // Apply smart width and auto-hide rules
      return applySmartRules(directives, sampleData, viewName);
    }
  }
  
  // Default for unknown fields (text auto-maps to TextField)
  const directives = {
    type: 'text',
    label: generateLabel(fieldName),
    grp: '1'
  };
  
  return applySmartRules(directives, sampleData, viewName);
}

/**
 * Apply smart width allocation and streamlined hide rules
 */
function applySmartRules(directives, sampleData) {
  // Set smart width based on type
  if (!directives.width) {
    directives.width = SMART_WIDTHS[directives.type] || SMART_WIDTHS.text;
  }
  
  // System fields: hide from tables/forms, no groups needed
  if (directives.sys || directives.PK || directives.parentKey) {
    directives.tableHide = true;
    directives.formHide = true;
    delete directives.grp; // System fields don't need groups
  } 
  // Select widgets: hide from tables only (forms show them)
  else if (directives.type === 'select') {
    directives.tableHide = true;
  } 
  // Multi-line: hide from tables only (forms show them)
  else if (directives.type === 'multiLine') {
    directives.tableHide = true;
  }
  
  // BI fields: auto-exclude from all CRUD operations, no groups
  if (directives.BI) {
    directives.tableHide = true;
    directives.formHide = true;
    directives.excludeFromDML = true;
    delete directives.grp; // BI fields don't need groups
  }
  
  // Clean up: remove false boolean values (positive attributes only)
  cleanBooleanAttributes(directives);
  
  return directives;
}

/**
 * Remove boolean attributes that are false (positive attributes only)
 */
function cleanBooleanAttributes(directives) {
  const booleanAttrs = ['required', 'tableHide', 'formHide', 'sys', 'PK', 'parentKey', 'BI', 'excludeFromDML'];
  
  booleanAttrs.forEach(attr => {
    if (directives[attr] === false) {
      delete directives[attr];
    }
  });
}

/**
 * Extract field names from enhanced SQL view
 */
async function extractViewFields(viewName) {
  const sqlPath = path.join(__dirname, `../../../../../sql/views/client/${viewName}.sql`);
  
  try {
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    const fields = [];
    
    // Parse SELECT statements to find field aliases
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      // Look for AS patterns (field aliases)
      const asMatch = line.match(/\s+([^,\s]+)\s+AS\s+([a-zA-Z][a-zA-Z0-9_]*)/i);
      if (asMatch) {
        const fieldName = asMatch[2].trim();
        fields.push(fieldName);
      }
    }
    
    return fields;
  } catch (error) {
    console.error(`Error reading view ${viewName}:`, error.message);
    return [];
  }
}

/**
 * Generate complete directive file from SQL view
 */
async function generateDirectiveFile(viewName) {
  const directivePath = path.join(__dirname, `../../../../../packages/shared-config/src/client/directives/${viewName}.json`);
  
  try {
    // Read existing directive file (if it exists)
    let existingDirectives = { columns: {} };
    try {
      const existingContent = await fs.readFile(directivePath, 'utf8');
      existingDirectives = JSON.parse(existingContent);
    } catch (err) {
      console.log(`📄 Creating new directive file for ${viewName}`);
    }
    
    // Extract fields from SQL view
    const viewFields = await extractViewFields(viewName);
    
    if (viewFields.length === 0) {
      console.log(`⚠️ No fields found in view ${viewName}`);
      return;
    }
    
    console.log(`🔍 Processing ${viewFields.length} fields for ${viewName}`);
    
    // Generate directives for all fields
    const generatedDirectives = {
      viewName,
      entityName: viewName.toLowerCase(),
      lastGenerated: new Date().toISOString(),
      columns: {}
    };
    
    for (const fieldName of viewFields) {
      const existingField = existingDirectives.columns?.[fieldName];
      const inferredDirectives = inferDirectives(fieldName, null, viewName);
      
      // Preserve manual overrides (label, width, grp)
      if (existingField?.directives) {
        if (existingField.directives.label) inferredDirectives.label = existingField.directives.label;
        if (existingField.directives.width) inferredDirectives.width = existingField.directives.width;
        if (existingField.directives.grp) inferredDirectives.grp = existingField.directives.grp;
        
        // Also preserve any other manual customizations
        if (existingField.directives.required !== undefined) inferredDirectives.required = existingField.directives.required;
        if (existingField.directives.tableHide !== undefined) inferredDirectives.tableHide = existingField.directives.tableHide;
        if (existingField.directives.formHide !== undefined) inferredDirectives.formHide = existingField.directives.formHide;
      }
      
      generatedDirectives.columns[fieldName] = {
        directives: inferredDirectives
      };
      
      const status = existingField ? '🔄' : '➕';
      console.log(`  ${status} ${fieldName}: ${JSON.stringify(inferredDirectives)}`);
    }
    
    // Write complete directive file
    const generatedContent = JSON.stringify(generatedDirectives, null, 2);
    await fs.writeFile(directivePath, generatedContent, 'utf8');
    
    console.log(`✅ Generated complete directives for ${viewName}`);
    
  } catch (error) {
    console.error(`❌ Error generating directives for ${viewName}:`, error.message);
  }
}

/**
 * Generate directives for multiple views
 */
async function generateDirectives(viewNames = []) {
  console.log('🚀 Starting directive generation...');
  
  for (const viewName of viewNames) {
    await generateDirectiveFile(viewName);
  }
  
  console.log('✅ Directive generation complete!');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const viewNames = args.length > 0 ? args : ['ingrBtchList']; // Default to ingrBtchList
  
  generateDirectives(viewNames).catch(console.error);
}

export { generateDirectives, generateDirectiveFile, inferDirectives };