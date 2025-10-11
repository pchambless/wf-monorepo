import { db } from '../studioDb.js';

export const getTriggersByXrefId = async (xref_id) => {
  return await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .toArray();
};

export const getTriggerByIdbID = async (idbID) => {
  return await db.eventTriggers.get(idbID);
};

export const createTrigger = async (triggerData) => {
  const idbID = await db.eventTriggers.add({
    ...triggerData,
    id: null, // MySQL id not assigned yet
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateTrigger = async (idbID, updates) => {
  await db.eventTriggers.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteTrigger = async (idbID) => {
  const trigger = await db.eventTriggers.get(idbID);

  if (!trigger.id) {
    // Never synced to MySQL, just delete locally
    await db.eventTriggers.delete(idbID);
  } else {
    // Mark for deletion in MySQL
    await db.eventTriggers.update(idbID, {
      _dmlMethod: 'DELETE'
    });
  }
};

export const reorderTriggers = async (xref_id, triggerIds) => {
  // triggerIds is array of idbIDs in desired order
  for (let i = 0; i < triggerIds.length; i++) {
    await db.eventTriggers.update(triggerIds[i], {
      ordr: i + 1,
      _dmlMethod: 'UPDATE'
    });
  }
};
