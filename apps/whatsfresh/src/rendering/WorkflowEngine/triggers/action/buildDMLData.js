/**
 * Build DML Data - Orchestrator
 * Assembles complete DML data based on method (INSERT/UPDATE/DELETE)
 * Adds system fields (parentID for INSERT, tableID for UPDATE/DELETE)
 */
import { buildInsertData } from './dmlBuilders/buildInsertData.js';
import { buildUpdateData } from './dmlBuilders/buildUpdateData.js';
import { buildDeleteData } from './dmlBuilders/buildDeleteData.js';

export async function buildDMLData(params, context) {
  const { getVal } = await import('../../../../utils/api.js');
  const { db } = await import('../../../../db/studioDb.js');

  // Get method from context_store
  const methodResult = await getVal('method', 'raw');
  const method = methodResult?.resolvedValue || methodResult;

  if (!method) {
    throw new Error('buildDMLData: method not found in context_store');
  }

  // Get pageID and load page_registry
  const pageIDResult = await getVal('pageID', 'raw');
  const pageID = pageIDResult?.resolvedValue || pageIDResult;

  if (!pageID) {
    throw new Error('buildDMLData: pageID not found in context_store');
  }

  const pageRegistry = await db.page_registry.where('id').equals(parseInt(pageID)).first();
  if (!pageRegistry) {
    throw new Error(`buildDMLData: page_registry not found for pageID ${pageID}`);
  }

  console.log(`🔨 Building ${method} data for ${pageRegistry.tableName}`);

  let dmlData;

  // Get form data from context (if available)
  const dmlDataResult = await getVal('dmlData', 'raw');
  const formDataString = dmlDataResult?.resolvedValue || dmlDataResult;
  const formData = formDataString ? JSON.parse(formDataString) : {};

  // Build data based on method
  switch (method) {
    case 'INSERT':
      dmlData = await buildInsertData(formData, pageRegistry, getVal);
      break;

    case 'UPDATE':
      dmlData = await buildUpdateData(formData, pageRegistry, getVal);
      break;

    case 'DELETE':
      dmlData = await buildDeleteData(pageRegistry, getVal);
      break;

    default:
      throw new Error(`buildDMLData: Invalid method "${method}"`);
  }

  console.log(`✅ Built ${method} data:`, dmlData);

  return dmlData;
}
