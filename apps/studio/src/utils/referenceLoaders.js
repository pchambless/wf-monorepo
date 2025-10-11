import { db } from '../db/studioDb';
import { execEvent } from '@whatsfresh/shared-imports';

const AUDIT_COLUMNS = ['created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by', 'active'];

const cleanRecord = (record) => {
  const cleaned = { ...record };
  AUDIT_COLUMNS.forEach(col => delete cleaned[col]);
  return cleaned;
};

export const loadContainerReference = async () => {
  try {
    const result = await execEvent('refContainers', {});
    const containers = (result.data || []).map(cleanRecord);

    await db.refContainers.clear();
    await db.refContainers.bulkAdd(containers);

    console.log(`✅ Loaded ${containers.length} container references`);
    return { success: true, count: containers.length };
  } catch (error) {
    console.error('❌ Failed to load container reference:', error);
    return { success: false, error: error.message };
  }
};

export const loadComponentReference = async () => {
  try {
    const result = await execEvent('refComponents', {});
    const components = (result.data || []).map(cleanRecord);

    await db.refComponents.clear();
    await db.refComponents.bulkAdd(components);

    console.log(`✅ Loaded ${components.length} component references`);
    return { success: true, count: components.length };
  } catch (error) {
    console.error('❌ Failed to load component reference:', error);
    return { success: false, error: error.message };
  }
};

export const loadTriggerActionReference = async () => {
  try {
    const result = await execEvent('refTriggerActions', {});
    const actions = (result.data || []).map(cleanRecord);

    await db.refTriggerActions.clear();
    await db.refTriggerActions.bulkAdd(actions);

    console.log(`✅ Loaded ${actions.length} trigger action references`);
    return { success: true, count: actions.length };
  } catch (error) {
    console.error('❌ Failed to load trigger action reference:', error);
    return { success: false, error: error.message };
  }
};

export const loadTriggerClassReference = async () => {
  try {
    const result = await execEvent('refTriggerClasses', {});
    const classes = (result.data || []).map(cleanRecord);

    await db.refTriggerClasses.clear();
    await db.refTriggerClasses.bulkAdd(classes);

    console.log(`✅ Loaded ${classes.length} trigger class references`);
    return { success: true, count: classes.length };
  } catch (error) {
    console.error('❌ Failed to load trigger class reference:', error);
    return { success: false, error: error.message };
  }
};

export const loadEventTypes = async () => {
  try {
    const result = await execEvent('eventTypeList', {});
    const eventTypes = (result.data || []).map(cleanRecord);

    await db.eventTypes.clear();
    await db.eventTypes.bulkAdd(eventTypes.map(et => ({ ...et, _dmlMethod: null })));

    console.log(`✅ Loaded ${eventTypes.length} eventTypes`);
    return { success: true, count: eventTypes.length };
  } catch (error) {
    console.error('❌ Failed to load eventTypes:', error);
    return { success: false, error: error.message };
  }
};

export const loadEventSQL = async () => {
  try {
    const result = await execEvent('qrySqlList', {});
    const eventSQL = (result.data || []).map(cleanRecord);

    await db.eventSQL.clear();
    await db.eventSQL.bulkAdd(eventSQL.map(es => ({ ...es, _dmlMethod: null })));

    console.log(`✅ Loaded ${eventSQL.length} eventSQL queries`);
    return { success: true, count: eventSQL.length };
  } catch (error) {
    console.error('❌ Failed to load eventSQL:', error);
    return { success: false, error: error.message };
  }
};

export const loadTriggers = async () => {
  try {
    const result = await execEvent('triggerList', {});
    const triggers = (result.data || []).map(cleanRecord);

    await db.triggers.clear();
    await db.triggers.bulkAdd(triggers.map(t => ({ ...t, _dmlMethod: null })));

    console.log(`✅ Loaded ${triggers.length} triggers`);
    return { success: true, count: triggers.length };
  } catch (error) {
    console.error('❌ Failed to load triggers:', error);
    return { success: false, error: error.message };
  }
};

export const loadSQLReference = async () => {
  try {
    const result = await execEvent('qrySqlList', {});
    const sqlRefs = (result.data || []).map(({ qryName, description }) => ({ qryName, description }));

    await db.refSQL.clear();
    await db.refSQL.bulkAdd(sqlRefs);

    console.log(`✅ Loaded ${sqlRefs.length} SQL query references`);
    return { success: true, count: sqlRefs.length };
  } catch (error) {
    console.error('❌ Failed to load SQL reference:', error);
    return { success: false, error: error.message };
  }
};

export const loadAllReferences = async () => {
  console.log('📚 Loading reference and working table data...');

  const results = await Promise.all([
    loadContainerReference(),
    loadComponentReference(),
    loadTriggerActionReference(),
    loadTriggerClassReference(),
    loadSQLReference(),
    loadEventTypes(),
    loadEventSQL(),
    loadTriggers()
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ All reference data loaded' : '⚠️ Some reference data failed');

  return { success: allSuccess, results };
};
