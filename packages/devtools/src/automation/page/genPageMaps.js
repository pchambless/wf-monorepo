/**
 * genPageMaps - Utility to generate page configuration maps from SQL views
 * 
 * This utility reads SQL view files with comment directives and generates
 * configuration files for frontend components.
 */
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import minimist from 'minimist';
import { fileURLToPath } from 'url';
import { getToolConfig } from '../../toolConfig.js';
import { sharedConfig, sharedUI, createLogger } from '@whatsfresh/shared-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logger for this component
const log = createLogger('genPageMaps');

async function main() {
  const args = minimist(process.argv.slice(2));
  const app = args.app || 'client';
  const config = getToolConfig(app);

  log.info(`Generating page maps for ${app} app`);

  // Use clean imports from shared-imports
  const { entityRegistry } = await sharedConfig[app].pageMapRegistry();
  const { FIELD_TYPES } = await sharedConfig.common.directiveMap();
  const { WIDGET_REGISTRY } = await sharedUI.registry();

  await generatePageMaps(config, entityRegistry, FIELD_TYPES, WIDGET_REGISTRY);
}

async function generatePageMaps(config, entityRegistry, FIELD_TYPES, WIDGET_REGISTRY) {
  // Set paths
  const outputDir = config.outputDir;
  const directivesDir = config.directivesDir;
  
  // Create output directory
  await fsPromises.mkdir(outputDir, { recursive: true });
  
  // Process each entity in registry that needs a pageMap
  for (const [entityName, entity] of Object.entries(entityRegistry)) {
    // Skip non-CRUD entities
    if (entity.layout !== 'CrudLayout') continue;
    
    console.log(`Processing ${entityName}...`);
    
    try {
      // Extract directives from SQL or separate JSON files
      const directives = await extractDirectives(entityName, config);
      
      // Generate optimized structure as the new pageMap format
      const pageMap = {
        // Core identity
        id: entityName,
        title: entity.title,
        
        // System fields
        systemConfig: {
          schema: entity.schema || 'whatsfresh',
          table: entity.db_table,
          primaryKey: entity.keyField,
          parentIdField: entity.parentIdField,
          childEntity: entity.childEntity,
          childIdField: entity.childIdField,
          listEvent: entityName // Add listEvent property
        },
        
        // UI metadata
        uiConfig: {
          section: entity.section,
          icon: entity.icon,
          color: entity.color,
          actions: {
            rowActions: [],
            tableActions: []
          }
        },
        
        // Generate table and form configs from directives
        tableConfig: generateTableConfig(directives),
        formConfig: generateFormConfig(directives, WIDGET_REGISTRY),
        
        // Add DML configuration
        dmlConfig: await generateDmlConfig(directives, entityName)
      };
      
      // Output as a JS module (to replace old pageMap)
      await writeOutput(entityName, pageMap, config);
      console.log(`✅ Generated pageMap for ${entityName}`);
      
    } catch (err) {
      console.error(`❌ Error processing ${entityName}: ${err.message}`);
    }
  }
}

// Helper functions for generating configs from directives
// For table config - include sys fields but mark as hidden, exclude BI fields
function generateTableConfig(directives) {
  // Transform directive columns into tableConfig columns
  const columns = Object.entries(directives.columns || {})
    .filter(([_, col]) => {
      // Exclude BI fields from tables, include if: not hidden OR is system field
      return !col.directives.BI && (!col.directives.tableHide || col.directives.sys);
    })
    .map(([field, col]) => {
      const isSystem = col.directives.sys === true;
      
      return {
        field,
        label: col.directives.label || field,
        width: col.directives.width || 150,
        type: col.directives.type || 'text',
        editable: isSystem ? false : (col.directives.editable !== false),
        hidden: isSystem || col.directives.tableHide === true
      };
    });
  
  return { columns };
}

// Update the form generation function
function generateFormConfig(directives, WIDGET_REGISTRY) {
  // First collect all fields with their group info
  const fieldsByGroup = {};
  
  Object.entries(directives.columns || {})
    .filter(([_, col]) => !col.directives.BI && (!col.directives.formHide || col.directives.sys))
    .forEach(([field, col]) => {
      const directives = col.directives;
      const isSystem = directives.sys === true;
      
      // Default to group "1" if no group specified
      const groupId = directives.grp || "1";
      
      if (!fieldsByGroup[groupId]) {
        fieldsByGroup[groupId] = [];
      }
      
      const formField = {
        field,
        label: directives.label || field,
        type: directives.type || 'text',
        required: directives.required === true,
        hidden: isSystem || directives.formHide === true
      };
      
      // Handle select fields with widget directive
      if (directives.type === 'select') {
        // Check for widget directive
        if (directives.widget) {
          formField.widget = directives.widget;
          
          // Validate widget exists in registry
          const widgetDef = WIDGET_REGISTRY[directives.widget];
          if (!widgetDef) {
            console.warn(`Warning: Widget ${directives.widget} not found in registry for field ${field}`);
          }
        } else {
          console.warn(`Warning: Select field ${field} missing widget directive`);
        }
        
        // Handle display field if specified
        if (directives.dispField) {
          formField.dispField = directives.dispField;
        } else if (directives.valField && directives.dispField) {
          formField.valField = directives.valField;
          formField.dispField = directives.dispField;
        }
      }
      
      fieldsByGroup[groupId].push(formField);
    });
  
  // Create groups array with fields
  const groups = [];
  
  // Sort groups by their ID to ensure logical order
  const sortedGroupIds = Object.keys(fieldsByGroup).sort();
  
  for (const groupId of sortedGroupIds) {
    groups.push({
      id: groupId,
      title: `Group ${groupId}`,
      fields: fieldsByGroup[groupId]
    });
  }
  
  return { groups };
}

// You also need the generateFieldMappings function
function generateFieldMappings(directives) {
  // Create field mappings from directives
  return Object.entries(directives.columns || {})
    .reduce((mappings, [field, col]) => {
      // Use db_column if available, otherwise use field name
      mappings[field] = col.directives.db_column || field;
      return mappings;
    }, {});
}

// Add this function to your file, near the top with other imports/utilities
async function extractDirectives(entityName, config) {
  // Change parameter from entity to entityName
  // fs and path already imported at top
  
  // Path to directive file - use entityName directly
  const directivePath = path.join(config.directivesDir, `${entityName}.json`);
  
  try {
    // Read and parse the directive file
    const directiveContent = await fsPromises.readFile(directivePath, 'utf8');
    return JSON.parse(directiveContent);
  } catch (error) {
    console.error(`Error reading directive file for ${entityName}: ${error.message}`);
    return {}; // Return empty object as fallback
  }
}

// New function to write output files
async function writeOutput(entityName, pageMap, config) {
  // fs and path already imported at top
  
  const outputPath = path.join(config.outputDir, `${entityName}.js`);
  
  const content = `// Auto-generated by genPageMaps.js
export default ${JSON.stringify(pageMap, null, 2)};`;

  await fsPromises.writeFile(outputPath, content, 'utf8');
}

// Add this function to parse SQL view definitions
async function extractColumnMappingsFromView(viewName) {
  try {
    // fs and path already imported at top
    
    // Locate the SQL file for this view
    const sqlPath = path.join(__dirname, `../../sql/views/crud/${viewName}.sql`);
    const sqlContent = await fsPromises.readFile(sqlPath, 'utf-8');
    
    const mappings = {};
    
    // Process line by line to handle both AS patterns and dbColumn directives
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      // Skip comments-only or empty lines
      if (!line.trim() || (line.trim().startsWith('--') && !line.includes('AS '))) continue;
      
      // Look for AS patterns with column aliases
      const asMatch = line.match(/([a-z0-9_\.]+)\s+AS\s+([a-z0-9_]+)/i);
      if (asMatch) {
        const fullRef = asMatch[1].trim();
        const viewColumn = asMatch[2].trim();
        
        // Extract dbColumn from field ref (a.id → id)
        const dbColumn = fullRef.includes('.') ? fullRef.split('.')[1] : fullRef;
        
        // Check for dbColumn directive override
        const dbColMatch = line.match(/dbColumn:\s*([a-z0-9_]+)/i);
        if (dbColMatch) {
          mappings[viewColumn] = dbColMatch[1];
        } else {
          mappings[viewColumn] = dbColumn;
        }
      }
    }
    
    return mappings;
  } catch (err) {
    console.warn(`Warning: Could not extract column mappings from view ${viewName}: ${err.message}`);
    return {};
  }
}

// Modify your DML config generation function
async function generateDmlConfig(directives, viewName) {
  // Extract mappings from the SQL view
  const sqlMappings = await extractColumnMappingsFromView(viewName);
  const fieldMappings = {};
  const pkField = findPrimaryKeyField(directives);
  
  // Create mappings using the SQL view information when available, exclude BI fields
  Object.entries(directives.columns || {}).forEach(([field, col]) => {
    // Skip BI fields - they don't participate in DML operations
    if (col.directives.BI) return;
    
    // Use SQL mapping if available, otherwise use the field name
    fieldMappings[field] = sqlMappings[field] || field;
  });
  
  return {
    fieldMappings,
    operations: {
      // Exclude primary key from INSERT operations
      insert: {
        excludeFields: pkField ? [pkField] : []
      },
      update: {},
      delete: {}
    }
  };
}

// Add the required function for finding primary key
function findPrimaryKeyField(directives) {
  for (const [field, col] of Object.entries(directives.columns || {})) {
    if (col.directives.PK === true) {
      return field;
    }
  }
  return null;
}

// Run the generator
main().catch(console.error);

export { generatePageMaps };