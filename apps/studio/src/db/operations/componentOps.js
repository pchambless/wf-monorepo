import { db } from '../studioDb.js';

export const getComponentsByPage = async (pageID) => {
  return await db.eventComp_xref
    .where('pageID')
    .equals(pageID)
    .toArray();
};

export const getComponentById = async (idbID) => {
  return await db.eventComp_xref.get(idbID);
};

export const createComponent = async (componentData) => {
  const idbID = await db.eventComp_xref.add({
    ...componentData,
    id: null, // MySQL id not assigned yet
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateComponent = async (idbID, updates) => {
  await db.eventComp_xref.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteComponent = async (idbID) => {
  await db.eventComp_xref.update(idbID, {
    _dmlMethod: 'DELETE'
  });
};

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
