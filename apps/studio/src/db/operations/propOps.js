import { db } from '../studioDb.js';

export const getPropsByXrefId = async (xref_id) => {
  return await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .toArray();
};

export const getPropByIdbID = async (idbID) => {
  return await db.eventProps.get(idbID);
};

export const createProp = async (propData) => {
  const idbID = await db.eventProps.add({
    ...propData,
    id: null, // MySQL id not assigned yet
    _dmlMethod: 'INSERT'
  });
  return idbID;
};

export const updateProp = async (idbID, updates) => {
  await db.eventProps.update(idbID, {
    ...updates,
    _dmlMethod: 'UPDATE'
  });
};

export const deleteProp = async (idbID) => {
  const prop = await db.eventProps.get(idbID);

  if (!prop.id) {
    // Never synced to MySQL, just delete locally
    await db.eventProps.delete(idbID);
  } else {
    // Mark for deletion in MySQL
    await db.eventProps.update(idbID, {
      _dmlMethod: 'DELETE'
    });
  }
};

export const getPropsAsObject = async (xref_id) => {
  const props = await getPropsByXrefId(xref_id);
  return props.reduce((acc, prop) => {
    acc[prop.paramName] = prop.paramVal;
    return acc;
  }, {});
};
