const fs = require('fs');
const path = require('path');
const { parseSqlView } = require('./sqlViewParser');  // You'd need to implement this

async function extractDirectivesToConfig() {
  // Update the sqlDir path to match your actual directory structure
  const sqlDir = path.resolve(__dirname, '../../sql/views/crud');
  const configDir = path.resolve(__dirname, '../../packages/shared-config/src/directives');
  
  // Create the directives directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Get all SQL view files
  const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql'));
  console.log(`Found ${files.length} SQL view files to process`);
  
  for (const file of files) {
    try {
      const viewName = path.basename(file, '.sql');
      console.log(`Processing ${viewName}...`);
      
      // Read the SQL file
      const sqlContent = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      
      // Parse the SQL view to extract column definitions and directives
      const { columns, entityName } = parseSqlView(sqlContent);
      
      // Create directive configuration
      const directiveConfig = {
        viewName: viewName,
        entityName: entityName || viewName,
        lastExtracted: new Date().toISOString(),
        columns: {}
      };
      
      // Process each column's directives
      columns.forEach(column => {
        const { name, directiveString } = column;
        
        // Parse directive string into directive objects
        const directives = parseDirectives(directiveString);
        
        // Store in config if directives exist
        if (Object.keys(directives).length > 0) {
          directiveConfig.columns[name] = {
            directives: directives
          };
        }
      });
      
      // Save to configuration file
      const outputPath = path.join(configDir, `${viewName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(directiveConfig, null, 2));
      console.log(`Saved directives to ${outputPath}`);
      
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  }
  
  console.log('Directive extraction complete. You can now remove directives from SQL views.');
}

// Parse a directive string like "PK; req; type:text; width:200"
function parseDirectives(str) {
  if (!str) return {};
  
  const result = {};
  const parts = str.split(';');
  
  parts.forEach(part => {
    part = part.trim();
    if (!part) return;
    
    // Handle directives with values (e.g., "width:200")
    if (part.includes(':')) {
      const [directive, value] = part.split(':', 2);
      result[directive.trim()] = value.trim();
    } 
    // Handle flag directives (e.g., "PK")
    else {
      result[part] = true;
    }
  });
  
  return result;
}

// Run the extraction
extractDirectivesToConfig().catch(console.error);