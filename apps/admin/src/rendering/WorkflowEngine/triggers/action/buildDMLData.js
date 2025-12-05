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

  // Get method from context_store
  const methodResult = await getVal('method', 'raw');
  const method = methodResult?.resolvedValue || methodResult;

  if (!method) {
    throw new Error('buildDMLData: method not found in context_store');
  }

  // Get page_registry metadata from pageConfig.props
  const pageRegistry = context.pageConfig?.props;

  if (!pageRegistry) {
    throw new Error('buildDMLData: pageConfig.props not found in context');
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
