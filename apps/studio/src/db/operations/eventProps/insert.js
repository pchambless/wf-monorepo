import { db } from '../../studioDb.js';

/**
 * Insert property for a component
 * Marks for sync with _dmlMethod: 'INSERT'
 *
 * @param {Object} propData - {xref_id, paramName, paramVal}
 * @returns {Promise<number>} IndexedDB ID
 */
export const insertProp = async (propData) => {
  const { xref_id, paramName, paramVal } = propData;

  if (!xref_id || !paramName) {
    throw new Error('xref_id and paramName are required');
  }

  // Serialize paramVal if it's an object
  const serializedVal = typeof paramVal === 'object'
    ? JSON.stringify(paramVal)
    : String(paramVal);

  const idbID = await db.eventProps.add({
    id: null,
    xref_id,
    paramName,
    paramVal: serializedVal,
    _dmlMethod: 'INSERT'
  });

  console.log(`✅ Prop created: ${paramName} for component ${xref_id}`);

  return idbID;
};

/**
 * Bulk insert/update props for a component
 * Replaces all props for the component
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {Object} props - Key-value pairs of props
 */
export const bulkUpsertProps = async (xref_id, props) => {
  // Delete existing props for this component
  await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .delete();

  // Insert new props
  const entries = Object.entries(props);
  for (const [paramName, paramVal] of entries) {
    await insertProp({ xref_id, paramName, paramVal });
  }

  console.log(`✅ Bulk upserted ${entries.length} props for component ${xref_id}`);
};
