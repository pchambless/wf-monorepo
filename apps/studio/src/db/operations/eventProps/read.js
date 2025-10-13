import { db } from '../../studioDb.js';

/**
 * Get all props for a component
 *
 * @param {number} xref_id - Component MySQL ID
 * @returns {Promise<Array>}
 */
export const getPropsByComponent = async (xref_id) => {
  return await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .toArray();
};

/**
 * Get props as object {paramName: paramVal}
 *
 * @param {number} xref_id - Component MySQL ID
 * @returns {Promise<Object>}
 */
export const getPropsAsObject = async (xref_id) => {
  const props = await getPropsByComponent(xref_id);

  const obj = {};
  props.forEach(p => {
    try {
      obj[p.paramName] = JSON.parse(p.paramVal);
    } catch {
      obj[p.paramName] = p.paramVal;
    }
  });

  return obj;
};

/**
 * Get a specific property value by name
 *
 * @param {number} xref_id - Component MySQL ID
 * @param {string} paramName - Property name
 * @returns {Promise<any|undefined>}
 */
export const getPropValue = async (xref_id, paramName) => {
  const prop = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .filter(p => p.paramName === paramName)
    .first();

  if (!prop) return undefined;

  try {
    return JSON.parse(prop.paramVal);
  } catch {
    return prop.paramVal;
  }
};

/**
 * Get property by IndexedDB ID
 *
 * @param {number} idbID - IndexedDB ID
 * @returns {Promise<Object|undefined>}
 */
export const getPropById = async (idbID) => {
  return await db.eventProps.get(idbID);
};
