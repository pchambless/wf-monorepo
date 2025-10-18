import { db } from '../../studioDb.js';
import { execDml } from '@whatsfresh/shared-imports';

/**
 * Sync all pending eventComp_xref changes to MySQL
 * @returns {Promise<Array>} Array of sync results
 */
export const syncComponents = async () => {
  const pending = await db.eventComp_xref
    .filter(c => c._dmlMethod !== null)
    .toArray();

  console.log(`🔄 Syncing ${pending.length} eventComp_xref changes to MySQL...`);

  const results = [];

  for (const component of pending) {
    const result = await syncComponent(component);
    results.push(result);
  }

  const failed = results.filter(r => !r.success);
  const succeeded = results.filter(r => r.success);

  console.log(`✅ Synced ${succeeded.length} components, ${failed.length} failed`);

  return results;
};

/**
 * Sync a single component record to MySQL
 * @param {Object} component - Component record from IndexedDB
 * @returns {Promise<Object>} Sync result
 */
const syncComponent = async (component) => {
  const { idbID, _dmlMethod, id, ...data } = component;

  console.log('🔧 syncComponent called:', { idbID, _dmlMethod, id });

  try {
    if (_dmlMethod === 'INSERT') {
      const response = await execDml('INSERT', {
        method: 'INSERT',
        table: 'api_wf.eventComp_xref',
        data
      });

      await db.eventComp_xref.update(idbID, {
        id: response.insertId,
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: response.insertId, operation: 'INSERT' };
    }

    if (_dmlMethod === 'UPDATE') {
      if (!id || id === null) {
        throw new Error(`Cannot UPDATE component with null id. idbID: ${idbID}`);
      }

      await execDml('UPDATE', {
        method: 'UPDATE',
        table: 'api_wf.eventComp_xref',
        data: { id, ...data },
        primaryKey: 'id'
      });

      await db.eventComp_xref.update(idbID, {
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: id, operation: 'UPDATE' };
    }

    if (_dmlMethod === 'DELETE') {
      await execDml('DELETE', {
        method: 'DELETE',
        table: 'api_wf.eventComp_xref',
        data: { id },
        primaryKey: 'id'
      });

      await db.eventComp_xref.delete(idbID);

      return { success: true, idbID, mysqlId: id, operation: 'DELETE', deleted: true };
    }
  } catch (error) {
    console.error(`❌ Failed to sync component ${idbID}:`, error);
    return { success: false, idbID, error: error.message, operation: _dmlMethod };
  }
};
