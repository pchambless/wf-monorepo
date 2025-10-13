import { db } from '../../studioDb.js';

/**
 * Get all triggers for a component
 *
 * @param {number} xref_id - Component MySQL ID
 * @returns {Promise<Array>}
 */
export const getTriggersByComponent = async (xref_id) => {
  return await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .sortBy('ordr');
};

/**
 * Get triggers by class
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} triggerClass - Trigger class (e.g., 'onLoad', 'onClick')
 * @returns {Promise<Array>}
 */
export const getTriggersByClass = async (xref_id, triggerClass) => {
  return await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .filter(t => t.class === triggerClass)
    .sortBy('ordr');
};

/**
 * Get specific trigger by class and action
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} triggerClass - Trigger class
 * @param {string} action - Trigger action
 * @returns {Promise<Object|undefined>}
 */
export const getTriggerByClassAction = async (xref_id, triggerClass, action) => {
  return await db.eventTriggers
    .where('xref_id')
    .equals(xref_id)
    .filter(t => t.class === triggerClass && t.action === action)
    .first();
};

/**
 * Get trigger by IndexedDB ID
 *
 * @param {number} idbID - IndexedDB ID
 * @returns {Promise<Object|undefined>}
 */
export const getTriggerById = async (idbID) => {
  return await db.eventTriggers.get(idbID);
};
