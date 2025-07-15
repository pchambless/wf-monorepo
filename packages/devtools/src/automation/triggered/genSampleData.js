// Import modules in ES module syntax
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from db-connect package
import { query } from '@whatsfresh/db-connect';

/**
 * Sample Data Generator for WhatsFresh
 * Extracts data in dependency order with proper parent-child relationships
 */

// Entities in dependency order
const entityOrder = [
  'acctList',       // Base entity
  'measList',       // Depends on acctList
  'ingrTypeList',   // Depends on acctList
  'prodTypeList',   // Depends on acctList
  'vndrList',       // Depends on acctList
  'brndList',       // Depends on acctList
  'wrkrList',       // Depends on acctList
  'ingrList',       // Depends on ingrTypeList
  'prodList',       // Depends on prodTypeList
  'taskList',       // Depends on prodTypeID - ADDED
  'ingrBtchList',   // Depends on ingrList
  'prodBtchList',   // Depends on prodList
  'rcpeList'        // Depends on prodID - ADDED
];

// Parent-child relationships
const entityParents = {
  'measList':     { parentField: 'acctID', parentEntity: 'acctList' },
  'ingrTypeList': { parentField: 'acctID', parentEntity: 'acctList' },
  'prodTypeList': { parentField: 'acctID', parentEntity: 'acctList' },
  'vndrList':     { parentField: 'acctID', parentEntity: 'acctList' },
  'brndList':     { parentField: 'acctID', parentEntity: 'acctList' },
  'wrkrList':     { parentField: 'acctID', parentEntity: 'acctList' },
  'ingrList':     { parentField: 'ingrTypeID', parentEntity: 'ingrTypeList' },
  'prodList':     { parentField: 'prodTypeID', parentEntity: 'prodTypeList' },
  'taskList':     { parentField: 'prodTypeID', parentEntity: 'prodTypeList' }, // ADDED
  'ingrBtchList': { parentField: 'ingrID', parentEntity: 'ingrList' },
  'prodBtchList': { parentField: 'prodID', parentEntity: 'prodList' },
  'rcpeList':     { parentField: 'prodID', parentEntity: 'prodList' }         // ADDED
};

// Store extracted data for each entity
const extractedData = {};

// Known good parent IDs for sample data extraction
const knownGoodIds = {
  'ingrTypeID': 3,   // Known good ingredient type ID
  'prodTypeID': 3,   // Known good product type ID (Pickle)
  'prodID': 3,      // Known good product ID - ADDED (you may need to adjust this value)
  'ingrID': 4,       // Known good ingredient ID
  'acctID': 1        // Known good account ID
};

// Extract data for an entity
async function extractEntityData(entityName, limit = 10) {
  console.log(`Extracting data for ${entityName}...`);
  
  const schemaPrefix = 'api_wf.';
  let sql = '';
  const parentInfo = entityParents[entityName];
  
  if (!parentInfo) {
    // Base entity with no parent
    sql = `SELECT * FROM ${schemaPrefix}${entityName} LIMIT ${limit}`;
  } else {
    // Get parent field name
    const parentField = parentInfo.parentField;
    
    // Use hardcoded ID if available for this field
    if (knownGoodIds[parentField]) {
      const hardcodedId = knownGoodIds[parentField];
      console.log(`Using hardcoded ${parentField}=${hardcodedId} for ${entityName}`);
      sql = `SELECT * FROM ${schemaPrefix}${entityName} WHERE ${parentField} = ${hardcodedId} LIMIT ${limit}`;
    } else {
      // Fall back to parent data logic
      const parentData = extractedData[parentInfo.parentEntity];
      
      if (!parentData || parentData.length === 0) {
        console.warn(`No parent data for ${entityName}`);
        sql = `SELECT * FROM ${schemaPrefix}${entityName} LIMIT ${limit}`;
      } else {
        const parentId = parentData[0][parentField];
        console.log(`Using ${parentInfo.parentEntity} ${parentField}=${parentId} for ${entityName}`);
        sql = `SELECT * FROM ${schemaPrefix}${entityName} WHERE ${parentField} = ${parentId} LIMIT ${limit}`;
      }
    }
  }
  
  // Execute query and handle results
  try {
    console.log(`Executing: ${sql}`);
    const rows = await query(sql);
    console.log(`Extracted ${rows.length} records for ${entityName}`);
    
    // Debug output to inspect data structure
    if (rows.length > 0) {
      console.log(`Sample record fields: ${Object.keys(rows[0]).join(', ')}`);
    }
    
    return rows;
  } catch (error) {
    console.error(`Error extracting data for ${entityName}:`, error.message);
    return [];
  }
}

// Main function to extract all sample data
async function extractAllSampleData() {
  try {
    // Create samples directory
    const samplesDir = path.resolve(__dirname, '../data/samples');
    fs.mkdirSync(samplesDir, { recursive: true });
    console.log(`Created/verified samples directory: ${samplesDir}`);
    
    // Process each entity in dependency order
    for (const entityName of entityOrder) {
      const data = await extractEntityData(entityName);
      
      if (data.length > 0) {
        // Store data for relationship linking
        extractedData[entityName] = data;
        
        const filePath = path.join(samplesDir, `${entityName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved sample data: ${filePath} (${data.length} records)`);
      } else {
        console.warn(`No data extracted for ${entityName}`);
      }
    }
    
    console.log('\nSample data extraction complete!');
  } catch (error) {
    console.error('Fatal error during sample data extraction:', error);
  }
}

// Add this function to map entity names to database tables
function getTableNameForEntity(entityName) {
  const tableMap = {
    'acctList': 'accounts',
    'measList': 'measures',
    'ingrTypeList': 'ingredient_types',
    'prodTypeList': 'product_types',
    'vndrList': 'vendors',
    'brndList': 'brands',
    'ingrList': 'ingredients',
    'prodList': 'products',
    'ingrBtchList': 'ingredient_batches',
    'prodBtchList': 'product_batches'
  };
  
  return tableMap[entityName] || entityName;
}

// Run the extractor if called directly
// Note: import.meta.main is not available in all Node.js versions
// Use process.argv check instead
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  extractAllSampleData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

// Export for use in other modules
export { extractAllSampleData };