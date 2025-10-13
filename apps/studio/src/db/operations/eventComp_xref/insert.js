import { db } from '../../studioDb.js';
import { execDml } from '@whatsfresh/shared-imports';

/**
 * Insert new component to MySQL and IndexedDB
 * Returns both IndexedDB ID and MySQL ID immediately
 *
 * @param {Object} componentData - Component fields (comp_name, comp_type, title, etc.)
 * @returns {Promise<{idbID: number, id: number}>}
 */
export const insertComponent = async (componentData) => {
  // Validate required fields
  if (!componentData.comp_type) {
    throw new Error('comp_type is required');
  }

  // Insert to MySQL first to get real ID
  const response = await execDml('INSERT', {
    method: 'INSERT',
    table: 'api_wf.eventComp_xref',
    data: componentData
  });

  // Add to IndexedDB with MySQL ID
  const idbID = await db.eventComp_xref.add({
    ...componentData,
    id: response.insertId,
    _dmlMethod: null  // Already synced
  });

  console.log(`✅ Component created: MySQL ID ${response.insertId}, IDB ID ${idbID}`);

  return { idbID, id: response.insertId };
};
