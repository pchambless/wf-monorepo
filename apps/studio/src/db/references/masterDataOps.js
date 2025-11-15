import { db } from '../studioDb.js';
import { execDml } from '../../utils/api';
import {
  refreshEventTypeReferences,
  refreshTriggerReferences,
  refreshSQLReferences
} from '../operations/lifecycleOps.js';

/**
 * EventTypes Operations
 */

export const createEventType = async (eventTypeData) => {
  const idbID = await db.eventTypes.add({
    ...eventTypeData,
    id: null,
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateEventType = async (idbID, updates) => {
  await db.eventTypes.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteEventType = async (idbID) => {
  await db.eventTypes.update(idbID, {
    _dmlMethod: 'DELETE'
  });
};

export const syncEventType = async (idbID) => {
  const record = await db.eventTypes.get(idbID);
  const { _dmlMethod, id, ...data } = record;

  if (_dmlMethod === 'INSERT') {
    const response = await execDml('INSERT', {
      method: 'INSERT',
      table: 'api_wf.eventTypes',
      data
    });

    await db.eventTypes.update(idbID, {
      id: response.insertId,
      _dmlMethod: null
    });
  } else if (_dmlMethod === 'UPDATE') {
    await execDml('UPDATE', {
      method: 'UPDATE',
      table: 'api_wf.eventTypes',
      data: { id, ...data }
    });

    await db.eventTypes.update(idbID, { _dmlMethod: null });
  } else if (_dmlMethod === 'DELETE') {
    await execDml('DELETE', {
      method: 'DELETE',
      table: 'api_wf.eventTypes',
      data: { id }
    });

    await db.eventTypes.delete(idbID);
  }

  // Refresh dependent references
  await refreshEventTypeReferences();

  return { success: true };
};

/**
 * Triggers Operations
 */

export const createTriggerDef = async (triggerData) => {
  const idbID = await db.triggers.add({
    ...triggerData,
    id: null,
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateTriggerDef = async (idbID, updates) => {
  await db.triggers.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteTriggerDef = async (idbID) => {
  await db.triggers.update(idbID, {
    _dmlMethod: 'DELETE'
  });
};

export const syncTriggerDef = async (idbID) => {
  const record = await db.triggers.get(idbID);
  const { _dmlMethod, id, ...data } = record;

  if (_dmlMethod === 'INSERT') {
    const response = await execDml('INSERT', {
      method: 'INSERT',
      table: 'api_wf.triggers',
      data
    });

    await db.triggers.update(idbID, {
      id: response.insertId,
      _dmlMethod: null
    });
  } else if (_dmlMethod === 'UPDATE') {
    await execDml('UPDATE', {
      method: 'UPDATE',
      table: 'api_wf.triggers',
      data: { id, ...data }
    });

    await db.triggers.update(idbID, { _dmlMethod: null });
  } else if (_dmlMethod === 'DELETE') {
    await execDml('DELETE', {
      method: 'DELETE',
      table: 'api_wf.triggers',
      data: { id }
    });

    await db.triggers.delete(idbID);
  }

  // Refresh dependent references
  await refreshTriggerReferences();

  return { success: true };
};

/**
 * EventSQL Operations
 */

export const createEventSQL = async (eventSQLData) => {
  const idbID = await db.eventSQL.add({
    ...eventSQLData,
    id: null,
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateEventSQL = async (idbID, updates) => {
  await db.eventSQL.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteEventSQL = async (idbID) => {
  await db.eventSQL.update(idbID, {
    _dmlMethod: 'DELETE'
  });
};

export const syncEventSQL = async (idbID) => {
  const record = await db.eventSQL.get(idbID);
  const { _dmlMethod, id, ...data } = record;

  if (_dmlMethod === 'INSERT') {
    const response = await execDml('INSERT', {
      method: 'INSERT',
      table: 'api_wf.eventSQL',
      data
    });

    await db.eventSQL.update(idbID, {
      id: response.insertId,
      _dmlMethod: null
    });
  } else if (_dmlMethod === 'UPDATE') {
    await execDml('UPDATE', {
      method: 'UPDATE',
      table: 'api_wf.eventSQL',
      data: { id, ...data }
    });

    await db.eventSQL.update(idbID, { _dmlMethod: null });
  } else if (_dmlMethod === 'DELETE') {
    await execDml('DELETE', {
      method: 'DELETE',
      table: 'api_wf.eventSQL',
      data: { id }
    });

    await db.eventSQL.delete(idbID);
  }

  // Refresh dependent references
  await refreshSQLReferences();

  return { success: true };
};
