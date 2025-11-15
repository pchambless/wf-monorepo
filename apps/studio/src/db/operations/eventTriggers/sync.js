import { db } from '../../studioDb.js';
import { execDml } from '../../../utils/api';

/**
 * Sync all pending eventTrigger changes to MySQL
 * @returns {Promise<Array>} Array of sync results
 */
export const syncTriggers = async () => {
  const pending = await db.eventTriggers
    .filter(t => t._dmlMethod !== null)
    .toArray();

  console.log(`🔄 Syncing ${pending.length} eventTrigger changes to MySQL...`);

  const results = [];

  for (const trigger of pending) {
    const result = await syncTrigger(trigger);
    results.push(result);
  }

  const failed = results.filter(r => !r.success);
  const succeeded = results.filter(r => r.success);

  console.log(`✅ Synced ${succeeded.length} triggers, ${failed.length} failed`);

  return results;
};

/**
 * Sync a single trigger record to MySQL
 * @param {Object} trigger - Trigger record from IndexedDB
 * @returns {Promise<Object>} Sync result
 */
const syncTrigger = async (trigger) => {
  const { idbID, _dmlMethod, id, ...data } = trigger;

  console.log('🔧 syncTrigger called:', { idbID, _dmlMethod, id, trigger });

  try {
    if (_dmlMethod === 'INSERT') {
      const response = await execDml('INSERT', {
        method: 'INSERT',
        table: 'api_wf.eventTrigger',
        data
      });

      // Update IndexedDB with MySQL id and clear flag
      await db.eventTriggers.update(idbID, {
        id: response.insertId,
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: response.insertId, operation: 'INSERT' };
    }

    if (_dmlMethod === 'UPDATE') {
      if (!id || id === null) {
        throw new Error(`Cannot UPDATE trigger with null id. idbID: ${idbID}`);
      }

      await execDml('UPDATE', {
        method: 'UPDATE',
        table: 'api_wf.eventTrigger',
        data: { id, ...data },
        primaryKey: 'id'  // Field name as string
      });

      // Clear flag
      await db.eventTriggers.update(idbID, {
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: id, operation: 'UPDATE' };
    }

    if (_dmlMethod === 'DELETE') {
      await execDml('DELETE', {
        method: 'DELETE',
        table: 'api_wf.eventTrigger',
        data: { id },
        primaryKey: 'id'  // Field name as string
      });

      // Remove from IndexedDB
      await db.eventTriggers.delete(idbID);

      return { success: true, idbID, mysqlId: id, operation: 'DELETE', deleted: true };
    }
  } catch (error) {
    console.error(`❌ Failed to sync trigger ${idbID}:`, error);
    return { success: false, idbID, error: error.message, operation: _dmlMethod };
  }
};
