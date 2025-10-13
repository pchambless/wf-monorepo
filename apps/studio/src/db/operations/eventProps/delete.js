import { db } from '../../studioDb.js';

/**
 * Delete property from IndexedDB
 * Marks for deletion with _dmlMethod: 'DELETE'
 *
 * @param {number} idbID - IndexedDB ID
 */
export const deleteProp = async (idbID) => {
  await db.eventProps.update(idbID, {
    _dmlMethod: 'DELETE'
  });

  console.log(`✅ Prop ${idbID} marked for deletion`);
};

/**
 * Delete all props for a component
 *
 * @param {number} xref_id - Component MySQL ID
 */
export const deleteAllPropsForComponent = async (xref_id) => {
  const props = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .toArray();

  for (const prop of props) {
    await deleteProp(prop.idbID);
  }

  console.log(`✅ Marked ${props.length} props for deletion for component ${xref_id}`);
};

/**
 * Delete a specific property by name
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} paramName - Property name
 */
export const deletePropByName = async (xref_id, paramName) => {
  const prop = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .filter(p => p.paramName === paramName)
    .first();

  if (prop) {
    await deleteProp(prop.idbID);
    console.log(`✅ Prop ${paramName} marked for deletion`);
  }
};
