import { db } from '../db/studioDb';

export const loadPropsForComponent = async (xref_id) => {
  const props = await db.eventProps
    .where('xref_id').equals(xref_id)
    .filter(p => p._dmlMethod !== "DELETE")
    .toArray();

  const propsObject = {};
  props.forEach(p => {
    try {
      propsObject[p.paramName] = JSON.parse(p.paramVal);
    } catch {
      propsObject[p.paramName] = p.paramVal;
    }
  });

  return propsObject;
};

export const updatePropValue = async (xref_id, paramName, paramVal) => {
  const existing = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .filter(p => p.paramName === paramName)
    .first();

  const valueString = typeof paramVal === 'string' ? paramVal : JSON.stringify(paramVal);

  if (existing) {
    await db.eventProps.update(existing.idbID, {
      paramVal: valueString,
      _dmlMethod: existing._dmlMethod === null ? "UPDATE" : existing._dmlMethod
    });
  } else {
    await db.eventProps.add({
      id: null, // MySQL id (will be populated after sync)
      xref_id,
      paramName,
      paramVal: valueString,
      _dmlMethod: "INSERT"
    });
  }
};

export const updateAllProps = async (xref_id, propsObject) => {
  for (const [paramName, paramVal] of Object.entries(propsObject)) {
    await updatePropValue(xref_id, paramName, paramVal);
  }
};

export const deleteProp = async (xref_id, paramName) => {
  const existing = await db.eventProps
    .where('xref_id')
    .equals(xref_id)
    .filter(p => p.paramName === paramName)
    .first();

  if (existing) {
    if (existing._dmlMethod === "INSERT") {
      await db.eventProps.delete(existing.idbID);
    } else {
      await db.eventProps.update(existing.idbID, {
        _dmlMethod: "DELETE"
      });
    }
  }
};
