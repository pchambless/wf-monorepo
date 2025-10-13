import { db } from '../../studioDb.js';

/**
 * Delete component from IndexedDB
 * Marks for deletion with _dmlMethod: 'DELETE'
 * Actual MySQL delete happens via syncOps.js
 *
 * @param {number} idbID - IndexedDB ID
 * @param {Object} options - Delete options
 * @param {boolean} options.cascade - If true, delete children (default: false)
 * @param {boolean} options.orphan - If true, orphan children by setting parent_id=null (default: false)
 */
export const deleteComponent = async (idbID, options = {}) => {
  const { cascade = false, orphan = false } = options;

  const component = await db.eventComp_xref.get(idbID);

  if (!component) {
    throw new Error(`Component ${idbID} not found`);
  }

  // Check for children
  const children = await db.eventComp_xref
    .filter(c => c.parent_id === component.id)
    .toArray();

  if (children.length > 0 && !cascade && !orphan) {
    throw new Error(
      `Cannot delete component ${component.comp_name}: has ${children.length} children. ` +
      `Use cascade:true to delete children or orphan:true to set their parent_id to null.`
    );
  }

  // Handle children based on strategy
  if (cascade && children.length > 0) {
    // Recursively delete children
    for (const child of children) {
      await deleteComponent(child.idbID, { cascade: true });
    }
    console.log(`✅ Cascaded delete of ${children.length} children`);
  } else if (orphan && children.length > 0) {
    // Orphan children by setting parent_id to null
    for (const child of children) {
      await db.eventComp_xref.update(child.idbID, {
        parent_id: null,
        _dmlMethod: 'UPDATE'
      });
    }
    console.log(`✅ Orphaned ${children.length} children`);
  }

  // Mark component for deletion
  await db.eventComp_xref.update(idbID, {
    _dmlMethod: 'DELETE'
  });

  console.log(`✅ Component ${idbID} marked for deletion`);
};
