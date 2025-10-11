import { db } from '../db/studioDb';

const SERVER_URL = 'http://localhost:3001';

export const savePropsToMySQL = async (xref_id) => {
  const props = await db.eventProps
    .where('xref_id').equals(xref_id)
    .filter(p => p._dmlMethod !== null)
    .toArray();

  if (props.length === 0) return [];

  const results = [];

  const allProps = await db.eventProps.where('xref_id').equals(xref_id).toArray();
  const propsObject = {};

  allProps.forEach(p => {
    if (p._dmlMethod !== "DELETE") {
      try {
        propsObject[p.paramName] = JSON.parse(p.paramVal);
      } catch {
        propsObject[p.paramName] = p.paramVal;
      }
    }
  });

  try {
    const response = await fetch(`${SERVER_URL}/api/execDML`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'UPDATE',
        table: 'api_wf.eventComp_xref',
        data: {
          id: xref_id,
          props: JSON.stringify(propsObject)
        },
        userID: 'studio'
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to save props to MySQL');
    }

    await db.eventProps
      .where('xref_id').equals(xref_id)
      .modify({ _dmlMethod: null });

    results.push(`UPDATE props for xref ${xref_id}`);

  } catch (error) {
    console.error(`❌ Failed to save props for ${xref_id}:`, error);
    throw error;
  }

  return results;
};
