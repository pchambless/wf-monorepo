import { db } from '../../studioDb.js';

/**
 * Update component in IndexedDB
 * Marks for sync with _dmlMethod: 'UPDATE'
 * Actual MySQL sync happens via syncOps.js
 *
 * @param {number} idbID - IndexedDB ID
 * @param {Object} updates - Fields to update
 */
export const updateComponent = async (idbID, updates) => {
  await db.eventComp_xref.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });

  console.log(`✅ Component ${idbID} marked for update`);
};

/**
 * Update component parent - checks for circular references
 *
 * @param {number} idbID - IndexedDB ID
 * @param {number|null} newParentId - New parent's MySQL ID
 */
export const updateComponentParent = async (idbID, newParentId) => {
  const component = await db.eventComp_xref.get(idbID);

  if (!component) {
    throw new Error(`Component ${idbID} not found`);
  }

  // Check for circular reference: component can't be its own ancestor
  if (newParentId === component.id) {
    throw new Error('Component cannot be its own parent');
  }

  // TODO: Add deeper circular reference check (traverse parent chain)
  // For now, just basic check

  await updateComponent(idbID, { parent_id: newParentId });

  console.log(`✅ Component ${idbID} parent changed to ${newParentId}`);
};
