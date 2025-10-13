import { db } from '../../studioDb.js';

/**
 * Get all components for current page
 * Note: pageID param kept for API compatibility but unused
 * All components in IndexedDB are for current page (cleared on page switch)
 *
 * @param {number} pageID - Unused, kept for compatibility
 * @returns {Promise<Array>}
 */
export const getComponentsByPage = async (pageID) => {
  return await db.eventComp_xref.toArray();
};

/**
 * Get component by IndexedDB ID
 *
 * @param {number} idbID - IndexedDB ID
 * @returns {Promise<Object|undefined>}
 */
export const getComponentByIdbId = async (idbID) => {
  return await db.eventComp_xref.get(idbID);
};

/**
 * Get component by MySQL ID
 *
 * @param {number} id - MySQL ID
 * @returns {Promise<Object|undefined>}
 */
export const getComponentById = async (id) => {
  return await db.eventComp_xref.where('id').equals(id).first();
};

/**
 * Get component hierarchy as tree structure
 *
 * @param {number} pageID - Unused, kept for compatibility
 * @returns {Promise<Array>} Tree with children arrays
 */
export const getComponentHierarchy = async (pageID) => {
  const components = await getComponentsByPage(pageID);

  // Build tree structure from flat array
  const buildTree = (parentId = null) => {
    return components
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        ...c,
        children: buildTree(c.id)
      }));
  };

  return buildTree(null);
};

/**
 * Get children of a component
 *
 * @param {number} parentId - Parent's MySQL ID
 * @returns {Promise<Array>}
 */
export const getComponentChildren = async (parentId) => {
  return await db.eventComp_xref
    .filter(c => c.parent_id === parentId)
    .toArray();
};
