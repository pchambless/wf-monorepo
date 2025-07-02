/**
 * genPageMaps - Enhanced with automatic widget resolution
 * 
 * This utility reads SQL view files with comment directives and generates
 * configuration files for frontend components with automatic widget mapping.
 */
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const minimist = require('minimist');
const { getToolConfig } = require('../../toolConfig');

const args = minimist(process.argv.slice(2));
const app = args.app || 'client';
const config = getToolConfig(app);

const { entityRegistry } = require(config.registryPath);
const { FIELD_TYPES } = require('@whatsfresh/shared-config/src/common/directiveMap');

// Import widget registry for automatic widget resolution
const { WIDGET_REGISTRY } = require('@whatsfresh/shared-ui/src/registry');

/**
 * Resolve widget automatically based on selList directive
 */
function resolveWidget(directives) {
  if (directives.selList && directives.type === 'select') {
    // Look up widget by dataSource
    const widget = Object.values(WIDGET_REGISTRY).find(w => 
      w.dataSource === directives.selList
    );
    return widget?.id || null;
  }
  return null;
}

async function generatePageMaps() {
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
      const directives = await extractDirectives(entityName);
      
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
        formConfig: generateFormConfig(directives),
        
        // Add DML configuration
        dmlConfig: await generateDmlConfig(directives, entityName)
      };
      
      // Output as a JS module (to replace old pageMap)
      await writeOutput(entityName, pageMap);
      console.log(`✅ Generated pageMap for ${entityName}`);
      
    } catch (err) {
      console.error(`❌ Error processing ${entityName}: ${err.message}`);
    }
  }
}

// Helper functions for generating configs from directives
// For table config - include sys fields but mark as hidden
function generateTableConfig(directives) {
  // Transform directive columns into tableConfig columns
  const columns = Object.entries(directives.columns || {})
    .filter(([_, col]) => !col.directives.tableHide || col.directives.sys)
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

// Enhanced form generation function with automatic widget resolution
function generateFormConfig(directives) {
  // First collect all fields with their group info
  const fieldsByGroup = {};
  
  Object.entries(directives.columns || {})
    .filter(([_, col]) => !col.directives.formHide || col.directives.sys)
    .forEach(([field, col]) => {
      const fieldDirectives = col.directives;
      const isSystem = fieldDirectives.sys === true;
      
      // Default to group "1" if no group specified
      const groupId = fieldDirectives.grp || "1";
      
      if (!fieldsByGroup[groupId]) {
        fieldsByGroup[groupId] = [];
      }
      
      const formField = {
        field,
        label: fieldDirectives.label || field,
        type: fieldDirectives.type || 'text',
        required: fieldDirectives.required === true,
        hidden: isSystem || fieldDirectives.formHide === true
      };
      
      // Handle select fields with automatic widget resolution
      if (fieldDirectives.type === 'select') {
        // Check for selList directive
        if (fieldDirectives.selList) {
          formField.selList = fieldDirectives.selList;
          
          // AUTOMATIC WIDGET RESOLUTION
          const resolvedWidget = resolveWidget(fieldDirectives);
          if (resolvedWidget) {
            formField.widget = resolvedWidget;
            console.log(`✅ Auto-resolved widget for ${field}: ${resolvedWidget}`);
          } else {
            console.warn(`⚠️  No widget found for selList: ${fieldDirectives.selList}`);
          }
        } else {
          console.warn(`Warning: Select field ${field} missing selList directive`);
        }
        
        // Handle display field if specified
        if (fieldDirectives.dispField) {
          formField.dispField = fieldDirectives.dispField;
        } else if (fieldDirectives.valField && fieldDirectives.dispField) {
          formField.valField = fieldDirectives.valField;
          formField.dispField = fieldDirectives.dispField;
        }
      }
      
      // Add any other directive properties that might be needed
      if (fieldDirectives.width) formField.width = fieldDirectives.width;
      if (fieldDirectives.searchable) formField.searchable = fieldDirectives.searchable;
      
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
async function extractDirectives(entityName) {
  // Change parameter from entity to entityName
  const fs = require('fs').promises;
  const path = require('path');
  
  // Path to directive file - use entityName directly
  const directivePath = path.join(config.directivesDir, `${entityName}.json`);
  
  try {
    // Read and parse the directive file
    const directiveContent = await fs.readFile(directivePath, 'utf8');
    return JSON.parse(directiveContent);
  } catch (error) {
    console.error(`Error reading directive file for ${entityName}: ${error.message}`);
    return {}; // Return empty object as fallback
  }
}

// New function to write output files
async function writeOutput(entityName, pageMap) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const outputPath = path.join(config.outputDir, `${entityName}.js`);
  
  const content = `// Auto-generated by genPageMaps.js with widget resolution
export default ${JSON.stringify(pageMap, null, 2)};`;

  await fs.writeFile(outputPath, content, 'utf8');
}

// Add this function to parse SQL view definitions
async function extractColumnMappingsFromView(viewName) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Locate the SQL file for this view
    const sqlPath = path.join(__dirname, `../../sql/views/crud/${viewName}.sql`);
    const sqlContent = await fs.readFile(sqlPath, 'utf-8');
    
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
  
  // Create mappings using the SQL view information when available
  Object.entries(directives.columns || {}).forEach(([field, col]) => {
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
generatePageMaps().catch(console.error);

module.exports = { generatePageMaps, resolveWidget };