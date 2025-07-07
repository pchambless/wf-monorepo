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

// Create a simple logger instead of importing from shared-imports to avoid conflicts
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

// Direct imports to avoid module conflicts - using absolute paths from workspace root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../../../../');

// Dynamic imports to avoid module conflicts
async function getDirectImports(app) {
  const clientRegistryPath = path.join(workspaceRoot, 'packages/devtools/src/registries/client/pageMapRegistry.js');
  const adminRegistryPath = path.join(workspaceRoot, 'packages/devtools/src/registries/admin/pageMapRegistry.js');
  const directiveMapPath = path.join(workspaceRoot, 'packages/devtools/src/utils/directiveMap.js');
  const eventsDataPath = path.join(workspaceRoot, 'packages/devtools/src/docs/generated/events/events.json');
  const registryPath = app === 'admin' ? adminRegistryPath : clientRegistryPath;

  const [registryModule, directiveModule, eventsData] = await Promise.all([
    import(`file://${registryPath}`),
    import(`file://${directiveMapPath}`),
    fsPromises.readFile(eventsDataPath, 'utf8').then(data => JSON.parse(data))
  ]);

  // Create a map of event data by entity name for quick lookup
  const eventDataMap = {};
  eventsData.nodes.forEach(node => {
    eventDataMap[node.id] = node.meta;
  });

  return {
    entityRegistry: registryModule.pageMapRegistry,
    eventDataMap,
    FIELD_TYPES: directiveModule.FIELD_TYPES,
    WIDGET_REGISTRY: {} // Not needed - just for validation
  };
}

async function main() {
  const args = minimist(process.argv.slice(2));
  const app = args.app || 'client';
  const config = getToolConfig(app);

  log.info(`Generating page maps for ${app} app`);

  // Use dynamic imports to avoid module conflicts
  const { entityRegistry, eventDataMap, FIELD_TYPES, WIDGET_REGISTRY } = await getDirectImports(app);

  await generatePageMaps(config, entityRegistry, eventDataMap, FIELD_TYPES, WIDGET_REGISTRY);
}

async function generatePageMaps(config, entityRegistry, eventDataMap, FIELD_TYPES, WIDGET_REGISTRY) {
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
          table: eventDataMap[entityName]?.dbTable,
          primaryKey: eventDataMap[entityName]?.primaryKey,
          parentIdField: entity.parentIdField,
          childEntity: entity.childEntity,
          childIdField: entity.childIdField,
          listEvent: entityName,
          dmlEvent: 'execDML'
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
      await writeOutput(entityName, pageMap, config, entityRegistry);
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

// New function to write output files directly to page folders
async function writeOutput(entityName, pageMap, config, entityRegistry) {
  // Get the app type from config 
  const app = config.app || 'client';

  // Get entity info from registry to find page path
  const entity = entityRegistry[entityName];

  if (!entity || !entity.pageIndexPath) {
    console.warn(`Warning: No pageIndexPath found for ${entityName}, skipping pageMap generation`);
    return;
  }

  // Extract directory path from pageIndexPath (remove filename)
  const pathParts = entity.pageIndexPath.split('/');
  const dirPath = pathParts.slice(0, -1).join('/');

  // Create target directory in the app's pages folder
  const targetDir = path.resolve(__dirname, `../../../../../apps/wf-${app}/src/pages`, dirPath);

  // Ensure directory exists
  await fsPromises.mkdir(targetDir, { recursive: true });

  // Write pageMap.js directly to the page folder
  const outputPath = path.join(targetDir, 'pageMap.js');

  const content = `// Auto-generated by genPageMaps.js
const pageMap = ${JSON.stringify(pageMap, null, 2)};

export default pageMap;`;

  await fsPromises.writeFile(outputPath, content, 'utf8');
  console.log(`✅ Generated pageMap at: ${outputPath}`);
}

// Add this function to parse SQL view definitions
async function extractColumnMappingsFromView(viewName) {
  try {
    // fs and path already imported at top

    // Locate the SQL file for this view
    const sqlPath = path.join(__dirname, `../../../../../sql/views/client/${viewName}.sql`);
    const sqlContent = await fsPromises.readFile(sqlPath, 'utf-8');

    const mappings = {};

    // Process line by line to handle both AS patterns and dbColumn directives
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      // Skip comments-only or empty lines
      if (!line.trim() || (line.trim().startsWith('--') && !line.includes('AS '))) continue;

      // Look for AS patterns with column aliases
      if (line.includes(' AS ')) {
        const asMatch = line.match(/\s+AS\s+(\w+)/i);
        if (asMatch) {
          const viewColumn = asMatch[1].trim();

          // Extract the actual database column name
          let dbColumn;

          // Handle SQL functions like DATE_FORMAT(ib.purchase_date, '%Y-%m-%d')
          const functionMatch = line.match(/(\w+)\([\w\s]*(\w+)\.(\w+)[\s\S]*?\)/i);
          if (functionMatch) {
            // Extract the actual column name from inside the function
            dbColumn = functionMatch[3]; // The column name (e.g., "purchase_date")
          } else {
            // Handle simple column references like "ib.id"
            const simpleMatch = line.match(/(\w+)\.(\w+)\s+AS/i);
            if (simpleMatch) {
              dbColumn = simpleMatch[2];
            } else {
              // Last resort - try to find any column-like pattern
              const columnMatch = line.match(/(\w+)\s+AS/i);
              if (columnMatch) {
                dbColumn = columnMatch[1];
              }
            }
          }

          // Check for dbColumn directive override in comments
          const dbColMatch = line.match(/dbColumn:\s*([a-z0-9_]+)/i);
          if (dbColMatch) {
            mappings[viewColumn] = dbColMatch[1];
          } else if (dbColumn) {
            mappings[viewColumn] = dbColumn;
          }
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

  // Create mappings using the dbColumn from directives, exclude BI fields
  Object.entries(directives.columns || {}).forEach(([field, col]) => {
    // Skip BI fields - they don't participate in DML operations
    if (col.directives.BI) return;

    // Use dbColumn from directives if available, otherwise fallback to field name
    fieldMappings[field] = col.directives.dbColumn || field;
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