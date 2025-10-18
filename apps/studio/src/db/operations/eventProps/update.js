import { db } from '../../studioDb.js';

/**
 * Update property in IndexedDB
 * Marks for sync with _dmlMethod: 'UPDATE'
 *
 * @param {number} idbID - IndexedDB ID
 * @param {Object} updates - Fields to update
 */
export const updateProp = async (idbID, updates) => {
  // Serialize paramVal if provided and is object
  if (updates.paramVal && typeof updates.paramVal === 'object') {
    updates.paramVal = JSON.stringify(updates.paramVal);
  }

  await db.eventProps.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });

  console.log(`✅ Prop ${idbID} marked for update`);
};

/**
 * Update or insert a specific property by name
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} paramName - Property name
 * @param {any} paramVal - Property value
 */
export const upsertPropByName = async (xref_id, paramName, paramVal) => {
  const existing = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .filter(p => p.paramName === paramName)
    .first();

  const serializedVal = typeof paramVal === 'object'
    ? JSON.stringify(paramVal)
    : String(paramVal);

  if (existing && existing.id !== null) {
    // Record exists in MySQL - UPDATE it
    await updateProp(existing.idbID, { paramVal: serializedVal });
  } else if (existing && existing.id === null) {
    // Record exists in IndexedDB but not MySQL - just update the value, keep INSERT flag
    await db.eventProps.update(existing.idbID, {
      paramVal: serializedVal
      // Don't change _dmlMethod - it's already 'INSERT'
    });
  } else {
    // No existing record - INSERT new
    await db.eventProps.add({
      id: null,
      xref_id,
      paramName,
      paramVal: serializedVal,
      _dmlMethod: 'INSERT'
    });
  }

  console.log(`✅ Upserted prop ${paramName} for component ${xref_id}`);
};
