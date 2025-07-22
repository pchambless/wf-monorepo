/**
 * genDirectives - Generate complete directive files from SQL views
 * 
 * This utility analyzes SQL views and generates complete directive files
 * with intelligent defaults while preserving manual overrides for labels, widths, and groups.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { processDirectives } from '../../utils/directiveMap.js';

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
    directives: { type: 'select', widget: 'SelVndr', label: 'Vendor', grp: '1' }
  },

  BrandID: {
    pattern: /brndID$/i,
    directives: { type: 'select', widget: 'SelBrnd', label: 'Brand', grp: '2' }
  },

  MeasureID: {
    pattern: /measID$/i,
    directives: { type: 'select', widget: 'SelMeas', label: 'Measure', grp: '3' }
  },

  IngredientID: {
    pattern: /ingrID$/i,
    directives: { type: 'select', widget: 'SelIngr', label: 'Ingredient', sys: true }
  },

  ProductID: {
    pattern: /prodID$/i,
    directives: { type: 'select', widget: 'SelProd', label: 'Product', grp: '1' }
  },

  WorkerID: {
    pattern: /wrkrID$/i,
    directives: { type: 'select', widget: 'SelWrkr', label: 'Worker', grp: '1' }
  },

  AccountID: {
    pattern: /acctID$/i,
    directives: { type: 'number', sys: true }
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

  // Name fields (default text type, BI status determined by categorization)
  Name: {
    pattern: /(Name|Type)$/i,
    directives: { type: 'text', width: '150' }
  },

  // Code fields (default text type, BI status determined by categorization)
  Code: {
    pattern: /Code$/i,
    directives: { type: 'text', width: '100' }
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
 * Integration wrapper for directiveMap.processDirectives()
 * Converts genDirectives format to directiveMap format and back
 */
function processDirectivesWrapper(rawDirectives) {
  try {
    // Process directives through directiveMap system
    const processedDirectives = processDirectives(rawDirectives);
    
    console.log(`🔧 DirectiveMap processed: ${JSON.stringify(rawDirectives)} → ${JSON.stringify(processedDirectives)}`);
    
    return processedDirectives;
  } catch (error) {
    console.warn(`⚠️ DirectiveMap processing failed for ${JSON.stringify(rawDirectives)}: ${error.message}`);
    // Fallback to original directives if processing fails
    return rawDirectives;
  }
}

/**
 * Test basic directiveMap integration with sample directive
 */
function testDirectiveMapIntegration() {
  console.log('🧪 Testing directiveMap integration...');
  
  // Test sample directive - parent key field
  const sampleParentKey = { parentKey: true, type: 'number' };
  const processedParentKey = processDirectivesWrapper(sampleParentKey);
  console.log(`✅ Parent key test: ${JSON.stringify(sampleParentKey)} → ${JSON.stringify(processedParentKey)}`);
  
  // Test sample directive - regular field
  const sampleRegular = { type: 'text', label: 'Test Field', grp: 1 };
  const processedRegular = processDirectivesWrapper(sampleRegular);
  console.log(`✅ Regular field test: ${JSON.stringify(sampleRegular)} → ${JSON.stringify(processedRegular)}`);
  
  console.log('✅ DirectiveMap integration test complete');
}

/**
 * Infer directives from SQL analysis - simplified approach
 */
async function inferDirectivesFromSQL(fieldName, fieldInfo, viewName) {
  const { dbColumn, isDirect } = fieldInfo;
  const viewKeys = getViewKeys(viewName);
  
  // Primary/parent key check - process through directiveMap
  if (fieldName === viewKeys.primaryKey) {
    const pkDirectives = { PK: true, sys: true, type: 'number' };
    return processDirectivesWrapper(pkDirectives);
  }
  if (fieldName === viewKeys.parentKey) {
    const parentKeyDirectives = { parentKey: true, sys: true, type: 'number' };
    return processDirectivesWrapper(parentKeyDirectives);
  }
  
  // For direct table columns, use enhanced logic
  if (isDirect && dbColumn) {
    let directives = {
      label: generateLabel(fieldName),
      grp: '1',
      type: 'text',
      dbColumn: dbColumn
    };
    
    // Description/comments fields = multiLine
    if (fieldName.match(/(description|comments|desc)$/i)) {
      directives.type = 'multiLine';
      directives.grp = '5';
      directives.tableHide = true;
    }
    
    // Check field patterns for select widgets and other special types
    for (const [patternName, config] of Object.entries(FIELD_PATTERNS)) {
      if (config.pattern.test(fieldName)) {
        // Override defaults with pattern-based directives
        directives = {
          ...directives,
          ...config.directives,
          label: config.directives.label || directives.label,
          dbColumn: dbColumn // Keep the actual database column
        };
        break;
      }
    }
    
    // Process through directiveMap system before applying smart rules
    const processedDirectives = processDirectivesWrapper(directives);
    return applySmartRules(processedDirectives, null, fieldName);
  }
  
  // If we reach here, SQL analysis failed - this is a critical error
  throw new Error(`❌ SQL analysis failed for field '${fieldName}' in view '${viewName}'. Check SQL view structure and field categorization logic.`);
}


/**
 * Apply smart width allocation and streamlined hide rules
 * Note: Most business rules are now handled by directiveMap.processDirectives()
 */
function applySmartRules(directives, sampleData, fieldName = null) {
  // System fields: minimal attributes, widgets handle hiding
  if (directives.sys || directives.PK || directives.parentKey) {
    // Set label to fieldName for debugging
    if (fieldName) {
      directives.label = fieldName;
    }
    // Remove unnecessary attributes for sys fields - directiveMap handles the hiding
    delete directives.width;
    delete directives.grp;
    // Don't manually set hide attributes - directiveMap handles this
    return directives; // Early return to avoid other rules
  }

  // Set smart width based on type for non-sys fields
  if (!directives.width) {
    directives.width = SMART_WIDTHS[directives.type] || SMART_WIDTHS.text;
  }

  // Note: tableHide for select and multiLine fields is now handled by directiveMap
  // Note: BI field rules are now handled by directiveMap

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
 * Extract field names from enhanced SQL view with three-tier categorization
 */
async function extractViewFields(viewName) {
  const sqlPath = path.join(__dirname, `../../../../../sql/views/client/${viewName}.sql`);

  try {
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    const fields = [];
    const fieldNames = new Set(); // Track field names to avoid duplicates

    // First, determine the main table alias from the FROM clause
    const mainTableAlias = await extractMainTableAlias(sqlContent, viewName);
    
    // Parse SELECT statements to find field aliases and source columns
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      // Look for AS patterns (field aliases)
      const asMatch = line.match(/\s+(.+?)\s+AS\s+([a-zA-Z][a-zA-Z0-9_]*)/i);
      if (asMatch) {
        const sourceExpression = asMatch[1].trim();
        const fieldName = asMatch[2].trim();

        // Skip if we've already processed this field name
        if (fieldNames.has(fieldName)) {
          continue;
        }
        fieldNames.add(fieldName);

        // Categorize field based on three-tier system
        const fieldCategory = categorizeField(sourceExpression, mainTableAlias);

        fields.push({
          fieldName,
          dbColumn: fieldCategory.dbColumn,
          sourceColumn: sourceExpression,
          isComputed: fieldCategory.isComputed,
          isBI: fieldCategory.isBI,
          isJoined: fieldCategory.isJoined,
          isDirect: fieldCategory.isDirect
        });
      }
    }

    return fields;
  } catch (error) {
    console.error(`Error reading view ${viewName}:`, error.message);
    return [];
  }
}

/**
 * Extract the main table alias from FROM clause
 */
async function extractMainTableAlias(sqlContent, viewName) {
  const lines = sqlContent.split('\n');
  
  for (const line of lines) {
    // Look for FROM clauses
    const fromMatch = line.match(/FROM\s+[\w.]+\s+(\w+)/i);
    if (fromMatch) {
      return fromMatch[1];
    }
    
    // Also check for legacy view patterns
    const legacyMatch = line.match(/FROM\s+[\w.]+\.(v_\w+)\s+(\w+)/i);
    if (legacyMatch) {
      return legacyMatch[2]; // Return the alias, not the view name
    }
  }
  
  return 'a'; // Default fallback
}

/**
 * Categorize field based on three-tier system
 */
function categorizeField(sourceExpression, mainTableAlias) {
  // Tier 3: Calculated/Derived Fields (BI: true)
  if (sourceExpression.includes('CASE') ||
      sourceExpression.includes('CONCAT') ||
      sourceExpression.includes('CAST(') ||
      sourceExpression.includes('FORMAT(') ||
      sourceExpression.includes('COALESCE') && sourceExpression.includes('*') ||
      sourceExpression.includes('NULLIF') ||
      sourceExpression.includes('IFNULL') ||
      sourceExpression.includes('DATE_FORMAT') ||
      sourceExpression.includes('CURDATE') ||
      sourceExpression.includes('DATE_ADD') ||
      sourceExpression.includes('DATE_SUB')) {
    return {
      dbColumn: null,
      isComputed: true,
      isBI: true,
      isJoined: false,
      isDirect: false
    };
  }

  // Simple column reference: table.column
  if (sourceExpression.includes('.')) {
    const parts = sourceExpression.split('.');
    const tableAlias = parts[0].trim();
    const columnName = parts[1].trim();
    
    // Tier 1: Direct Table Columns (main table)
    if (tableAlias === mainTableAlias) {
      return {
        dbColumn: columnName,
        isComputed: false,
        isBI: false,
        isJoined: false,
        isDirect: true
      };
    } else {
      // Tier 2: Joined Table Columns (BI: true)
      return {
        dbColumn: columnName,
        isComputed: false,
        isBI: true,
        isJoined: true,
        isDirect: false
      };
    }
  }

  // Function calls with table references
  if (sourceExpression.includes('(')) {
    const functionMatch = sourceExpression.match(/(\w+)\.(\w+)/);
    if (functionMatch) {
      const tableAlias = functionMatch[1];
      const columnName = functionMatch[2];
      
      if (tableAlias === mainTableAlias) {
        // Function on main table column - still direct
        return {
          dbColumn: columnName,
          isComputed: false,
          isBI: false,
          isJoined: false,
          isDirect: true
        };
      } else {
        // Function on joined table - BI
        return {
          dbColumn: columnName,
          isComputed: false,
          isBI: true,
          isJoined: true,
          isDirect: false
        };
      }
    }
  }

  // Fallback for complex expressions
  return {
    dbColumn: null,
    isComputed: true,
    isBI: true,
    isJoined: false,
    isDirect: false
  };
}

/**
 * Generate complete directive file from SQL view
 */
async function generateDirectiveFile(viewName) {
  const directivePath = path.join(__dirname, `../data/directives/${viewName}.json`);

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

    // Track database columns to detect duplicates
    const dbColumnUsage = new Map();

    for (const fieldInfo of viewFields) {
      const { fieldName, dbColumn, isComputed, isBI, isJoined, isDirect } = fieldInfo;
      const existingField = existingDirectives.columns?.[fieldName];

      // Start with smart directive inference
      let inferredDirectives = await inferDirectivesFromSQL(fieldName, fieldInfo, viewName);

      // Apply three-tier categorization
      if (isBI || isComputed || isJoined) {
        // Tier 2 & 3: BI fields (joined tables or calculated fields)
        inferredDirectives.BI = true;
        inferredDirectives.tableHide = true;
        inferredDirectives.formHide = true;
        inferredDirectives.excludeFromDML = true;
        delete inferredDirectives.grp; // BI fields don't need groups
        inferredDirectives.dbColumn = dbColumn || 'COMPUTED_FIELD';
        
        const categoryType = isComputed ? 'calculated' : 'joined table';
        console.log(`🔍 Marking ${fieldName} as BI - ${categoryType} field`);
      } else if (isDirect) {
        // Tier 1: Direct table columns - regular fields
        // Check for duplicate database column usage
        if (dbColumnUsage.has(dbColumn)) {
          // This is a duplicate - mark as BI
          inferredDirectives.BI = true;
          inferredDirectives.tableHide = true;
          inferredDirectives.formHide = true;
          inferredDirectives.excludeFromDML = true;
          delete inferredDirectives.grp;
          inferredDirectives.dbColumn = `${dbColumn}_DUPLICATE`;
          console.log(`⚠️  Marking ${fieldName} as BI - duplicate database column: ${dbColumn}`);
        } else {
          // First usage of this database column - regular field
          dbColumnUsage.set(dbColumn, fieldName);
          inferredDirectives.dbColumn = dbColumn;
          console.log(`✅ Processing ${fieldName} as direct table column: ${dbColumn}`);
        }
      } else {
        // Fallback for unclear cases
        inferredDirectives.BI = true;
        inferredDirectives.tableHide = true;
        inferredDirectives.formHide = true;
        inferredDirectives.excludeFromDML = true;
        delete inferredDirectives.grp;
        inferredDirectives.dbColumn = dbColumn || 'UNKNOWN_FIELD';
        console.log(`⚠️  Marking ${fieldName} as BI - unclear field category`);
      }

      // Preserve manual overrides with conflict detection
      if (existingField?.directives) {
        const existing = existingField.directives;
        
        // Only preserve labels for non-sys fields - sys fields use debug labels
        if (existing.label && !inferredDirectives.sys && !inferredDirectives.PK && !inferredDirectives.parentKey) {
          inferredDirectives.label = existing.label;
        } else if (existing.label && (inferredDirectives.sys || inferredDirectives.PK || inferredDirectives.parentKey)) {
          console.warn(`⚠️ Ignoring manual label "${existing.label}" for system field ${fieldName} - sys fields use debug labels`);
        }
        
        // Only preserve width and grp for non-sys fields
        if (!inferredDirectives.sys && !inferredDirectives.PK && !inferredDirectives.parentKey) {
          if (existing.width) inferredDirectives.width = existing.width;
          if (existing.grp) inferredDirectives.grp = existing.grp;
        } else {
          if (existing.width) console.warn(`⚠️ Ignoring manual width for system field ${fieldName} - directiveMap handles sys field layout`);
          if (existing.grp) console.warn(`⚠️ Ignoring manual group for system field ${fieldName} - directiveMap handles sys field layout`);
        }

        // Preserve required flag but warn about conflicts with directiveMap rules
        if (existing.required !== undefined) {
          if (inferredDirectives.parentKey && !existing.required) {
            console.warn(`⚠️ Manual required:false conflicts with parentKey field ${fieldName} - parent keys should be required`);
          }
          inferredDirectives.required = existing.required;
        }
        
        // Only preserve hide flags for BI fields - sys fields should not have manual hide flags
        if (inferredDirectives.BI) {
          if (existing.tableHide !== undefined) inferredDirectives.tableHide = existing.tableHide;
          if (existing.formHide !== undefined) inferredDirectives.formHide = existing.formHide;
        } else if (existing.tableHide !== undefined || existing.formHide !== undefined) {
          if (inferredDirectives.sys || inferredDirectives.PK || inferredDirectives.parentKey) {
            console.warn(`⚠️ Ignoring manual hide flags for system field ${fieldName} - directiveMap handles sys field visibility`);
          }
        }

        // Preserve existing dbColumn if manually set
        if (existing.dbColumn) inferredDirectives.dbColumn = existing.dbColumn;
        
        // Preserve other manual customizations with warnings for potential conflicts
        if (existing.widget && inferredDirectives.type !== 'select') {
          console.warn(`⚠️ Manual widget "${existing.widget}" on non-select field ${fieldName} may not work correctly`);
          inferredDirectives.widget = existing.widget;
        } else if (existing.widget) {
          inferredDirectives.widget = existing.widget;
        }
        
        // Preserve decimal precision
        if (existing.dec) inferredDirectives.dec = existing.dec;
        
        // Preserve validation rules
        if (existing.min !== undefined) inferredDirectives.min = existing.min;
        if (existing.max !== undefined) inferredDirectives.max = existing.max;
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
  
  // Test directiveMap integration if --test flag is provided
  if (args.includes('--test')) {
    testDirectiveMapIntegration();
  } else {
    const viewNames = args.length > 0 ? args : ['ingrBtchList']; // Default to ingrBtchList
    generateDirectives(viewNames).catch(console.error);
  }
}

export { generateDirectives, generateDirectiveFile };