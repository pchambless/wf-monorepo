/**
 * genPageMaps - Utility to generate page configuration maps from SQL views
 * 
 * This utility reads SQL view files with comment directives and generates
 * configuration files for frontend components.
 */
const fs = require('fs').promises;
const path = require('path');
const { entityRegistry } = require('../packages/shared-config/pageMapRegistry');
const routes = require('../packages/shared-config/src/routes');

// Configuration
const viewDirs = [
  // Change this to match your actual folder structure
  path.resolve(__dirname, '../sql/views/crud'),
  path.resolve(__dirname, '../sql/views/admin'),
];
const outputDir = path.resolve(__dirname, '../packages/shared-config/src/pageMap');

console.log('SQL view directories:');
viewDirs.forEach(dir => console.log('- ' + dir));
console.log('Output directory:', outputDir);

// Parse SQL comments for directives
async function parseViewFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Extract view name from filename
    const viewName = path.basename(filePath, '.sql');
    
    // Extract header directives
    const headerMatch = content.match(/\/\*[\s\S]*?\*\//);
    const headerDirectives = {};
    
    if (headerMatch) {
      const headerText = headerMatch[0];
      const directiveMatches = headerText.matchAll(/@(\w+)\s+([^\r\n]+)/g);
      
      for (const match of directiveMatches) {
        headerDirectives[match[1]] = match[2].trim();
      }
    }
    
    // Extract column directives
    const columns = [];
    const columnMatches = content.matchAll(/(\w+)\s+AS\s+(\w+),?\s*--\s*(.+?)(?=\r?\n)/g);
    
    for (const match of columnMatches) {
      const sourceColumn = match[1];
      const alias = match[2];
      const directiveText = match[3].trim();
      
      // Parse individual directives
      const directives = {};
      const directiveParts = directiveText.split(';').map(part => part.trim());
      
      for (const part of directiveParts) {
        // Handle special cases like PK, sys, req
        if (part === 'PK') directives.primaryKey = true;
        else if (part === 'sys') directives.system = true;
        else if (part === 'req') directives.required = true;
        else if (part === 'tableHide') directives.tableHide = true;
        else if (part === 'readonly') directives.readonly = true;
        else if (part === 'searchable') directives.searchable = true;
        else if (part === 'unique') directives.unique = true;
        else {
          // Handle key:value directives
          const [key, value] = part.split(':').map(p => p.trim());
          if (key && value) {
            // Handle special cases for certain directive types
            if (key === 'type' && value === 'select') {
              directives.type = 'select';
            } else if (key === 'options') {
              // Parse options format like "1=Admin,2=Manager,3=User"
              directives.options = value.split(',').map(opt => {
                const [val, label] = opt.split('=');
                return { value: val, label };
              });
            } else if (key === 'dec') {
              // Handle decimal precision like "10,2"
              const [precision, scale] = value.split(',');
              directives.precision = parseInt(precision);
              directives.scale = parseInt(scale);
            } else {
              directives[key] = value;
            }
          }
        }
      }
      
      columns.push({
        sourceColumn,
        alias,
        ...directives
      });
    }
    
    return {
      viewName,
      headerDirectives,
      columns,
      filePath
    };
  } catch (error) {
    console.error(`Error parsing view file ${filePath}:`, error);
    return null;
  }
}

// Generate page map from parsed view
function generatePageMap(parsedView) {
  const { viewName, headerDirectives, columns } = parsedView;
  const registryEntry = entityRegistry[viewName] || {};
  
  // Basic page configuration - streamlined
  const pageMap = {
    id: viewName,
    title: formatTitle(viewName), // Convert to user-friendly title (e.g. "Ingredient Types")
    schema: headerDirectives.schema || 'api_wf',
    table: registryEntry.db_table || headerDirectives.table,
    
    // Include essential UI metadata
    section: registryEntry.section || 'other',
    icon: registryEntry.icon,
    color: registryEntry.color,
    
    // Relationship fields
    parentIdField: registryEntry.parentIdField,
    childEntity: registryEntry.childEntity,
    childIdField: registryEntry.childIdField,
    keyField: registryEntry.keyField || columns.find(c => c.primaryKey)?.alias,
    
    columns: {}
  };
  
  // Process columns
  let columnId = 1;
  for (const column of columns) {
    pageMap.columns[column.alias] = {
      id: columnId++, // Add sequential numeric ID
      field: column.alias,
      db_column: column.db_column || column.sourceColumn, // Important! Map to database column
      headerName: column.label || formatColumnName(column.alias),
      width: parseInt(column.width) || 150,
      type: column.type || 'text',
      group: parseInt(column.grp) || 1,
      hidden: column.tableHide || column.system || false,
      required: column.required || false,
      primaryKey: column.primaryKey || false,
      editable: !column.readonly && !column.system,
      searchable: column.searchable || false
    };
    
    // Add select-specific properties
    if (column.type === 'select') {
      if (column.entity) {
        pageMap.columns[column.alias].entity = column.entity;
        pageMap.columns[column.alias].valueField = column.valField;
        pageMap.columns[column.alias].displayField = column.dispField;
      } else if (column.options) {
        pageMap.columns[column.alias].options = parseOptions(column.options);
      }
    }
  }
  
  // Generate child navigation if childEntity exists
  if (registryEntry.childEntity) {
    const childConfig = entityRegistry[registryEntry.childEntity] || {};
    const routeKey = childConfig.routeKey;
    
    // Use routes from shared-config instead of hardcoded strings
    if (routeKey && routes[routeKey]) {
      pageMap.actions.rowActions.push({
        id: `view-${registryEntry.childEntity}`,
        icon: "Visibility",
        tooltip: `View ${formatTitle(registryEntry.childEntity.replace('List', ''))}`,
        route: `${routes[routeKey]}/:${registryEntry.childIdField}`,
        paramField: registryEntry.childIdField
      });
    }
  }
  
  // Similarly for additionalChildren
  if (registryEntry.additionalChildren) {
    registryEntry.additionalChildren.forEach(childInfo => {
      const childConfig = entityRegistry[childInfo.entity] || {};
      if (childConfig.routeKey && routes[childConfig.routeKey]) {
        pageMap.actions.rowActions.push({
          id: `view-${childInfo.entity}`,
          icon: childInfo.icon || "Visibility",
          tooltip: childInfo.label || `View ${formatTitle(childInfo.entity.replace('List', ''))}`,
          route: `${routes[childConfig.routeKey]}/:${childInfo.idField || registryEntry.keyField}`,
          paramField: childInfo.idField || registryEntry.keyField
        });
      }
    });
  }
  
  return pageMap;
}

// Helper function to format title
function formatTitle(viewName) {
  // Remove "List" suffix if present
  const baseName = viewName.replace(/List$/, '');
  
  // Format based on common patterns
  if (baseName === 'ingrType') return 'Ingredient Types';
  if (baseName === 'ingr') return 'Ingredients';
  if (baseName === 'ingrBtch') return 'Ingredient Batches';
  if (baseName === 'prodType') return 'Product Types';
  if (baseName === 'prod') return 'Products';
  if (baseName === 'prodBtch') return 'Product Batches';
  if (baseName === 'brnd') return 'Brands';
  if (baseName === 'vndr') return 'Vendors';
  if (baseName === 'wrkr') return 'Workers';
  if (baseName === 'meas') return 'Measures';
  if (baseName === 'task') return 'Tasks';
  if (baseName === 'rcpe') return 'Recipes';
  if (baseName === 'acct') return 'Accounts';
  if (baseName === 'user') return 'Users';
  
  // Default formatting for unknown entity types
  return baseName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// Helper function to format column names
function formatColumnName(columnName) {
  // Remove prefixes like "ingr", "prod", etc.
  let displayName = columnName;
  const prefixes = ['ingr', 'prod', 'acct', 'vndr', 'brnd', 'wrkr', 'meas', 'btch', 'task', 'rcpe'];
  
  for (const prefix of prefixes) {
    if (displayName.startsWith(prefix) && displayName !== prefix) {
      // Remove prefix and capitalize first letter of remaining part
      displayName = displayName.substring(prefix.length);
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      break;
    }
  }
  
  // Handle special cases
  if (displayName === 'ID') return 'ID';
  if (displayName === 'Desc') return 'Description';
  if (displayName === 'Qty') return 'Quantity';
  if (displayName.endsWith('Desc')) return displayName.replace('Desc', 'Description');
  
  // Add spaces between camelCase
  return displayName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Parse select options string like "1=Admin,2=Manager,3=User"
function parseOptions(optionsString) {
  return optionsString.split(',').map(opt => {
    const [value, label] = opt.split('=').map(p => p.trim());
    return { value, label };
  });
}

// Main function to scan directories and generate page maps
async function generateAllPageMaps() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    const allPageMaps = {};
    
    // Process each view directory
    for (const viewDir of viewDirs) {
      const files = await fs.readdir(viewDir);
      
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(viewDir, file);
          console.log(`Processing ${filePath}...`);
          
          const parsedView = await parseViewFile(filePath);
          
          if (parsedView) {
            const pageMap = generatePageMap(parsedView);
            allPageMaps[pageMap.id] = pageMap;
            
            // Write individual page map file
            const outputPath = path.join(outputDir, `${pageMap.id}.js`);
            await fs.writeFile(
              outputPath,
              `export default ${JSON.stringify(pageMap, null, 2)};`
            );
            console.log(`Generated ${outputPath}`);
          }
        }
      }
    }
    
    // Generate index file that exports all page maps
    const indexContent = Object.keys(allPageMaps)
      .map(id => `import ${id} from './${id}';`)
      .join('\n') + 
      '\n\nexport default {\n  ' + 
      Object.keys(allPageMaps).join(',\n  ') + 
      '\n};\n';
    
    await fs.writeFile(path.join(outputDir, 'index.js'), indexContent);
    console.log('Generated page maps index file');
    
  } catch (error) {
    console.error('Error generating page maps:', error);
  }
}

// Run the generator
generateAllPageMaps();