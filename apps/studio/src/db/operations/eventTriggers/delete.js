import { db } from '../../studioDb.js';

/**
 * Delete trigger from IndexedDB
 * Marks for deletion with _dmlMethod: 'DELETE'
 *
 * @param {number} idbID - IndexedDB ID
 */
export const deleteTrigger = async (idbID) => {
  await db.eventTriggers.update(idbID, {
    _dmlMethod: 'DELETE'
  });

  console.log(`✅ Trigger ${idbID} marked for deletion`);
};

/**
 * Delete all triggers for a component
 *
 * @param {number} xref_id - Component MySQL ID
 */
export const deleteAllTriggersForComponent = async (xref_id) => {
  const triggers = await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .toArray();

  for (const trigger of triggers) {
    await deleteTrigger(trigger.idbID);
  }

  console.log(`✅ Marked ${triggers.length} triggers for deletion for component ${xref_id}`);
};

/**
 * Delete triggers by class and action
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} triggerClass - Trigger class
 * @param {string} action - Trigger action
 */
export const deleteTriggerByClassAction = async (xref_id, triggerClass, action) => {
  const trigger = await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .filter(t => t.class === triggerClass && t.action === action)
    .first();

  if (trigger) {
    await deleteTrigger(trigger.idbID);
    console.log(`✅ Trigger ${triggerClass}.${action} marked for deletion`);
  }
};
