import { db } from '../../studioDb.js';

/**
 * Insert trigger for a component
 * Marks for sync with _dmlMethod: 'INSERT'
 *
 * @param {Object} triggerData - {xref_id, class, action, ordr, content}
 * @returns {Promise<number>} IndexedDB ID
 */
export const insertTrigger = async (triggerData) => {
  const { xref_id, class: triggerClass, action } = triggerData;

  if (!xref_id || !triggerClass || !action) {
    throw new Error('xref_id, class, and action are required');
  }

  const idbID = await db.eventTriggers.add({
    ...triggerData,
    id: null,
    _dmlMethod: 'INSERT'
  });

  console.log(`✅ Trigger created: ${triggerClass}.${action} for component ${xref_id}`);

  return idbID;
};

/**
 * Bulk insert triggers for a component
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {Array} triggers - Array of trigger objects
 */
export const bulkInsertTriggers = async (xref_id, triggers) => {
  for (const trigger of triggers) {
    await insertTrigger({ ...trigger, xref_id });
  }

  console.log(`✅ Bulk inserted ${triggers.length} triggers for component ${xref_id}`);
};
