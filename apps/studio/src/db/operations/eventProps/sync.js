import { db } from '../../studioDb.js';
import { execDml } from '../../../utils/api';

/**
 * Sync all pending eventProps changes to MySQL
 * @returns {Promise<Array>} Array of sync results
 */
export const syncProps = async () => {
  const pending = await db.eventProps
    .filter(p => p._dmlMethod !== null)
    .toArray();

  console.log(`🔄 Syncing ${pending.length} eventProps changes to MySQL...`);

  const results = [];

  for (const prop of pending) {
    const result = await syncProp(prop);
    results.push(result);
  }

  const failed = results.filter(r => !r.success);
  const succeeded = results.filter(r => r.success);

  console.log(`✅ Synced ${succeeded.length} props, ${failed.length} failed`);

  return results;
};

/**
 * Sync a single prop record to MySQL
 * @param {Object} prop - Prop record from IndexedDB
 * @returns {Promise<Object>} Sync result
 */
const syncProp = async (prop) => {
  const { idbID, _dmlMethod, id, ...data } = prop;

  console.log('🔧 syncProp called:', { idbID, _dmlMethod, id });

  try {
    if (_dmlMethod === 'INSERT') {
      const response = await execDml({
        method: 'INSERT',
        table: 'api_wf.eventProps',
        data
      });

      await db.eventProps.update(idbID, {
        id: response.insertId,
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: response.insertId, operation: 'INSERT' };
    }

    if (_dmlMethod === 'UPDATE') {
      if (!id || id === null) {
        throw new Error(`Cannot UPDATE prop with null id. idbID: ${idbID}`);
      }

      await execDml({
        method: 'UPDATE',
        table: 'api_wf.eventProps',
        data: { id, ...data },
        primaryKey: 'id'
      });

      await db.eventProps.update(idbID, {
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: id, operation: 'UPDATE' };
    }

    if (_dmlMethod === 'DELETE') {
      await execDml({
        method: 'DELETE',
        table: 'api_wf.eventProps',
        data: { id },
        primaryKey: 'id'
      });

      await db.eventProps.delete(idbID);

      return { success: true, idbID, mysqlId: id, operation: 'DELETE', deleted: true };
    }
  } catch (error) {
    console.error(`❌ Failed to sync prop ${idbID}:`, error);
    return { success: false, idbID, error: error.message, operation: _dmlMethod };
  }
};
