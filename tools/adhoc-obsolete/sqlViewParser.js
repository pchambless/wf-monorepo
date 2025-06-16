/**
 * SQL View Parser
 * Extracts column definitions and directives from SQL view files
 */
const { processDirectives } = require('./directiveMap');

/**
 * Parse a SQL view file to extract column definitions and directives
 * @param {string} sqlContent - The content of the SQL view file
 * @returns {Object} Object containing columns and entityName
 */
function parseSqlView(sqlContent) {
  // Result object to return
  const result = {
    columns: [],
    entityName: null
  };

  try {
    // Extract entity name from CREATE VIEW statement
    const viewMatch = sqlContent.match(/CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:\w+\.)?(\w+)/i);
    if (viewMatch && viewMatch[1]) {
      result.entityName = viewMatch[1].toLowerCase();
    }

    // Use the same column extraction regex pattern as genPageMaps.js
    // This pattern looks for: field AS alias, -- directives
    const columnMatches = Array.from(sqlContent.matchAll(/(\w+(?:\.\w+)?)\s+AS\s+(\w+),?\s*--\s*(.+?)(?=\r?\n|$)/g));
    
    if (columnMatches.length > 0) {
      console.log(`Found ${columnMatches.length} columns with directives`);
      
      // Process each column match
      columnMatches.forEach((match, index) => {
        const sourceColumn = match[1];
        const alias = match[2];
        const directiveText = match[3].trim();
        
        console.log(`Processing column #${index + 1}: ${alias} from ${sourceColumn}`);
        
        // Parse directives similar to genPageMaps.js
        const rawDirectives = {};
        const directiveParts = directiveText.split(';').map(part => part.trim()).filter(Boolean);
        
        for (const part of directiveParts) {
          if (part.includes(':')) {
            const [key, value] = part.split(':').map(p => p.trim());
            if (key && value) {
              rawDirectives[key] = value;
            }
          } else {
            rawDirectives[part] = true;
          }
        }
        
        // Add to columns array
        result.columns.push({
          name: alias,
          sourceField: sourceColumn,
          directiveString: directiveText,
          directives: rawDirectives
        });
      });
    } else {
      console.log('No column directives found using primary pattern');
      
      // Fallback to broader pattern search if needed
      const selectMatch = sqlContent.match(/SELECT\s+([\s\S]+?)(?:\s+FROM|\s+WHERE)/i);
      if (selectMatch) {
        // Additional fallback extraction logic if needed
        console.log('Using fallback extraction based on SELECT clause');
        // ... fallback logic
      }
    }
    
    console.log(`Total columns extracted: ${result.columns.length}`);
    
  } catch (err) {
    console.error('Error parsing SQL view:', err);
  }

  return result;
}

module.exports = {
  parseSqlView
};