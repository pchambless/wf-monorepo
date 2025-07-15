/**
 * Extract enhanced metadata from pageMap and related files
 * Fills in missing information like table names and primary keys
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract comprehensive metadata for a page entity (async version)
 */
export async function extractEnhancedPageMetadata(entityName, pageMap) {
  const metadata = extractPageMetadata(entityName, pageMap);

  // Try to get primary key from directive file if still not found
  if (metadata.primaryKey === 'Not specified') {
    const directivePrimaryKey = await extractPrimaryKeyFromDirective(entityName);
    if (directivePrimaryKey) {
      metadata.primaryKey = directivePrimaryKey;
    }
  }

  // Try to get table name from SQL file if still not found
  if (metadata.tableName === 'Not specified') {
    const sqlTableName = await extractTableNameFromSQL(entityName);
    if (sqlTableName) {
      metadata.tableName = sqlTableName;
    }
  }

  return metadata;
}

/**
 * Extract comprehensive metadata for a page entity (sync version)
 */
export function extractPageMetadata(entityName, pageMap) {
  const metadata = {
    schema: pageMap.systemConfig?.schema || 'whatsfresh',
    tableName: 'Not specified',
    primaryKey: 'Not specified',
    entityName: entityName
  };

  // Extract table name from pageMap if available
  if (pageMap.systemConfig?.table) {
    metadata.tableName = pageMap.systemConfig.table;
  }

  // Extract primary key from pageMap if available
  if (pageMap.systemConfig?.primaryKey) {
    metadata.primaryKey = pageMap.systemConfig.primaryKey;
  } else {
    // Try to extract primary key from table config
    const primaryKeyField = findPrimaryKeyFromTableConfig(pageMap.tableConfig);
    if (primaryKeyField) {
      metadata.primaryKey = primaryKeyField;
    } else {
      // Try to extract from DML config (fields excluded from insert are usually primary keys)
      const dmlPrimaryKey = findPrimaryKeyFromDMLConfig(pageMap.dmlConfig);
      if (dmlPrimaryKey) {
        metadata.primaryKey = dmlPrimaryKey;
      }
    }
  }

  // If still missing table name, try to extract from SQL view or directive
  if (metadata.tableName === 'Not specified') {
    const extractedTableName = extractTableNameFromContext(entityName);
    if (extractedTableName) {
      metadata.tableName = extractedTableName;
    }
  }

  return metadata;
}

/**
 * Find primary key from table configuration
 * Look for fields that are hidden, non-editable, and have 'ID' in the name
 */
function findPrimaryKeyFromTableConfig(tableConfig) {
  if (!tableConfig?.columns) return null;

  // Look for fields marked as primary key characteristics
  const primaryKeyField = tableConfig.columns.find(column => {
    return (
      column.field.toLowerCase().includes('id') &&
      column.hidden === true &&
      column.editable === false &&
      column.type === 'number'
    );
  });

  return primaryKeyField?.field || null;
}

/**
 * Find primary key from DML configuration
 * Fields excluded from insert operations are typically primary keys
 */
function findPrimaryKeyFromDMLConfig(dmlConfig) {
  if (!dmlConfig?.operations?.insert?.excludeFields) return null;

  // The excluded field from insert is usually the primary key
  const excludedFields = dmlConfig.operations.insert.excludeFields;
  if (excludedFields.length > 0) {
    return excludedFields[0]; // Take the first excluded field as primary key
  }

  return null;
}

/**
 * Extract table name from SQL view comments or naming conventions
 */
function extractTableNameFromContext(entityName) {
  // Common table name patterns based on entity names
  const tableNameMappings = {
    'prodTypeList': 'product_types',
    'prodList': 'products',
    'ingrList': 'ingredients',
    'ingrTypeList': 'ingredient_types',
    'ingrBtchList': 'ingredient_batches',
    'prodBtchList': 'product_batches',
    'brndList': 'brands',
    'vndrList': 'vendors',
    'wrkrList': 'workers',
    'measList': 'measures',
    'taskList': 'tasks',
    'rcpeList': 'recipes',
    'acctList': 'accounts',
    'userList': 'users'
  };

  return tableNameMappings[entityName] || entityName.replace('List', '').toLowerCase();
}

/**
 * Async function to read directive file and extract primary key
 * This can be used for future enhancement if needed
 */
export async function extractPrimaryKeyFromDirective(entityName) {
  try {
    const directivePath = path.resolve(
      __dirname,
      '../../../automation/page/directives',
      `${entityName}.json`
    );

    const directiveContent = await fs.readFile(directivePath, 'utf8');
    const directive = JSON.parse(directiveContent);

    // Find field with PK: true directive
    for (const [fieldName, fieldData] of Object.entries(directive.columns || {})) {
      if (fieldData.directives?.PK === true) {
        return fieldName;
      }
    }
  } catch (error) {
    // File not found or parsing error - return null
    console.log(`Could not read directive for ${entityName}:`, error.message);
  }

  return null;
}

/**
 * Async function to read SQL view and extract table name
 * This can be used for future enhancement if needed
 */
export async function extractTableNameFromSQL(entityName) {
  try {
    const sqlPath = path.resolve(
      __dirname,
      '../../../../../../../sql/views/client',
      `${entityName}.sql`
    );

    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    // Look for @table comment
    const tableMatch = sqlContent.match(/@table\s+(\w+)/);
    if (tableMatch) {
      return tableMatch[1];
    }

    // Look for FROM clause
    const fromMatch = sqlContent.match(/FROM\s+\w+\.(\w+)/i);
    if (fromMatch) {
      return fromMatch[1];
    }
  } catch (error) {
    console.log(`Could not read SQL for ${entityName}:`, error.message);
  }

  return null;
}