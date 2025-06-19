const fs = require('fs').promises;
const path = require('path');
const { directiveMap } = require('./directiveMap');
const { execSync } = require('child_process');
const generateWidgetDocs = require('./genWidgetDocs.mjs');

async function generateDirectiveReference() {
  // Create docs directory if it doesn't exist
  const docsDir = path.resolve(__dirname, '../../docs');
  await fs.mkdir(docsDir, { recursive: true });
  
  const outputPath = path.resolve(docsDir, 'sql-directives-reference.md');
  
  let content = `# WhatsFresh SQL Directive Reference\n\n`;
  content += `_Generated on ${new Date().toLocaleDateString()}_\n\n`;
  content += `This document describes all available directives you can use in SQL view comments.\n\n`;
  
  // Group directives by category
  const categories = {
    'Field Identity': ['PK', 'sys', 'parentKey'],
    'Display Types': ['type'],
    'Validation': ['req', 'unique', 'min', 'max'],
    'Layout': ['label', 'grp', 'width', 'tableHide', 'formHide'],
    'Select Fields': ['entity', 'valField', 'dispField', 'options']
  };
  
  // Generate documentation for each category
  for (const [category, directives] of Object.entries(categories)) {
    content += `## ${category}\n\n`;
    
    for (const directive of directives) {
      const mapping = directiveMap[directive];
      if (mapping) {
        content += `### \`${directive}\`\n\n`;
        content += `${mapping.description || 'No description available'}\n\n`;
        
        if (directive === 'type') {
          content += "**Values:** `text`, `multiLine`, `number`, `select`, `date`, `boolean`, `hidden`\n\n";
        }
        
        content += "**Example:**\n";
        if (directive === 'PK') {
          content += "```sql\nid AS userId -- PK; sys; type:number\n```\n\n";
        } else if (directive === 'type') {
          content += "```sql\nname AS userName -- type:text; label:Full Name\n```\n\n";
        } else if (directive === 'entity') {
          content += "```sql\ntype_id AS typeId -- type:select; entity:typeList; valField:typeID; dispField:typeName\n```\n\n";
        } else {
          // Check if this is a flag directive (no value needed) or a value directive
          const isFlag = ['PK', 'sys', 'req', 'tableHide', 'formHide', 'searchable', 'parentKey'].includes(directive);
          content += "```sql\nfield AS alias -- " + directive + (isFlag ? "" : ":value") + "\n```\n\n";
        }
      } else {
        content += `### \`${directive}\`\n\n`;
        content += `*Documentation pending*\n\n`;
        content += "```sql\nfield AS alias -- " + directive + "\n```\n\n";
      }
    }
  }
  
  await fs.writeFile(outputPath, content, 'utf8');
  console.log(`Documentation generated at ${outputPath}`);
}

/**
 * Main documentation generator
 */
async function generateAllDocs() {
  console.log('Generating WhatsFresh documentation...');
  
  try {
    // Generate basic documentation
    console.log('Generating page documentation...');
    // Your existing documentation generation code
    
    // Generate CRUD examples (renamed from genVisualDocs)
    console.log('Generating CRUD examples...');
    execSync('node tools/docs/genCrudExamples.js', { stdio: 'inherit' });
    
    // Generate widget documentation
    console.log('Generating widget documentation...');
    await generateWidgetDocs();
    
    // Generate data flow documentation
    console.log('Generating data flow documentation...');
    execSync('node tools/docs/genDataFlowDocs.js', { stdio: 'inherit' });
    
    console.log('All documentation generated successfully!');
  } catch (error) {
    console.error('Documentation generation failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  generateAllDocs().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = generateAllDocs;

generateDirectiveReference();