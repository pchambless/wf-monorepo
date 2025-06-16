const fs = require('fs');
const path = require('path');
const { entityRegistry } = require('../../packages/shared-config/src/pageMapRegistry');

/**
 * Page Index Generator for WhatsFresh
 * 
 * This tool generates React component index.js files that import
 * their corresponding pageMap.js from the shared-config package.
 * 
 * Usage:
 * node genPageIndex.js entityName     # Generate for a single entity
 * node genPageIndex.js --all          # Generate for all entities
 * node genPageIndex.js --force        # Force overwrite of existing files
 */

// Process command line args
const entityArg = process.argv[2];
const force = process.argv.includes('--force');
const generateAll = entityArg === '--all';

if (!entityArg) {
  console.error('Please provide an entity name or --all flag');
  console.error(`Available entities: ${Object.keys(entityRegistry).filter(name => 
    entityRegistry[name].pageIndexPath || entityRegistry[name].pageMapPath).join(', ')}`);
  process.exit(1);
}

// Function to generate a single index.js file
function generateIndexFile(entityName) {
  const entity = entityRegistry[entityName];
  
  // Skip entities that don't have proper path information
  if (!entity) {
    console.log(`Skipping ${entityName} - entity not found in registry`);
    return false;
  }
  
  // Use pageIndexPath if available, fall back to pageMapPath
  const pagePath = entity.pageIndexPath || entity.pageMapPath;
  
  if (!pagePath || !pagePath.includes('/')) {
    console.log(`Skipping ${entityName} - missing valid page path`);
    return false;
  }

  // Get the directory path from either pageIndexPath or pageMapPath
  const pathParts = pagePath.split('/');
  const dirPath = pathParts.slice(0, -1).join('/');
  
  // Format nice display name for the component
  const componentName = `${entityName}Page`;

  // For logging, use the readable title from registry when available
  const loggerName = entity.title || entityName;
  
  // Get parent entity info if applicable
  const parentEntity = entity.parentEntity ? entityRegistry[entity.parentEntity] : null;
  
  // Create the target directory
  const targetDir = path.resolve(__dirname, '../../apps/wf-client/src/pages', dirPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
  
  // Create the index.js content
  const indexContent = `import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Same import path, but now contains the optimized structure
import pageMap from '@whatsfresh/shared-config/src/pageMap/${entityName}';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';

const log = createLogger('${loggerName}');

const ${componentName} = observer(() => {
  useEffect(() => {
    // Set breadcrumbs
    navigationStore.setBreadcrumbs([
      { label: pageMap.title, path: null }
    ]);
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      accountId={accountStore.currentAccountId}
    />
  );
});

export default ${componentName};
`;

  // Write the file
  const targetFile = path.join(targetDir, 'index.jsx');
  const fileExists = fs.existsSync(targetFile);
  
  if (!fileExists || force) {
    fs.writeFileSync(targetFile, indexContent);
    console.log(`${fileExists ? 'Updated' : 'Created'}: ${targetFile}`);
    return true;
  } else {
    console.log(`Skipped: ${targetFile} (use --force to overwrite)`);
    return false;
  }
}

// Generate for a single entity or all entities
if (generateAll) {
  console.log('Generating index.jsx files for all entities...');
  let count = 0;
  
  // Get valid entities based on updated registry structure
  const validEntities = Object.keys(entityRegistry).filter(name => {
    const entity = entityRegistry[name];
    
    // Check three conditions:
    // 1. Has a pageIndexPath (new format)
    // 2. Has a pageMapPath (old format) 
    // 3. Has a corresponding pageMap file in src/pageMap
    return (
      (entity.pageIndexPath && entity.layout === 'CrudLayout') || 
      (entity.pageMapPath?.includes('pageMap.js')) ||
      fs.existsSync(path.resolve(__dirname, 
        '../../packages/shared-config/src/pageMap', `${name}.js`))
    );
  });
  
  for (const entityName of validEntities) {
    if (generateIndexFile(entityName)) {
      count++;
    }
  }
  
  console.log(`Generation complete! Created/updated ${count} index.jsx files.`);
} else {
  console.log(`Generating index.jsx for entity: ${entityArg}`);
  if (!entityRegistry[entityArg]) {
    console.error(`Error: Entity "${entityArg}" not found in registry`);
    process.exit(1);
  }
  
  generateIndexFile(entityArg);
  console.log('Done!');
}