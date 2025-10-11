import { db, getPendingSyncs } from '../db/studioDb';

const SERVER_URL = 'http://localhost:3001';

export const queueChange = async (table, action, data) => {
  try {
    await db.pendingXrefs.add({
      table,
      action,
      data: JSON.stringify(data),
      synced: 0,
      timestamp: Date.now()
    });
    console.log(`✅ Queued ${action} for ${table}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to queue change:', error);
    return { success: false, error: error.message };
  }
};

export const syncToMySQL = async () => {
  const pending = await getPendingSyncs();

  if (pending.length === 0) {
    console.log('✅ No pending changes to sync');
    return { success: true, synced: 0 };
  }

  console.log(`🔄 Syncing ${pending.length} pending changes...`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const record of pending) {
    try {
      const data = JSON.parse(record.data);

      let method;
      switch (record.action) {
        case 'CREATE':
          method = 'INSERT';
          break;
        case 'UPDATE':
          method = 'UPDATE';
          break;
        case 'DELETE':
          method = 'DELETE';
          break;
        default:
          throw new Error(`Unknown action: ${record.action}`);
      }

      const response = await fetch(`${SERVER_URL}/api/execDML`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          table: record.table,
          data,
          userID: 'studio'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await db.pendingXrefs.update(record.id, { synced: 1 });
      results.success++;
      console.log(`✅ Synced: ${record.action} ${record.table}`);

    } catch (error) {
      results.failed++;
      results.errors.push({
        record,
        error: error.message
      });
      console.error(`❌ Failed to sync record ${record.id}:`, error);
    }
  }

  console.log(`✅ Sync complete: ${results.success} success, ${results.failed} failed`);
  return results;
};

export const discardPendingChanges = async () => {
  const pending = await getPendingSyncs();

  for (const record of pending) {
    await db.pendingXrefs.delete(record.id);
  }

  console.log(`✅ Discarded ${pending.length} pending changes`);
  return { success: true, discarded: pending.length };
};

export const getPendingSummary = async () => {
  const pending = await getPendingSyncs();

  const summary = {
    total: pending.length,
    byTable: {},
    byAction: {}
  };

  pending.forEach(record => {
    summary.byTable[record.table] = (summary.byTable[record.table] || 0) + 1;
    summary.byAction[record.action] = (summary.byAction[record.action] || 0) + 1;
  });

  return summary;
};

export const updateComponentXref = async (eventID, compID, updates) => {
  await queueChange('api_wf.eventComp_xref', 'UPDATE', {
    eventID,
    compID,
    ...updates
  });
};

export const createComponentXref = async (eventID, compID, data) => {
  await queueChange('api_wf.eventComp_xref', 'CREATE', {
    eventID,
    compID,
    ...data
  });
};

export const deleteComponentXref = async (eventID, compID) => {
  await queueChange('api_wf.eventComp_xref', 'DELETE', {
    eventID,
    compID
  });
};
