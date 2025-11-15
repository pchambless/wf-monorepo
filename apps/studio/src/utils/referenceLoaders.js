import { db } from '../db/studioDb';
import { execEvent } from './api';

const AUDIT_COLUMNS = ['created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by', 'active'];

const cleanRecord = (record) => {
  const cleaned = { ...record };
  AUDIT_COLUMNS.forEach(col => delete cleaned[col]);
  return cleaned;
};

// REMOVED: ref* table loaders - now query master tables directly for dropdowns
// Keeping function stubs for backward compatibility (no-ops)

export const loadEventTypes = async () => {
  try {
    const result = await execEvent('studio-eventTypeList', {});
    const eventTypes = (result.data || []).map(cleanRecord);

    await db.eventTypes.clear();

    try {
      await db.eventTypes.bulkAdd(eventTypes.map(et => ({ ...et, _dmlMethod: null })));
    } catch (bulkError) {
      // Ignore ConstraintError (duplicate keys) - happens in React StrictMode double-render
      if (bulkError.name !== 'BulkError' || !bulkError.message.includes('uniqueness')) {
        throw bulkError;
      }
    }

    console.log(`✅ Loaded ${eventTypes.length} eventTypes`);
    return { success: true, count: eventTypes.length };
  } catch (error) {
    console.error('❌ Failed to load eventTypes:', error);
    return { success: false, error: error.message };
  }
};

export const loadEventSQL = async () => {
  try {
    const result = await execEvent('studio-eventSqlList', {});
    const eventSQL = (result.data || []).map(cleanRecord);

    await db.eventSQL.clear();

    try {
      await db.eventSQL.bulkAdd(eventSQL.map(es => ({ ...es, _dmlMethod: null })));
    } catch (bulkError) {
      // Ignore ConstraintError (duplicate keys) - happens in React StrictMode double-render
      if (bulkError.name !== 'BulkError' || !bulkError.message.includes('uniqueness')) {
        throw bulkError;
      }
    }

    console.log(`✅ Loaded ${eventSQL.length} eventSQL queries`);
    return { success: true, count: eventSQL.length };
  } catch (error) {
    console.error('❌ Failed to load eventSQL:', error);
    return { success: false, error: error.message };
  }
};

export const loadTriggers = async () => {
  try {
    const result = await execEvent('studio-triggerList', {});
    const triggers = (result.data || []).map(cleanRecord);

    await db.triggers.clear();

    try {
      await db.triggers.bulkAdd(triggers.map(t => ({ ...t, _dmlMethod: null })));
    } catch (bulkError) {
      // Ignore ConstraintError (duplicate keys) - happens in React StrictMode double-render
      if (bulkError.name !== 'BulkError' || !bulkError.message.includes('uniqueness')) {
        throw bulkError;
      }
    }

    console.log(`✅ Loaded ${triggers.length} triggers`);
    return { success: true, count: triggers.length };
  } catch (error) {
    console.error('❌ Failed to load triggers:', error);
    return { success: false, error: error.message };
  }
};

// Load only master tables (eventTypes, eventSQL, triggers)
// Dropdowns query these directly instead of using separate ref* tables
export const loadAllReferences = async () => {
  console.log('📚 Loading master table data...');

  const results = await Promise.all([
    loadEventTypes(),
    loadEventSQL(),
    loadTriggers()
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ All master data loaded' : '⚠️ Some master data failed');

  return { success: allSuccess, results };
};
