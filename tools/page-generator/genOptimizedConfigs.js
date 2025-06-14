const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function generateOptimizedConfigs() {
  const pageMapDir = path.resolve(__dirname, '../../packages/shared-config/src/pageMap');
  const configDir = path.resolve(__dirname, '../../packages/shared-config/src/optimized');
  
  // Create output directory
  await fsPromises.mkdir(configDir, { recursive: true });
  
  // Get all pageMap files
  const files = await fsPromises.readdir(pageMapDir);
  const jsFiles = files.filter(f => f.endsWith('.js') && f !== 'index.js');
  
  console.log(`Found ${jsFiles.length} pageMap files to process...`);
  
  for (const file of jsFiles) {
    const entityName = path.basename(file, '.js');
    console.log(`Processing ${entityName}...`);
    
    try {
      // Import the pageMap
      const pageMapPath = path.join(pageMapDir, file);
      const pageMap = require(pageMapPath).default;
      
      // Create optimized config with separate sections for different components
      const optimizedConfig = {
        // Core identity
        id: pageMap.id,
        title: pageMap.title,
        
        // System fields needed for data operations
        systemConfig: {
          schema: pageMap.schema,
          table: pageMap.table,
          primaryKey: pageMap.keyField || Object.keys(pageMap.columns).find(key => pageMap.columns[key].primaryKey),
          parentIdField: pageMap.parentIdField,
          childEntity: pageMap.childEntity,
          childIdField: pageMap.childIdField
        },
        
        // UI metadata
        uiConfig: {
          section: pageMap.section,
          icon: pageMap.icon,
          color: pageMap.color,
          actions: pageMap.actions
        },
        
        // Table-specific configuration
        tableConfig: {
          columns: Object.values(pageMap.columns)
            .filter(col => !col.tableHide && !col.sys) // CHANGED from hidden to tableHide and system to sys
            .map(col => {
              // Validation for select fields
              if (col.type === 'select' && !col.entity) { // CHANGED from displayType to type
                console.warn(`Warning: Select field ${col.field} missing entity directive`);
              }
              
              return {
                field: col.field,
                label: col.label || col.field, // CHANGED from headerName to label
                width: col.width || 150,
                type: col.type || 'text', // Already correct
                editable: col.editable !== false
              };
            })
        },
        
        // Form-specific configuration
        formConfig: {
          groups: [], // Will be populated below
          hiddenFields: Object.values(pageMap.columns)
            .filter(col => col.tableHide || col.sys) // CHANGED from hidden/system to tableHide/sys
            .map(col => ({
              field: col.field,
              type: 'hidden'
            })),
          fields: Object.values(pageMap.columns)
            .filter(col => !col.formHide && !col.sys) // CHANGED from hideInForm/system to formHide/sys
            .map(col => ({
              field: col.field,
              label: col.label || col.field, // CHANGED to use label consistently
              req: !!col.req, // CHANGED from required to req
              type: col.type || 'text', // CHANGED from displayType to type
              component: col.component || 'TextField', // CHANGED from componentType to component
              props: col.props || {}, // CHANGED from componentConfig?.props to props
              // For select fields
              ...(col.type === 'select' ? { // CHANGED from displayType to type
                entity: col.entity,
                valField: col.valField, // CHANGED from valueField to valField
                dispField: col.dispField // CHANGED from displayField to dispField
              } : {})
            }))
        }
      };
      
      // Process form fields by group
      const fieldGroups = {};
      
      // Group fields by their group property
      Object.values(pageMap.columns)
        .filter(col => !col.hidden && !col.system)
        .forEach(col => {
          const grp = col.grp || 1; // CHANGED from group to grp
          if (!fieldGroups[grp]) {
            fieldGroups[grp] = [];
          }
          
          fieldGroups[grp].push({
            field: col.field,
            label: col.headerName || col.field,
            // Use actual displayType instead of defaulting to text
            type: col.displayType || 'text',
            required: !!col.required,
            editable: col.editable !== false,
            // Add component type for rendering hints
            component: col.componentType || 'TextField',
            // Include any special props
            componentProps: col.componentConfig?.props || {}
          });
        });
      
      // Convert grouped fields to array format
      optimizedConfig.formConfig.groups = Object.entries(fieldGroups)
        .sort(([groupA], [groupB]) => parseInt(groupA) - parseInt(groupB))
        .map(([groupId, fields]) => ({
          id: parseInt(groupId),
          fields
        }));
      
      // Save to JSON file
      const outputPath = path.join(configDir, `${entityName}.json`);
      await fsPromises.writeFile(
        outputPath, 
        JSON.stringify(optimizedConfig, null, 2)
      );
      console.log(`Generated optimized config for ${entityName}`);
    } catch (err) {
      console.error(`Error processing ${entityName}: ${err.message}`);
    }
  }
  
  console.log(`Optimized configs generated at ${configDir}`);
}

// Run the generator
generateOptimizedConfigs().catch(console.error);

// Add this at the end of the file
module.exports = { generateOptimizedConfigs };