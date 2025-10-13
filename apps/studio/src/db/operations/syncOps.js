import { db } from '../studioDb.js';
import { execDml } from '@whatsfresh/shared-imports';

export const getPendingChanges = async () => {
  const components = await db.eventComp_xref.filter(c => c._dmlMethod !== null).toArray();
  const triggers = await db.eventTriggers.filter(t => t._dmlMethod !== null).toArray();
  const props = await db.eventProps.filter(p => p._dmlMethod !== null).toArray();
  const eventTypes = await db.eventTypes.filter(et => et._dmlMethod !== null).toArray();
  const eventSQL = await db.eventSQL.filter(es => es._dmlMethod !== null).toArray();
  const triggerDefs = await db.triggers.filter(t => t._dmlMethod !== null).toArray();

  return {
    components,
    triggers,
    props,
    eventTypes,
    eventSQL,
    triggers: triggerDefs,
    total: components.length + triggers.length + props.length + eventTypes.length + eventSQL.length + triggerDefs.length
  };
};

export const syncToMySQL = async () => {
  const pending = await getPendingChanges();
  const results = [];

  // Sync each table type
  for (const component of pending.components) {
    const result = await syncRecord('api_wf.eventComp_xref', component);
    results.push(result);
  }

  for (const prop of pending.props) {
    const result = await syncRecord('api_wf.eventProps', prop);
    results.push(result);
  }

  for (const trigger of pending.triggers) {
    const result = await syncRecord('api_wf.eventTriggers', trigger);
    results.push(result);
  }

  return results;
};

const syncRecord = async (tableName, record) => {
  const { idbID, _dmlMethod, id, ...data } = record;

  try {
    if (_dmlMethod === 'INSERT') {
      const response = await execDml({
        method: 'INSERT',
        table: tableName,
        data
      });

      // Update IndexedDB with MySQL-assigned id
      await db[tableName].update(idbID, {
        id: response.insertId,
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: response.insertId };
    }

    if (_dmlMethod === 'UPDATE') {
      await execDml({
        method: 'UPDATE',
        table: tableName,
        data: { id, ...data }
      });

      await db[tableName].update(idbID, {
        _dmlMethod: null
      });

      return { success: true, idbID, mysqlId: id };
    }

    if (_dmlMethod === 'DELETE') {
      await execDml({
        method: 'DELETE',
        table: tableName,
        data: { id }
      });

      await db[tableName].delete(idbID);

      return { success: true, idbID, mysqlId: id, deleted: true };
    }
  } catch (error) {
    return { success: false, idbID, error: error.message };
  }
};

export const clearAllDMLFlags = async () => {
  await db.eventComp_xref.filter(c => c._dmlMethod !== null).modify({ _dmlMethod: null });
  await db.eventTriggers.filter(t => t._dmlMethod !== null).modify({ _dmlMethod: null });
  await db.eventProps.filter(p => p._dmlMethod !== null).modify({ _dmlMethod: null });
  await db.eventTypes.filter(et => et._dmlMethod !== null).modify({ _dmlMethod: null });
  await db.eventSQL.filter(es => es._dmlMethod !== null).modify({ _dmlMethod: null });
  await db.triggers.filter(t => t._dmlMethod !== null).modify({ _dmlMethod: null });
};
