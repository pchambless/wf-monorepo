import { db } from '../../studioDb.js';

/**
 * Update trigger in IndexedDB
 * Marks for sync with _dmlMethod: 'UPDATE'
 *
 * @param {number} idbID - IndexedDB ID
 * @param {Object} updates - Fields to update
 */
export const updateTrigger = async (idbID, updates) => {
  await db.eventTriggers.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });

  console.log(`✅ Trigger ${idbID} marked for update`);
};

/**
 * Update trigger order
 *
 * @param {number} idbID - IndexedDB ID
 * @param {number} newOrder - New order value
 */
export const updateTriggerOrder = async (idbID, newOrder) => {
  await updateTrigger(idbID, { ordr: newOrder });
  console.log(`✅ Trigger ${idbID} order updated to ${newOrder}`);
};
